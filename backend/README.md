# CompliYUG Backend

Express.js compliance engine — the live integration layer behind the DPDP Act & ISO Compliance Copilot Agent.

Runs on Node 24. Serves the web dashboard at `/` and all API routes at `/api/`.

## Start

```bash
npm install
copy .env.example .env   # fill in values
npm start                # http://localhost:3000
```

`npm start` uses `node --env-file=.env` (Node 24 native, no dotenv package needed).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port number (default: 3000) |
| `TEAMS_WEBHOOK_URL` | For alerts | Teams Incoming Webhook URL |
| `GRAPH_TENANT_ID` | For scan | Azure AD tenant ID |
| `GRAPH_CLIENT_ID` | For scan | App registration client ID |
| `GRAPH_CLIENT_SECRET` | For scan | App registration secret |
| `GRAPH_USER_ID` | Optional | User principal for mail scans |
| `GRAPH_DRIVE_ID` | Optional | Drive ID for file scans |
| `GRAPH_NOTIFICATION_SENDER` | Optional | Sender UPN for mail notifications |
| `BOARD_NOTIFICATION_EMAIL` | For breach email | Data Protection Board contact |
| `FOUNDRY_RUN_URL` | For Foundry IQ | Azure AI Foundry endpoint |
| `FOUNDRY_API_KEY` | For Foundry IQ | Foundry API key |
| `RISK_ALERT_THRESHOLD` | No | Score to trigger Teams alert (default: 70) |

## API Routes

### `GET /api/health`
Returns service readiness and timestamp.

### `GET /api/dashboard`
Returns compliance KPIs and recent activity feed from the in-memory store.

### `POST /api/classify`
Classify document content for PII and compliance risk.

```json
{
  "text": "Employee Aadhaar: 1234 5678 9012, PAN: ABCDE1234F",
  "source": "HR SharePoint",
  "sendTeamsAlert": true
}
```

Returns: `classificationLabel`, `riskScore`, `riskLevel`, `piiFindings` (masked), `dpdpObligations`, `recommendedActions`.

### `POST /api/gap-analysis`
Analyse policy text against 47 ISO 27001:2022 controls and 17 DPDP Act requirements.

```json
{
  "policyText": "We enforce MFA via Entra ID. AES-256 encryption at rest...",
  "evidenceItems": [],
  "sendTeamsAlert": true
}
```

Returns: `overallCompliancePercent`, `iso27001` (controls with status + remediation), `dpdp` (requirements with status + remediation), `criticalGaps`.

### `POST /api/breach/notify`
DPDP Act Section 40 breach notification workflow.

```json
{
  "natureOfBreach": "Unauthorised access to employee database",
  "extentOfBreach": "850 records including Aadhaar and PAN",
  "timing": "2026-06-10T14:30:00Z",
  "location": "Azure SQL — HR schema",
  "likelyImpact": "Identity misuse, financial fraud risk",
  "sendTeamsAlert": true,
  "sendBoardEmail": false,
  "sendDataPrincipalEmails": false
}
```

Returns: `reportDeadline`, `hoursRemaining`, board alert artifacts, data principal notification template, dispatch status.

### `POST /api/scan`
Microsoft Graph evidence scan + Foundry IQ risk scoring.

```json
{
  "query": "personal data aadhaar",
  "userId": "user@contoso.com",
  "maxResults": 10
}
```

Returns: `riskScore`, `riskLevel`, `reasoning`, evidence items from mail and drive, `alertSent`.

### `GET /api/audit-report`
Returns a structured JSON audit report from all session activity.

### `GET /api/audit-report/csv`
Downloads a CSV audit report with `Content-Disposition: attachment`.

## Services

| File | Description |
|---|---|
| `classifier.js` | 8 Indian PII patterns + 20 sensitive keywords → classification label + risk score |
| `gapAnalyzer.js` | 47 ISO 27001:2022 controls + 17 DPDP requirements, each with keyword matching and remediation |
| `auditReport.js` | Generates JSON report + RFC-4180 CSV |
| `foundry.js` | Azure AI Foundry risk scoring adapter with local keyword fallback |
| `graph.js` | Microsoft Graph: search mail and drive items |
| `teams.js` | Teams MessageCard builder: breach card (red), risk alert card, classify alert card |
| `workflows.js` | DPDP breach artifact generator (board alert, data principal notification, 72-hour deadline) |
| `store.js` | In-memory singleton store (resets on restart — suitable for demo/hackathon) |

## Dashboard

Five-tab web UI at `http://localhost:3000/`:

1. **Overview** — KPI cards, framework progress bars, activity feed
2. **Classify Data** — Paste content → PII table, badges, DPDP obligations
3. **Gap Analysis** — Policy text → ISO + DPDP tables with filterable gaps
4. **Breach Alerts** — Form → 72-hour SLA workflow, Teams dispatch
5. **Audit Report** — Full report view + CSV download
