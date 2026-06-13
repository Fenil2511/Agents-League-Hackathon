const { Router } = require('express');
const { searchMailMessages, searchDriveItems, sendMailNotifications } = require('../services/graph');
const { scoreWithFoundry } = require('../services/foundry');
const { sendTeamsAlert, breachCard, riskAlertCard, classifyAlertCard } = require('../services/teams');
const { buildBreachArtifacts } = require('../services/workflows');
const { classifyText } = require('../services/classifier');
const { analyzeGaps } = require('../services/gapAnalyzer');
const { generateAuditReport, reportToCsv } = require('../services/auditReport');
const store = require('../store');

function createComplianceRouter(config) {
  const router = Router();

  // ── Health ────────────────────────────────────────────────────────────────
  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'compliyug-compliance-backend', timestamp: new Date().toISOString() });
  });

  // ── Dashboard stats ───────────────────────────────────────────────────────
  router.get('/dashboard', (_req, res) => {
    res.json(store.getDashboardStats());
  });

  // ── Compliance scan (M365 evidence + risk scoring) ────────────────────────
  router.post('/scan', async (req, res) => {
    try {
      const { query, userId, driveId, maxResults = 5 } = req.body;
      if (!query) return res.status(400).json({ error: 'query is required' });

      const graphConfig = { ...config.graph, userId: userId || config.graph.userId, driveId: driveId || config.graph.driveId };
      const [mailEvidence, driveEvidence] = await Promise.all([
        searchMailMessages(graphConfig, query, maxResults).catch(() => []),
        searchDriveItems(graphConfig, query, maxResults).catch(() => []),
      ]);

      const evidence = [...mailEvidence, ...driveEvidence];
      const evidenceSummary = evidence.map(e => e.preview || e.filename || '').join(' ');
      const { riskScore, riskLevel, reasoning } = await scoreWithFoundry(config.foundry, evidence, query);

      let alertSent = false;
      if (riskScore >= config.riskAlertThreshold) {
        const alert = riskAlertCard({ query, riskScore, riskLevel, evidenceCount: evidence.length });
        const result = await sendTeamsAlert(config.teams.webhookUrl, alert);
        alertSent = result.sent;
      }

      const scanResult = { query, evidenceCount: evidence.length, riskScore, riskLevel, reasoning, evidence, evidenceSummary, alertSent };
      store.addScan(scanResult);

      res.json(scanResult);
    } catch (err) {
      console.error('[scan]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── PII Data Classification ───────────────────────────────────────────────
  router.post('/classify', async (req, res) => {
    try {
      const { text, source, sendTeamsAlert: notify } = req.body;
      if (!text) return res.status(400).json({ error: 'text is required' });

      const result = classifyText(text);
      store.addClassification({ ...result, source: source || 'manual input' });

      if (notify && result.riskScore >= 40) {
        const alert = classifyAlertCard({
          classificationLabel: result.classificationLabel,
          riskScore: result.riskScore,
          piiCount: result.totalPiiInstances,
          location: source,
        });
        await sendTeamsAlert(config.teams.webhookUrl, alert).catch(() => {});
      }

      res.json(result);
    } catch (err) {
      console.error('[classify]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Gap Analysis (ISO 27001 + DPDP) ──────────────────────────────────────
  router.post('/gap-analysis', async (req, res) => {
    try {
      const { policyText = '', evidenceItems = [], sendTeamsAlert: notify } = req.body;
      const result = analyzeGaps(policyText, evidenceItems);
      store.addGapAnalysis(result);

      if (notify && result.criticalGaps.length > 0) {
        await sendTeamsAlert(config.teams.webhookUrl, {
          card: {
            title: `📋 Gap Analysis Complete — ${result.criticalGaps.length} Critical Gaps Found`,
            summary: `Overall compliance: ${result.overallCompliancePercent}%`,
            themeColor: result.overallCompliancePercent < 60 ? 'E02424' : 'D97706',
            facts: [
              ['Overall Compliance', `${result.overallCompliancePercent}%`],
              ['ISO 27001 Compliance', `${result.iso27001.compliancePercent}%`],
              ['DPDP Compliance', `${result.dpdp.compliancePercent}%`],
              ['Critical Gaps', result.criticalGaps.length],
              ['ISO Gaps', result.iso27001.gaps],
              ['DPDP Gaps', result.dpdp.gaps],
            ],
          },
        }).catch(() => {});
      }

      res.json(result);
    } catch (err) {
      console.error('[gap-analysis]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Breach Notification ───────────────────────────────────────────────────
  router.post('/breach/notify', async (req, res) => {
    try {
      const payload = req.body;
      const artifacts = buildBreachArtifacts(payload);

      const senderUserId = config.graph.notificationSender || config.graph.userId;
      const boardRecipient = config.boardNotificationEmail;
      const dataPrincipalRecipients = Array.isArray(payload.dataPrincipalEmails) ? payload.dataPrincipalEmails : [];

      const boardMessage = [
        `DPDP Act Breach Initial Alert`,
        `Nature: ${artifacts.boardInitialAlert.natureOfBreach}`,
        `Extent: ${artifacts.boardInitialAlert.extentOfBreach}`,
        `Timing: ${artifacts.boardInitialAlert.timing}`,
        `Location: ${artifacts.boardInitialAlert.location}`,
        `Likely Impact: ${artifacts.boardInitialAlert.likelyImpact}`,
        `Comprehensive report due by: ${artifacts.reportDeadline}`,
      ].join('\n');

      const principalMessage = [
        'We are notifying you of a personal data breach incident.',
        `Breach details: ${artifacts.dataPrincipalNotification.natureExtentTiming}`,
        `Potential consequences: ${artifacts.dataPrincipalNotification.consequencesRelevantToUser}`,
        `Mitigation taken: ${artifacts.dataPrincipalNotification.mitigationMeasuresTaken}`,
        `Safety actions for you: ${artifacts.dataPrincipalNotification.userSafetyActions}`,
        `Contact: ${artifacts.dataPrincipalNotification.dpoContact}`,
      ].join('\n');

      let teamsAlert = { sent: false, reason: 'skipped' };
      if (payload.sendTeamsAlert !== false) {
        const alert = breachCard({
          natureOfBreach: payload.natureOfBreach,
          extentOfBreach: payload.extentOfBreach,
          location: payload.location,
          reportDeadline: artifacts.reportDeadline,
          hoursRemaining: artifacts.hoursRemaining,
        });
        teamsAlert = await sendTeamsAlert(config.teams.webhookUrl, alert);
      }

      let boardMailResult = { sent: false, reason: 'skipped' };
      if (payload.sendBoardEmail === true && boardRecipient) {
        boardMailResult = await sendMailNotifications(config.graph, senderUserId, [boardRecipient], 'DPDP breach initial alert', boardMessage);
      }

      let principalMailResult = { sent: false, reason: 'skipped' };
      if (payload.sendDataPrincipalEmails === true && dataPrincipalRecipients.length) {
        principalMailResult = await sendMailNotifications(config.graph, senderUserId, dataPrincipalRecipients, 'Important notice regarding your personal data', principalMessage);
      }

      const notifyResult = {
        workflow: 'DPDP_Breach_Notification',
        detectedAt: artifacts.detectedAt,
        reportDeadline: artifacts.reportDeadline,
        hoursRemaining: artifacts.hoursRemaining,
        initialAlertRequiredNow: artifacts.initialAlertRequiredNow,
        extensionRequestRequired: artifacts.extensionRequestRequired,
        artifacts,
        dispatch: { teamsAlert, boardMail: boardMailResult, dataPrincipalMail: principalMailResult },
      };

      store.addBreachNotification({
        natureOfBreach: payload.natureOfBreach,
        extentOfBreach: payload.extentOfBreach,
        location: payload.location,
        reportDeadline: artifacts.reportDeadline,
        hoursRemaining: artifacts.hoursRemaining,
        dispatch: notifyResult.dispatch,
      });

      res.json(notifyResult);
    } catch (err) {
      console.error('[breach/notify]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Audit Report (JSON) ───────────────────────────────────────────────────
  router.get('/audit-report', (_req, res) => {
    const latestGap = store.gapAnalyses[0] ?? null;
    const report = generateAuditReport({
      orgName: 'CompliYUG Demo Organization',
      scanResults: store.scans,
      gapAnalysis: latestGap,
      breachNotifications: store.breachNotifications,
      classificationResults: store.classifications,
    });
    res.json(report);
  });

  // ── Audit Report (CSV download) ───────────────────────────────────────────
  router.get('/audit-report/csv', (_req, res) => {
    const latestGap = store.gapAnalyses[0] ?? null;
    const report = generateAuditReport({
      orgName: 'CompliYUG Demo Organization',
      scanResults: store.scans,
      gapAnalysis: latestGap,
      breachNotifications: store.breachNotifications,
      classificationResults: store.classifications,
    });
    const csv = reportToCsv(report);
    const filename = `compliyug-audit-report-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  });

  return router;
}

module.exports = { createComplianceRouter };
