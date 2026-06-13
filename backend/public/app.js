const API = '/api';

// ── Tab navigation ──────────────────────────────────────────────────────────
const PAGE_TITLES = { overview: 'Overview', classify: 'PII Data Classification', gap: 'Gap Analysis', breach: 'Breach Notification', report: 'Audit Report' };

function switchTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${id}`).classList.add('active');
  document.querySelector(`[data-tab="${id}"]`).classList.add('active');
  document.getElementById('page-title').textContent = PAGE_TITLES[id] || id;
  if (id === 'overview') loadDashboard();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ── Helpers ─────────────────────────────────────────────────────────────────
function badge(text, cls) {
  return `<span class="badge ${cls}">${text}</span>`;
}

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function riskBadge(level) {
  const map = { high: 'critical', medium: 'medium', low: 'low' };
  return badge(level?.toUpperCase() ?? '—', map[level] ?? 'medium');
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> Processing…`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.orig || btn.innerHTML;
    btn.disabled = false;
  }
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ── Dashboard / Overview ────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const stats = await apiFetch('/dashboard');

    // KPI cards
    setText('kpi-scans', stats.totalScans);
    setText('kpi-risk', stats.averageRiskScore || '—');
    setText('kpi-compliance', stats.overallCompliancePercent != null ? `${stats.overallCompliancePercent}%` : '—');
    setText('kpi-gaps', stats.criticalGaps != null ? stats.criticalGaps : '—');

    // Risk card color
    const riskCard = document.getElementById('kpi-risk-card');
    riskCard.className = 'kpi-card ' + (stats.riskLevel === 'high' ? 'danger' : stats.riskLevel === 'medium' ? 'warning' : 'success');
    setText('kpi-risk-level', stats.riskLevel ? stats.riskLevel.toUpperCase() + ' risk' : 'No data');

    // Compliance color
    const compCard = document.getElementById('kpi-compliance-card');
    const pct = stats.overallCompliancePercent;
    compCard.className = 'kpi-card ' + (pct == null ? '' : pct >= 70 ? 'success' : pct >= 50 ? 'warning' : 'danger');

    // Gaps color
    const gapCard = document.getElementById('kpi-gaps-card');
    gapCard.className = 'kpi-card ' + (stats.criticalGaps > 0 ? 'danger' : stats.criticalGaps === 0 ? 'success' : '');

    // Progress bars
    const isoPct = stats.isoCompliancePercent ?? 0;
    const dpdpPct = stats.dpdpCompliancePercent ?? 0;
    document.getElementById('iso-bar').style.width = isoPct + '%';
    document.getElementById('dpdp-bar').style.width = dpdpPct + '%';
    setText('iso-pct-label', isoPct ? `${isoPct}%` : '—');
    setText('dpdp-pct-label', dpdpPct ? `${dpdpPct}%` : '—');

    // Activity feed
    const feed = document.getElementById('activity-feed');
    if (stats.recentActivity?.length > 0) {
      feed.innerHTML = stats.recentActivity.map(a => `
        <div class="activity-item">
          <div class="activity-dot ${a.type}"></div>
          <div>
            <div class="activity-text">${escHtml(a.label)}</div>
            <div class="activity-time">${relTime(a.timestamp)} · ${a.id}</div>
          </div>
        </div>
      `).join('');
    } else {
      feed.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:16px 0;text-align:center">No activity yet.</div>';
    }
  } catch (e) {
    console.warn('Dashboard load failed:', e.message);
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Classify ────────────────────────────────────────────────────────────────
async function runClassify() {
  const text   = document.getElementById('classify-text').value.trim();
  const source = document.getElementById('classify-source').value.trim();
  const notify = document.getElementById('classify-teams').checked;
  if (!text) { alert('Please paste document content to classify.'); return; }

  setLoading('classify-btn', true);
  try {
    const r = await apiFetch('/classify', {
      method: 'POST',
      body: JSON.stringify({ text, source: source || undefined, sendTeamsAlert: notify }),
    });

    const card = document.getElementById('classify-result-card');
    card.style.display = 'block';

    const labelCls = r.classificationLabel?.toLowerCase().replace(/[^a-z]/g,'') || 'internal';
    const levelCls = r.riskLevel || 'low';

    card.querySelector('#classify-result').innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
        ${badge(r.classificationLabel, labelCls)}
        ${riskBadge(r.riskLevel)}
        <span style="font-size:13px;color:var(--text-muted)">Risk score: <strong>${r.riskScore}/100</strong></span>
      </div>

      ${r.piiFindings.length > 0 ? `
      <div class="card-header" style="margin-bottom:8px">PII Detected (${r.totalPiiInstances} instances)</div>
      <div class="table-wrap" style="margin-bottom:16px">
        <table>
          <thead><tr><th>Type</th><th>Count</th><th>Severity</th><th>DPDP Ref</th><th>ISO Ref</th><th>Sample</th></tr></thead>
          <tbody>
            ${r.piiFindings.map(f => `
              <tr>
                <td><strong>${escHtml(f.label)}</strong></td>
                <td>${f.count}</td>
                <td>${badge(f.severity, f.severity)}</td>
                <td style="font-size:11px;color:var(--text-muted)">${escHtml(f.dpdpReference)}</td>
                <td style="font-size:11px;color:var(--text-muted)">${escHtml(f.isoReference)}</td>
                <td style="font-family:monospace;font-size:12px">${f.maskedSamples.map(s => escHtml(s)).join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : '<div class="alert alert-success">✅ No PII patterns detected in this content.</div>'}

      ${r.sensitiveKeywords.length > 0 ? `
      <div class="card-header" style="margin-bottom:8px">Sensitive Keywords</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
        ${r.sensitiveKeywords.map(k => badge(escHtml(k.keyword), k.severity)).join('')}
      </div>` : ''}

      ${r.recommendedActions.length > 0 ? `
      <div class="card-header" style="margin-bottom:8px">Recommended Actions</div>
      <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.7">
        ${r.recommendedActions.map(a => `<li>${escHtml(a)}</li>`).join('')}
      </ul>` : ''}

      ${r.dpdpObligations.length > 0 ? `
      <div class="alert alert-warning" style="margin-top:16px">
        <div><strong>DPDP Act Obligations:</strong><br>
        ${r.dpdpObligations.map(o => `• ${escHtml(o)}`).join('<br>')}
        </div>
      </div>` : ''}
    `;
  } catch (e) {
    showError('classify-result-card', 'classify-result', e.message);
  } finally {
    setLoading('classify-btn', false);
  }
}

function showError(cardId, resultId, msg) {
  const card = document.getElementById(cardId);
  if (card) card.style.display = 'block';
  const result = document.getElementById(resultId);
  if (result) result.innerHTML = `<div class="alert alert-danger">❌ Error: ${escHtml(msg)}</div>`;
}

// ── Gap Analysis ─────────────────────────────────────────────────────────────
let gapData = null;

async function runGapAnalysis() {
  const policyText = document.getElementById('gap-text').value.trim();
  const notify     = document.getElementById('gap-teams').checked;

  setLoading('gap-btn', true);
  try {
    gapData = await apiFetch('/gap-analysis', {
      method: 'POST',
      body: JSON.stringify({ policyText, sendTeamsAlert: notify }),
    });

    document.getElementById('gap-result').style.display = 'block';

    // Summary cards
    document.getElementById('gap-summary').innerHTML = `
      <div class="kpi-card ${gapData.overallCompliancePercent >= 70 ? 'success' : gapData.overallCompliancePercent >= 50 ? 'warning' : 'danger'}">
        <div class="kpi-label">Overall Compliance</div>
        <div class="kpi-value">${gapData.overallCompliancePercent}%</div>
        <div class="kpi-sub">ISO + DPDP combined</div>
      </div>
      <div class="kpi-card ${gapData.iso27001.compliancePercent >= 70 ? 'success' : 'warning'}">
        <div class="kpi-label">ISO 27001:2022</div>
        <div class="kpi-value">${gapData.iso27001.compliancePercent}%</div>
        <div class="kpi-sub">${gapData.iso27001.compliant}/${gapData.iso27001.total} controls compliant</div>
      </div>
      <div class="kpi-card ${gapData.dpdp.compliancePercent >= 70 ? 'success' : 'warning'}">
        <div class="kpi-label">DPDP Act 2023</div>
        <div class="kpi-value">${gapData.dpdp.compliancePercent}%</div>
        <div class="kpi-sub">${gapData.dpdp.compliant}/${gapData.dpdp.total} requirements met</div>
      </div>
    `;

    renderIsoTable(gapData.iso27001.controls);
    renderDpdpTable(gapData.dpdp.requirements);
  } catch (e) {
    document.getElementById('gap-result').style.display = 'block';
    document.getElementById('gap-summary').innerHTML = `<div class="alert alert-danger" style="grid-column:1/-1">❌ ${escHtml(e.message)}</div>`;
  } finally {
    setLoading('gap-btn', false);
  }
}

function renderIsoTable(controls) {
  document.getElementById('iso-table').innerHTML = controls.map(c => `
    <tr>
      <td><strong>${escHtml(c.id)}</strong>${c.critical ? ' <span style="color:#ef4444;font-size:10px">★ CRITICAL</span>' : ''}</td>
      <td>${escHtml(c.name)}</td>
      <td><span style="font-size:11px;color:var(--text-muted)">${escHtml(c.domain)}</span></td>
      <td>${badge(c.status, c.status)}</td>
      <td style="font-size:12px;color:var(--text-muted);max-width:280px">${c.remediation ? escHtml(c.remediation) : '—'}</td>
    </tr>
  `).join('');
}

function renderDpdpTable(reqs) {
  document.getElementById('dpdp-table').innerHTML = reqs.map(r => `
    <tr>
      <td><strong>${escHtml(r.section)}</strong>${r.critical ? ' <span style="color:#ef4444;font-size:10px">★ CRITICAL</span>' : ''}</td>
      <td>${escHtml(r.name)}</td>
      <td>${badge(r.status, r.status)}</td>
      <td style="font-size:12px;color:var(--text-muted);max-width:280px">${r.remediation ? escHtml(r.remediation) : '—'}</td>
    </tr>
  `).join('');
}

function filterGap(framework, status) {
  if (!gapData) return;
  if (framework === 'iso') {
    const list = status === 'gap' ? gapData.iso27001.controls.filter(c => c.status === 'gap') : gapData.iso27001.controls;
    renderIsoTable(list);
  } else {
    const list = status === 'gap' ? gapData.dpdp.requirements.filter(r => r.status === 'gap') : gapData.dpdp.requirements;
    renderDpdpTable(list);
  }
}

// ── Breach Notification ──────────────────────────────────────────────────────
async function runBreach() {
  const timing = document.getElementById('b-timing').value;
  const payload = {
    natureOfBreach:         document.getElementById('b-nature').value.trim(),
    extentOfBreach:         document.getElementById('b-extent').value.trim(),
    timing:                 timing ? new Date(timing).toISOString() : new Date().toISOString(),
    location:               document.getElementById('b-location').value.trim(),
    likelyImpact:           document.getElementById('b-impact').value.trim(),
    sendTeamsAlert:         document.getElementById('b-teams').checked,
    sendBoardEmail:         document.getElementById('b-board').checked,
    sendDataPrincipalEmails: document.getElementById('b-principals').checked,
  };

  if (!payload.natureOfBreach) { alert('Nature of breach is required.'); return; }

  setLoading('breach-btn', true);
  try {
    const r = await apiFetch('/breach/notify', { method: 'POST', body: JSON.stringify(payload) });

    const card = document.getElementById('breach-result-card');
    card.style.display = 'block';

    const hoursClass = r.hoursRemaining <= 24 ? 'danger' : r.hoursRemaining <= 48 ? 'warning' : 'success';

    document.getElementById('breach-result').innerHTML = `
      <div class="alert alert-danger" style="margin-bottom:16px">🚨 Breach workflow initiated — ${r.hoursRemaining}h remaining to file with Data Protection Board</div>

      <div class="grid-2" style="margin-bottom:16px">
        <div>
          <div class="card-header">Timeline</div>
          <div style="margin-top:8px;font-size:13px;line-height:1.8">
            <div>📅 <strong>Detected:</strong> ${new Date(r.detectedAt).toLocaleString()}</div>
            <div>⏰ <strong>Report deadline:</strong> ${new Date(r.reportDeadline).toLocaleString()}</div>
            <div>⌛ <strong>Hours remaining:</strong> ${badge(r.hoursRemaining + 'h', hoursClass)}</div>
          </div>
        </div>
        <div>
          <div class="card-header">Dispatch Status</div>
          <div style="margin-top:8px;font-size:13px;line-height:1.8">
            <div>📣 Teams alert: ${r.dispatch.teamsAlert?.sent ? badge('Sent','compliant') : badge('Skipped','medium')}</div>
            <div>📧 Board email: ${r.dispatch.boardMail?.sent ? badge('Sent','compliant') : badge('Skipped','medium')}</div>
            <div>👤 Principal email: ${r.dispatch.dataPrincipalMail?.sent ? badge('Sent','compliant') : badge('Skipped','medium')}</div>
          </div>
        </div>
      </div>

      <div class="card-header" style="margin-bottom:8px">Board Initial Alert (DPDP Section 40)</div>
      <div class="table-wrap">
        <table>
          <tbody>
            <tr><td style="font-weight:600;width:160px">Nature of Breach</td><td>${escHtml(r.artifacts.boardInitialAlert.natureOfBreach)}</td></tr>
            <tr><td style="font-weight:600">Extent</td><td>${escHtml(r.artifacts.boardInitialAlert.extentOfBreach)}</td></tr>
            <tr><td style="font-weight:600">Location</td><td>${escHtml(r.artifacts.boardInitialAlert.location)}</td></tr>
            <tr><td style="font-weight:600">Likely Impact</td><td>${escHtml(r.artifacts.boardInitialAlert.likelyImpact)}</td></tr>
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    showError('breach-result-card', 'breach-result', e.message);
  } finally {
    setLoading('breach-btn', false);
  }
}

// ── Audit Report ─────────────────────────────────────────────────────────────
async function loadReport() {
  try {
    const r = await apiFetch('/audit-report');

    document.getElementById('report-placeholder').style.display = 'none';
    document.getElementById('report-content').style.display = 'block';

    const es = r.executiveSummary;
    document.getElementById('report-kpis').innerHTML = `
      <div class="kpi-card ${es.overallComplianceScore >= 70 ? 'success' : es.overallComplianceScore >= 50 ? 'warning' : 'danger'}">
        <div class="kpi-label">Overall Compliance</div>
        <div class="kpi-value">${es.overallComplianceScore != null ? es.overallComplianceScore + '%' : '—'}</div>
        <div class="kpi-sub">ISO 27001 + DPDP</div>
      </div>
      <div class="kpi-card ${es.riskLevel === 'High' ? 'danger' : es.riskLevel === 'Medium' ? 'warning' : 'success'}">
        <div class="kpi-label">Avg Risk Score</div>
        <div class="kpi-value">${es.averageRiskScore || '—'}</div>
        <div class="kpi-sub">${es.riskLevel || ''} risk</div>
      </div>
      <div class="kpi-card ${es.criticalGapsCount > 0 ? 'danger' : 'success'}">
        <div class="kpi-label">Critical Gaps</div>
        <div class="kpi-value">${es.criticalGapsCount ?? '—'}</div>
        <div class="kpi-sub">Require immediate action</div>
      </div>
      <div class="kpi-card primary">
        <div class="kpi-label">Breaches Filed</div>
        <div class="kpi-value">${es.breachNotificationsFiled}</div>
        <div class="kpi-sub">Total notifications</div>
      </div>
    `;

    // ISO summary
    const iso = r.isoCompliance;
    document.getElementById('report-iso-summary').innerHTML = iso ? `
      <div class="card-header">ISO 27001:2022</div>
      <div class="meter-wrap">
        <div class="meter-value" style="color:${iso.compliancePercent >= 70 ? 'var(--success)' : iso.compliancePercent >= 50 ? 'var(--warning)' : 'var(--danger)'}">${iso.compliancePercent}%</div>
        <div class="meter-label">${iso.compliant} / ${iso.total} controls compliant · ${iso.gaps} gaps</div>
      </div>
      <div class="progress"><div class="progress-bar ${iso.compliancePercent >= 70 ? 'success' : iso.compliancePercent >= 50 ? 'warning' : 'danger'}" style="width:${iso.compliancePercent}%"></div></div>
    ` : '<div style="color:var(--text-muted);font-size:13px">Run a gap analysis to populate ISO data.</div>';

    const dpdp = r.dpdpCompliance;
    document.getElementById('report-dpdp-summary').innerHTML = dpdp ? `
      <div class="card-header">DPDP Act 2023</div>
      <div class="meter-wrap">
        <div class="meter-value" style="color:${dpdp.compliancePercent >= 70 ? 'var(--success)' : dpdp.compliancePercent >= 50 ? 'var(--warning)' : 'var(--danger)'}">${dpdp.compliancePercent}%</div>
        <div class="meter-label">${dpdp.compliant} / ${dpdp.total} requirements met · ${dpdp.gaps} gaps</div>
      </div>
      <div class="progress"><div class="progress-bar ${dpdp.compliancePercent >= 70 ? 'success' : dpdp.compliancePercent >= 50 ? 'warning' : 'danger'}" style="width:${dpdp.compliancePercent}%"></div></div>
    ` : '<div style="color:var(--text-muted);font-size:13px">Run a gap analysis to populate DPDP data.</div>';

    // Recommendations
    const PRIORITY_COLOR = { Critical: 'danger', High: 'high', Medium: 'medium' };
    document.getElementById('report-recs').innerHTML = r.topRecommendations.map(rec => `
      <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);align-items:flex-start">
        ${badge(rec.priority, PRIORITY_COLOR[rec.priority] || 'medium')}
        <div style="flex:1">
          <div style="font-size:13px">${escHtml(rec.action)}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${escHtml(rec.framework)}</div>
        </div>
      </div>
    `).join('');

    document.getElementById('report-meta').innerHTML = `
      Report ID: <strong>${r.reportId}</strong> &nbsp;·&nbsp;
      Generated: <strong>${new Date(r.generatedAt).toLocaleString()}</strong> &nbsp;·&nbsp;
      Period: <strong>${r.reportPeriod.from}</strong> to <strong>${r.reportPeriod.to}</strong><br>
      <span style="margin-top:8px;display:block;font-size:11px">${escHtml(r.disclaimer)}</span>
    `;
  } catch (e) {
    document.getElementById('report-placeholder').innerHTML = `<div class="alert alert-danger">❌ ${escHtml(e.message)}</div>`;
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────
loadDashboard();

// Set default breach timing to now
const btiming = document.getElementById('b-timing');
if (btiming) btiming.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

// Auto-refresh overview every 30s when visible
setInterval(() => {
  if (document.getElementById('tab-overview').classList.contains('active')) loadDashboard();
}, 30000);
