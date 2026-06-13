async function sendTeamsAlert(webhookUrl, payload) {
  if (!webhookUrl) {
    return { sent: false, reason: 'TEAMS_WEBHOOK_URL is not configured.' };
  }

  const body = payload.card
    ? buildMessageCard(payload.card)
    : { text: payload.text };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Teams alert failed: ${response.status} ${details}`);
  }

  return { sent: true };
}

function buildMessageCard({ title, summary, themeColor = 'FF6B35', facts = [], sections = [] }) {
  return {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    summary: summary || title,
    themeColor,
    title,
    sections: [
      ...(facts.length > 0 ? [{ facts: facts.map(([name, value]) => ({ name, value: String(value) })) }] : []),
      ...sections,
    ],
  };
}

function breachCard({ natureOfBreach, extentOfBreach, location, reportDeadline, hoursRemaining }) {
  return {
    card: {
      title: '⚠️ DPDP Data Breach Notification — CompliYUG',
      summary: 'DPDP Act breach workflow triggered',
      themeColor: 'E02424',
      facts: [
        ['Nature of Breach', natureOfBreach || 'Not specified'],
        ['Extent', extentOfBreach || 'Not specified'],
        ['Location', location || 'Not specified'],
        ['Report Deadline (72h SLA)', reportDeadline || 'N/A'],
        ['Hours Remaining', `${hoursRemaining ?? '?'} hours`],
        ['Compliance Ref', 'DPDP Act Section 40 / CERT-In Guidelines'],
        ['Next Step', 'File initial alert with Data Protection Board immediately'],
      ],
    },
  };
}

function riskAlertCard({ query, riskScore, riskLevel, evidenceCount }) {
  const color = riskScore >= 70 ? 'E02424' : riskScore >= 40 ? 'D97706' : '0E9F6E';
  return {
    card: {
      title: `🔍 Compliance Risk Alert — ${(riskLevel ?? 'unknown').toUpperCase()} Risk Detected`,
      summary: `Risk score ${riskScore} detected`,
      themeColor: color,
      facts: [
        ['Query', query || 'N/A'],
        ['Risk Score', `${riskScore}/100`],
        ['Risk Level', (riskLevel ?? 'N/A').toUpperCase()],
        ['Evidence Items', evidenceCount ?? 0],
        ['Framework', 'ISO 27001:2022 / DPDP Act 2023'],
        ['Action Required', riskScore >= 70 ? 'Immediate review required' : 'Monitor and schedule review'],
      ],
    },
  };
}

function classifyAlertCard({ classificationLabel, riskScore, piiCount, location }) {
  const color = classificationLabel === 'RESTRICTED' ? 'E02424' : classificationLabel === 'CONFIDENTIAL' ? 'D97706' : '1A56DB';
  return {
    card: {
      title: `🏷️ PII Classification Alert — ${classificationLabel}`,
      summary: `PII detected in scanned content`,
      themeColor: color,
      facts: [
        ['Classification Label', classificationLabel],
        ['PII Instances Found', piiCount ?? 0],
        ['Risk Score', `${riskScore}/100`],
        ['Location', location || 'Pasted content'],
        ['DPDP Obligation', 'Data Fiduciary obligations apply — Section 8'],
        ['Action Required', 'Encrypt data, restrict access, verify consent records'],
      ],
    },
  };
}

module.exports = { sendTeamsAlert, breachCard, riskAlertCard, classifyAlertCard };
