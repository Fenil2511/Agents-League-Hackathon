import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const FILES = {
  findings: path.join(DATA_DIR, "findings.json"),
  breaches: path.join(DATA_DIR, "breaches.json"),
  auditTrail: path.join(DATA_DIR, "audit-trail.json"),
};

/* ── helpers ─────────────────────────────────────────────────────────────── */

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

function appendRecord(file, record) {
  const arr = readJson(file);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...record,
  };
  arr.unshift(entry);
  if (arr.length > 500) arr.length = 500;
  writeJson(file, arr);
  return entry;
}

/* ── Compliance policy data (read-only reference) ────────────────────────── */

const DPDP_REQUIREMENTS = [
  { id: "DPDP-S4", section: "Section 4", title: "Lawful processing of personal data", description: "Personal data may only be processed for a lawful purpose with consent or for certain legitimate uses." },
  { id: "DPDP-S5", section: "Section 5", title: "Notice to data principals", description: "Data fiduciary must give notice describing personal data collected, purpose, and rights." },
  { id: "DPDP-S6", section: "Section 6", title: "Consent management", description: "Consent must be free, specific, informed, unconditional, and unambiguous. Consent manager must be registered." },
  { id: "DPDP-S7", section: "Section 7", title: "Certain legitimate uses", description: "Processing permitted without consent for specified purposes (employment, medical emergency, etc.)." },
  { id: "DPDP-S8", section: "Section 8", title: "Obligations of data fiduciary", description: "Ensure completeness, accuracy, consistency, implement safeguards, erase data no longer needed." },
  { id: "DPDP-S9", section: "Section 9", title: "Children's data protection", description: "Verifiable consent of parent/guardian required. No tracking, behavioural monitoring, or targeted advertising." },
  { id: "DPDP-S10", section: "Section 10", title: "Significant data fiduciaries", description: "Additional obligations: DPO appointment, independent audit, DPIA, reporting." },
  { id: "DPDP-S11", section: "Section 11", title: "Right of access", description: "Data principals may request summary of personal data processed and processing activities." },
  { id: "DPDP-S12", section: "Section 12", title: "Right of correction and erasure", description: "Data principals may request correction, completion, updating, or erasure of personal data." },
  { id: "DPDP-S13", section: "Section 13", title: "Right of grievance redressal", description: "Data fiduciary must provide accessible grievance redressal mechanism." },
  { id: "DPDP-S14", section: "Section 14", title: "Right to nominate", description: "Data principals may nominate another individual to exercise rights in case of death or incapacity." },
  { id: "DPDP-S15", section: "Section 15", title: "Duties of data principal", description: "Data principals must comply with applicable laws, not file false complaints, furnish authentic information." },
  { id: "DPDP-S16", section: "Section 16", title: "Cross-border transfer", description: "Personal data may be transferred outside India except to notified restricted territories." },
  { id: "DPDP-S17", section: "Section 17", title: "Exemptions", description: "Certain exemptions for state security, research, startups, and legal proceedings." },
  { id: "DPDP-S28", section: "Section 28", title: "Data Protection Board", description: "Establishment and powers of the Data Protection Board of India." },
  { id: "DPDP-S33", section: "Section 33", title: "Penalties", description: "Penalties up to ₹250 crore for data breaches, up to ₹200 crore for children's data violations." },
  { id: "DPDP-S40", section: "Section 40", title: "Breach notification", description: "Data fiduciary must notify the Board and affected data principals of personal data breach within 72 hours." },
];

const ISO_CONTROLS_SAMPLE = [
  { id: "A.5.1", title: "Policies for information security", category: "Organizational" },
  { id: "A.5.2", title: "Information security roles and responsibilities", category: "Organizational" },
  { id: "A.5.3", title: "Segregation of duties", category: "Organizational" },
  { id: "A.5.10", title: "Acceptable use of information", category: "Organizational" },
  { id: "A.5.15", title: "Access control", category: "Organizational" },
  { id: "A.5.23", title: "Information security for cloud services", category: "Organizational" },
  { id: "A.5.24", title: "Information security incident management", category: "Organizational" },
  { id: "A.5.34", title: "Privacy and protection of PII", category: "Organizational" },
  { id: "A.6.1", title: "Screening", category: "People" },
  { id: "A.6.3", title: "Information security awareness, education, training", category: "People" },
  { id: "A.7.1", title: "Physical security perimeters", category: "Physical" },
  { id: "A.8.1", title: "User endpoint devices", category: "Technological" },
  { id: "A.8.5", title: "Secure authentication", category: "Technological" },
  { id: "A.8.9", title: "Configuration management", category: "Technological" },
  { id: "A.8.12", title: "Data leakage prevention", category: "Technological" },
  { id: "A.8.24", title: "Use of cryptography", category: "Technological" },
  { id: "A.8.25", title: "Secure development life cycle", category: "Technological" },
  { id: "A.8.28", title: "Secure coding", category: "Technological" },
];

