const PII_PATTERNS = [
  {
    key: 'aadhaar',
    label: 'Aadhaar Number',
    pattern: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
    severity: 'critical',
    dpdpRef: 'Section 8, Rule 6(1)(a)',
    isoRef: 'A.5.34, A.8.24',
  },
  {
    key: 'pan',
    label: 'PAN Number',
    pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    severity: 'critical',
    dpdpRef: 'Section 8',
    isoRef: 'A.5.34',
  },
  {
    key: 'passport',
    label: 'Passport Number',
    pattern: /\b[A-PR-WY][1-9]\d{7}\b/g,
    severity: 'critical',
    dpdpRef: 'Section 8',
    isoRef: 'A.5.34',
  },
  {
    key: 'creditCard',
    label: 'Credit/Debit Card Number',
    pattern: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
    severity: 'critical',
    dpdpRef: 'Section 8, Rule 6(1)(a)',
    isoRef: 'A.5.34, A.8.24',
  },
  {
    key: 'phone',
    label: 'Indian Phone Number',
    pattern: /\b(?:\+91[\s\-]?)?[6-9]\d{9}\b/g,
    severity: 'high',
    dpdpRef: 'Section 8',
    isoRef: 'A.5.34',
  },
  {
    key: 'email',
    label: 'Email Address',
    pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
    severity: 'high',
    dpdpRef: 'Section 8',
    isoRef: 'A.5.34',
  },
  {
    key: 'ifsc',
    label: 'IFSC Code',
    pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    severity: 'medium',
    dpdpRef: 'Section 8',
    isoRef: 'A.5.34',
  },
  {
    key: 'gstin',
    label: 'GSTIN',
    pattern: /\b\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]\b/g,
    severity: 'medium',
    dpdpRef: 'Section 8',
    isoRef: 'A.5.12',
  },
];

const SENSITIVE_KEYWORDS = [
  { keyword: 'password', severity: 'critical' },
  { keyword: 'credentials', severity: 'critical' },
  { keyword: 'api key', severity: 'critical' },
  { keyword: 'secret', severity: 'high' },
  { keyword: 'medical record', severity: 'high' },
  { keyword: 'health condition', severity: 'high' },
  { keyword: 'biometric', severity: 'high' },
  { keyword: 'fingerprint', severity: 'high' },
  { keyword: 'salary', severity: 'high' },
  { keyword: 'caste', severity: 'high' },
  { keyword: 'religion', severity: 'high' },
  { keyword: 'sexual orientation', severity: 'high' },
  { keyword: 'criminal record', severity: 'high' },
  { keyword: 'political opinion', severity: 'high' },
  { keyword: 'bank account', severity: 'medium' },
  { keyword: 'loan details', severity: 'medium' },
  { keyword: 'confidential', severity: 'medium' },
  { keyword: 'restricted', severity: 'medium' },
  { keyword: 'personal data', severity: 'medium' },
  { keyword: 'sensitive data', severity: 'medium' },
];

function maskValue(v) {
  if (v.length <= 4) return '****';
  return v[0] + '*'.repeat(Math.max(1, v.length - 2)) + v[v.length - 1];
}

function classifyText(text) {
  const piiFindings = [];
  let totalPiiCount = 0;

  for (const def of PII_PATTERNS) {
    const re = new RegExp(def.pattern.source, def.pattern.flags);
    const matches = [...text.matchAll(re)];
    if (matches.length > 0) {
      totalPiiCount += matches.length;
      piiFindings.push({
        type: def.key,
        label: def.label,
        severity: def.severity,
        count: matches.length,
        dpdpReference: def.dpdpRef,
        isoReference: def.isoRef,
        maskedSamples: matches.slice(0, 2).map(m => maskValue(m[0])),
      });
    }
  }

  const keywordHits = SENSITIVE_KEYWORDS.filter(({ keyword }) =>
    text.toLowerCase().includes(keyword)
  );

  const criticalPii = piiFindings.filter(f => f.severity === 'critical').length;
  const highPii = piiFindings.filter(f => f.severity === 'high').length;
  const riskScore = Math.min(
    100,
    criticalPii * 20 + highPii * 10 + totalPiiCount * 3 + keywordHits.length * 3
  );
  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

  let classificationLabel = 'PUBLIC';
  if (keywordHits.length > 0) classificationLabel = 'INTERNAL';
  if (piiFindings.length > 0) classificationLabel = 'CONFIDENTIAL';
  if (piiFindings.some(f => f.severity === 'critical')) classificationLabel = 'RESTRICTED';

  return {
    piiFindings,
    sensitiveKeywords: keywordHits.map(k => ({ keyword: k.keyword, severity: k.severity })),
    totalPiiInstances: totalPiiCount,
    riskScore,
    riskLevel,
    classificationLabel,
    recommendedActions: buildRecommendedActions(piiFindings, keywordHits),
    dpdpObligations: piiFindings.length > 0
      ? [
          'Apply data minimization (DPDP Section 8)',
          'Verify consent obtained for each purpose (Section 6)',
          'Implement field-level encryption (Rule 6(1)(a))',
          'Restrict access to authorised personnel (Rule 6(1)(b))',
          'Enable audit logging for all access (Rule 6(1)(c))',
        ]
      : [],
  };
}

function buildRecommendedActions(piiFindings, keywordHits) {
  const actions = [];
  const criticalTypes = ['aadhaar', 'pan', 'creditCard', 'passport'];
  if (piiFindings.some(f => criticalTypes.includes(f.type))) {
    actions.push('Apply field-level encryption via Azure Key Vault (Rule 6(1)(a))');
    actions.push('Restrict file access to authorised roles only (Rule 6(1)(b))');
    actions.push('Enable audit logging for all document access (Rule 6(1)(c))');
  }
  if (piiFindings.some(f => f.type === 'email' || f.type === 'phone')) {
    actions.push('Mask contact data in non-production environments');
    actions.push('Verify consent is recorded for contact data processing');
  }
  if (keywordHits.some(k => k.keyword === 'password' || k.keyword === 'credentials' || k.keyword === 'api key')) {
    actions.push('Rotate exposed credentials immediately');
    actions.push('Move secrets to Azure Key Vault — never store in documents');
  }
  if (piiFindings.some(f => f.type === 'ifsc' || f.type === 'gstin')) {
    actions.push('Review financial data handling under DPDP Act Section 8');
  }
  return actions;
}

module.exports = { classifyText };