const REGULATORY_UPDATES = [
  { id: "RU-001", date: "2025-11-18", title: "DPDP Rules 2025 published", summary: "Ministry of Electronics and IT published the Digital Personal Data Protection Rules 2025 specifying consent manager registration, breach notification form, data fiduciary obligations, and cross-border transfer restrictions.", source: "meity.gov.in", impact: "high" },
  { id: "RU-002", date: "2025-06-01", title: "Consent Manager registration process announced", summary: "Data Protection Board published the process for consent manager registration under Section 6.", source: "dpb.gov.in", impact: "medium" },
  { id: "RU-003", date: "2025-03-15", title: "Significant Data Fiduciary notification criteria draft", summary: "Central Government published draft criteria for designation of significant data fiduciaries under Section 10.", source: "meity.gov.in", impact: "high" },
  { id: "RU-004", date: "2026-01-10", title: "ISO 27001:2022 transition deadline", summary: "Organizations must transition from ISO 27001:2013 to ISO 27001:2022 by 31 October 2025. Post-deadline certifications on old standard are invalid.", source: "iso.org", impact: "high" },
  { id: "RU-005", date: "2026-04-01", title: "Children's data processing restrictions effective", summary: "Section 9 restrictions on children's data processing including parental consent verification and advertising ban become enforceable.", source: "dpb.gov.in", impact: "high" },
];

/* ── Public API ───────────────────────────────────────────────────────────── */

export function readCompliancePolicies(framework) {
  const fw = (framework || "all").toLowerCase();
  const result = {};
  if (fw === "all" || fw === "dpdp") result.dpdp = DPDP_REQUIREMENTS;
  if (fw === "all" || fw === "iso27001" || fw === "iso") result.iso27001 = ISO_CONTROLS_SAMPLE;
  addAuditEntry("read_compliance_policies", { framework: fw });
  return result;
}

export function writeComplianceFinding(finding) {
  const entry = appendRecord(FILES.findings, {
    type: "compliance_finding",
    severity: finding.severity || "medium",
    framework: finding.framework || "DPDP",
    controlId: finding.controlId || null,
    title: finding.title,
    description: finding.description || "",
    affectedAsset: finding.affectedAsset || "unknown",
    status: finding.status || "open",
    remediationPlan: finding.remediationPlan || "",
  });
  addAuditEntry("write_compliance_finding", { findingId: entry.id, severity: entry.severity });
  return entry;
}

export function readComplianceStatus() {
  const findings = readJson(FILES.findings);
  const breaches = readJson(FILES.breaches);

  const open = findings.filter((f) => f.status === "open");
  const critical = open.filter((f) => f.severity === "critical");
  const high = open.filter((f) => f.severity === "high");

  addAuditEntry("read_compliance_status", {});
  return {
    totalFindings: findings.length,
    openFindings: open.length,
    criticalOpen: critical.length,
    highOpen: high.length,
    totalBreaches: breaches.length,
    openBreaches: breaches.filter((b) => b.status !== "closed").length,
    lastUpdated: new Date().toISOString(),
    complianceHealthScore: Math.max(0, 100 - critical.length * 20 - high.length * 10 - open.length * 2),
    recentFindings: findings.slice(0, 5),
    recentBreaches: breaches.slice(0, 3),
  };
}

export function readRegulatoryUpdates(impactLevel) {
  const level = (impactLevel || "all").toLowerCase();
  const updates = level === "all" ? REGULATORY_UPDATES : REGULATORY_UPDATES.filter((u) => u.impact === level);
  addAuditEntry("read_regulatory_updates", { impactLevel: level });
  return { count: updates.length, updates };
}

export function writeBreachRecord(breach) {
  const detectedAt = breach.detectedAt || new Date().toISOString();
  const deadline = new Date(new Date(detectedAt).getTime() + 72 * 60 * 60 * 1000).toISOString();
  const entry = appendRecord(FILES.breaches, {
    type: "breach_record",
    natureOfBreach: breach.natureOfBreach,
    extentOfBreach: breach.extentOfBreach || "Under assessment",
    location: breach.location || "Not specified",
    likelyImpact: breach.likelyImpact || "Under assessment",
    detectedAt,
    reportDeadline72h: deadline,
    status: "open",
    notifiedBoard: false,
    notifiedPrincipals: false,
  });
  addAuditEntry("write_breach_record", { breachId: entry.id });
  return entry;
}

export function readAuditTrail(limit) {
  const n = Math.min(Number(limit) || 50, 200);
  const trail = readJson(FILES.auditTrail);
  return { count: trail.length, entries: trail.slice(0, n) };
}

/* ── Internal audit logger ─────────────────────────────────────────────── */

function addAuditEntry(action, details) {
  appendRecord(FILES.auditTrail, { action, details });
}
