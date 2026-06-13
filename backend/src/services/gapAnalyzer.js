const ISO27001_CONTROLS = [
  // A.5 — Organizational Controls
  { id: 'A.5.1',  name: 'Policies for information security',             domain: 'Organizational', keywords: ['information security policy', 'security policy', 'isms policy'] },
  { id: 'A.5.2',  name: 'Information security roles and responsibilities', domain: 'Organizational', keywords: ['ciso', 'dpo', 'data protection officer', 'security roles', 'raci'] },
  { id: 'A.5.3',  name: 'Segregation of duties',                         domain: 'Organizational', keywords: ['segregation of duties', 'separation of duties', 'dual control'] },
  { id: 'A.5.4',  name: 'Management responsibilities',                   domain: 'Organizational', keywords: ['management commitment', 'executive sponsor', 'board approval', 'governance'] },
  { id: 'A.5.5',  name: 'Contact with authorities',                      domain: 'Organizational', keywords: ['cert-in', 'dpb', 'data protection board', 'regulatory authority'] },
  { id: 'A.5.7',  name: 'Threat intelligence',                           domain: 'Organizational', keywords: ['threat intelligence', 'cti', 'vulnerability bulletin', 'threat feed'] },
  { id: 'A.5.9',  name: 'Inventory of information assets',               domain: 'Organizational', keywords: ['asset inventory', 'asset register', 'data map', 'data inventory', 'cmdb'] },
  { id: 'A.5.10', name: 'Acceptable use of information assets',          domain: 'Organizational', keywords: ['acceptable use', 'aup', 'usage policy', 'acceptable use policy'] },
  { id: 'A.5.12', name: 'Classification of information',                 domain: 'Organizational', keywords: ['data classification', 'information classification', 'classification scheme', 'sensitivity label'] },
  { id: 'A.5.13', name: 'Labelling of information',                      domain: 'Organizational', keywords: ['data labeling', 'sensitivity label', 'purview', 'document labeling'] },
  { id: 'A.5.15', name: 'Access control',                                domain: 'Organizational', keywords: ['access control', 'rbac', 'least privilege', 'need to know', 'authorization policy'] },
  { id: 'A.5.16', name: 'Identity management',                           domain: 'Organizational', keywords: ['identity management', 'iam', 'entra id', 'active directory', 'identity provider'] },
  { id: 'A.5.17', name: 'Authentication information',                    domain: 'Organizational', keywords: ['password policy', 'mfa', 'multi-factor authentication', 'strong authentication', 'passwordless'] },
  { id: 'A.5.18', name: 'Access rights',                                 domain: 'Organizational', keywords: ['access review', 'access rights', 'provisioning', 'deprovisioning', 'recertification'] },
  { id: 'A.5.19', name: 'Information security in supplier relationships', domain: 'Organizational', keywords: ['vendor', 'supplier', 'third party', 'data processor', 'dpa agreement', 'third-party'] },
  { id: 'A.5.23', name: 'Information security for cloud services',        domain: 'Organizational', keywords: ['cloud security', 'azure security', 'saas', 'cloud governance', 'cspm', 'cloud policy'] },
  { id: 'A.5.24', name: 'Information security incident management',      domain: 'Organizational', keywords: ['incident management', 'incident response', 'soc', 'security incident', 'irp'] },
  { id: 'A.5.25', name: 'Assessment of information security events',     domain: 'Organizational', keywords: ['incident assessment', 'triage', 'severity classification', 'event assessment'] },
  { id: 'A.5.26', name: 'Response to information security incidents',    domain: 'Organizational', keywords: ['incident response plan', 'containment', 'eradication', 'recovery plan', 'irp'] },
  { id: 'A.5.27', name: 'Learning from incidents',                       domain: 'Organizational', keywords: ['lessons learned', 'post-incident', 'root cause analysis', 'pir'] },
  { id: 'A.5.28', name: 'Collection of evidence',                        domain: 'Organizational', keywords: ['digital forensics', 'evidence collection', 'chain of custody', 'forensic'] },
  { id: 'A.5.34', name: 'Privacy and PII protection',                    domain: 'Organizational', keywords: ['pii', 'privacy', 'data protection', 'dpdp', 'personal data', 'privacy impact assessment', 'pia'] },
  { id: 'A.5.35', name: 'Independent review of information security',    domain: 'Organizational', keywords: ['internal audit', 'external audit', 'iso audit', 'penetration test', 'vapt'] },
  { id: 'A.5.36', name: 'Compliance with policies and standards',        domain: 'Organizational', keywords: ['compliance program', 'compliance monitoring', 'regulatory compliance', 'policy compliance'] },
  { id: 'A.5.37', name: 'Documented operating procedures',               domain: 'Organizational', keywords: ['sop', 'operating procedure', 'runbook', 'process document', 'standard operating'] },
  // A.6 — People Controls
  { id: 'A.6.1',  name: 'Screening',                                     domain: 'People', keywords: ['background check', 'background verification', 'bgv', 'employee screening'] },
  { id: 'A.6.2',  name: 'Terms and conditions of employment',            domain: 'People', keywords: ['employment contract', 'nda', 'non-disclosure', 'confidentiality agreement'] },
  { id: 'A.6.3',  name: 'Security awareness and training',               domain: 'People', keywords: ['security awareness', 'security training', 'phishing simulation', 'compliance training'] },
  { id: 'A.6.5',  name: 'Responsibilities after termination',            domain: 'People', keywords: ['offboarding', 'exit checklist', 'account deprovisioning', 'termination policy'] },
  { id: 'A.6.7',  name: 'Remote working',                                domain: 'People', keywords: ['remote work', 'work from home', 'wfh policy', 'vpn', 'remote access policy'] },
  // A.7 — Physical Controls
  { id: 'A.7.1',  name: 'Physical security perimeters',                  domain: 'Physical', keywords: ['physical security', 'access badge', 'cctv', 'perimeter security', 'secure area'] },
  { id: 'A.7.2',  name: 'Physical entry controls',                       domain: 'Physical', keywords: ['entry control', 'visitor management', 'biometric access', 'access card'] },
  { id: 'A.7.8',  name: 'Equipment siting and protection',               domain: 'Physical', keywords: ['server room', 'data center', 'equipment security', 'hardware security'] },
  // A.8 — Technological Controls
  { id: 'A.8.1',  name: 'User endpoint devices',                         domain: 'Technological', keywords: ['endpoint security', 'mdm', 'intune', 'mobile device', 'laptop policy', 'endpoint management'] },
  { id: 'A.8.2',  name: 'Privileged access rights',                      domain: 'Technological', keywords: ['privileged access', 'pam', 'pim', 'admin account', 'just-in-time access'] },
  { id: 'A.8.3',  name: 'Information access restriction',                domain: 'Technological', keywords: ['access restriction', 'conditional access', 'permission management', 'data access control'] },
  { id: 'A.8.5',  name: 'Secure authentication',                         domain: 'Technological', keywords: ['mfa', 'multi-factor', 'two-factor', 'sso', 'conditional access', 'fido2'] },
  { id: 'A.8.7',  name: 'Protection against malware',                    domain: 'Technological', keywords: ['antivirus', 'anti-malware', 'edr', 'microsoft defender', 'endpoint protection', 'xdr'] },
  { id: 'A.8.8',  name: 'Management of technical vulnerabilities',       domain: 'Technological', keywords: ['vulnerability management', 'patch management', 'cve', 'vulnerability scan'] },
  { id: 'A.8.12', name: 'Data leakage prevention',                       domain: 'Technological', keywords: ['dlp', 'data loss prevention', 'data leakage', 'microsoft purview', 'information protection'] },
  { id: 'A.8.13', name: 'Information backup',                            domain: 'Technological', keywords: ['backup', 'data backup', 'disaster recovery', 'azure backup', 'recovery point'] },
  { id: 'A.8.15', name: 'Logging',                                       domain: 'Technological', keywords: ['logging', 'audit log', 'siem', 'microsoft sentinel', 'log analytics', 'event log'] },
  { id: 'A.8.16', name: 'Monitoring activities',                         domain: 'Technological', keywords: ['monitoring', 'security monitoring', 'sentinel', 'azure monitor', 'soc monitoring'] },
  { id: 'A.8.20', name: 'Network security',                              domain: 'Technological', keywords: ['network security', 'firewall', 'nsg', 'azure firewall', 'network segmentation', 'zero trust'] },
  { id: 'A.8.24', name: 'Use of cryptography',                           domain: 'Technological', keywords: ['encryption', 'cryptography', 'aes', 'tls', 'key vault', 'pki', 'key management'] },
  { id: 'A.8.25', name: 'Secure development lifecycle',                  domain: 'Technological', keywords: ['sdlc', 'secure development', 'sast', 'dast', 'devsecops', 'github actions security'] },
  { id: 'A.8.28', name: 'Secure coding',                                 domain: 'Technological', keywords: ['secure coding', 'owasp', 'code review', 'static analysis', 'code security'] },
];

const DPDP_REQUIREMENTS = [
  { section: 'Section 4',     name: 'Lawful basis for processing',              keywords: ['consent', 'lawful basis', 'legitimate use', 'authorized purpose'] },
  { section: 'Section 5',     name: 'Notice to Data Principals',                keywords: ['privacy notice', 'notice before collection', 'purpose of processing', 'data principal notice'] },
  { section: 'Section 6',     name: 'Consent management',                       keywords: ['consent management', 'consent record', 'withdraw consent', 'granular consent'] },
  { section: 'Section 7',     name: 'Legitimate uses without consent',          keywords: ['legitimate use', 'state function', 'employment purpose', 'medical emergency'] },
  { section: 'Section 8',     name: 'Data Fiduciary obligations',               keywords: ['data fiduciary', 'data accuracy', 'data minimization', 'purpose limitation', 'data quality'] },
  { section: 'Section 9',     name: "Children's data protection",               keywords: ['children', 'child data', 'minor', 'parental consent', 'age verification'] },
  { section: 'Section 10',    name: 'Significant Data Fiduciary (SDF)',         keywords: ['significant data fiduciary', 'sdf', 'dpia', 'data audit', 'data protection impact'] },
  { section: 'Section 11',    name: 'Right to access information',              keywords: ['right to access', 'data access request', 'subject access request', 'data summary'] },
  { section: 'Section 12',    name: 'Right to correction and erasure',          keywords: ['right to erasure', 'right to correction', 'data deletion', 'data correction request'] },
  { section: 'Section 13',    name: 'Right of grievance redressal',             keywords: ['grievance redressal', 'complaint mechanism', 'dpo contact', 'grievance officer'] },
  { section: 'Section 14',    name: 'Right to nominate',                        keywords: ['nominee', 'nomination', 'data rights nominee'] },
  { section: 'Section 16',    name: 'Exemptions',                               keywords: ['exemption', 'national security', 'research exemption', 'journalistic purpose'] },
  { section: 'Rule 6(1)(a)',  name: 'Encryption and tokenization',              keywords: ['encryption', 'tokenization', 'key vault', 'field-level encryption', 'data masking'] },
  { section: 'Rule 6(1)(b)',  name: 'Access control safeguards',                keywords: ['rbac', 'oauth', 'entra id', 'access management', 'identity verification', 'access control'] },
  { section: 'Rule 6(1)(c)',  name: 'Monitoring and audit logging',             keywords: ['monitoring', 'audit log', 'sentinel', 'siem', 'compliance monitoring', 'access visibility'] },
  { section: 'Rule 6(1)(d)',  name: 'Data resilience and backup',               keywords: ['backup', 'resilience', 'disaster recovery', 'bcp', 'geo-redundant', 'recovery time'] },
  { section: 'Section 40',    name: 'Breach notification to DPB',               keywords: ['breach notification', '72 hour', '72-hour', 'cert-in notification', 'data breach report'] },
];

const ISO_REMEDIATIONS = {
  'A.5.1':  'Draft and board-approve an Information Security Policy. Include scope, objectives, and management commitment.',
  'A.5.2':  'Define CISO, DPO, and data owner roles. Create RACI matrix for all security responsibilities.',
  'A.5.3':  'Implement segregation of duties for critical processes. Document in an access control matrix.',
  'A.5.4':  'Obtain formal board-level sign-off on security program. Include security KPIs in executive reporting.',
  'A.5.5':  'Register with CERT-In. Establish documented notification procedures for Data Protection Board.',
  'A.5.7':  'Subscribe to Microsoft Defender Threat Intelligence and CERT-In advisories.',
  'A.5.9':  'Build and maintain a Data Asset Register covering all M365, Azure, and on-premise data stores.',
  'A.5.10': 'Publish an Acceptable Use Policy for M365 and all corporate systems. Require annual acknowledgement.',
  'A.5.12': 'Implement Microsoft Purview Information Protection. Define: Public, Internal, Confidential, Restricted.',
  'A.5.13': 'Apply sensitivity labels via Microsoft Purview. Configure auto-labeling for SharePoint and Exchange.',
  'A.5.15': 'Deploy RBAC via Entra ID. Conduct quarterly access recertification campaigns.',
  'A.5.16': 'Centralise all identities in Azure Entra ID. Disable local/shared accounts. Enable SSO.',
  'A.5.17': 'Enforce MFA via Conditional Access for all accounts. Apply phishing-resistant FIDO2 for admins.',
  'A.5.18': 'Schedule quarterly access reviews in Entra ID Access Reviews. Automate joiner/mover/leaver workflows.',
  'A.5.19': 'Execute Data Processing Agreements with all vendors. Conduct annual third-party security reviews.',
  'A.5.23': 'Enable Microsoft Defender for Cloud. Configure Cloud Security Posture Management (CSPM).',
  'A.5.24': 'Develop and test Incident Response Plan (IRP). Define P1/P2/P3 severity levels with response SLAs.',
  'A.5.25': 'Create incident triage playbook aligned to DPDP breach thresholds. Train SOC analysts.',
  'A.5.26': 'Run quarterly tabletop exercises against the IRP. Test with real ransomware/breach scenarios.',
  'A.5.27': 'Mandate post-incident reviews within 5 days. Track lessons learned in issue management system.',
  'A.5.28': 'Establish digital forensics procedures. Integrate evidence collection with Microsoft Sentinel.',
  'A.5.34': 'Conduct Privacy Impact Assessments (PIA/DPIA) for all new systems processing personal data.',
  'A.5.35': 'Schedule annual internal ISO 27001 audits and biennial third-party certification audits.',
  'A.5.36': 'Implement compliance monitoring program. Track controls against DPDP Act and ISO 27001 quarterly.',
  'A.5.37': 'Document SOPs for all security-critical processes. Store in SharePoint with version control and review dates.',
  'A.6.1':  'Define and enforce background verification for all employees and contractors before access is granted.',
  'A.6.2':  'Include security and confidentiality clauses in all employment contracts and contractor agreements.',
  'A.6.3':  'Deploy mandatory annual security awareness training. Add phishing simulation via Microsoft Defender.',
  'A.6.5':  'Create offboarding checklist: revoke all M365/Azure access within 24 hours, retrieve devices, sign exit NDA.',
  'A.6.7':  'Publish remote working policy. Enforce VPN + MFA for all remote access. Harden home network guidance.',
  'A.7.1':  'Define physical security zones. Implement badge access for all office areas. Review quarterly.',
  'A.7.2':  'Implement visitor management system. Log all data center and server room entries with timestamps.',
  'A.7.8':  'Secure server rooms with biometric access. Monitor with CCTV. Review physical access logs monthly.',
  'A.8.1':  'Enrol all devices in Microsoft Intune MDM. Enforce BitLocker disk encryption. Block unmanaged devices.',
  'A.8.2':  'Deploy Microsoft Entra PIM for privileged accounts. Enforce just-in-time access. Require approval workflows.',
  'A.8.3':  'Configure Conditional Access policies. Restrict access by role, device compliance, and location.',
  'A.8.5':  'Enforce MFA for all accounts. Implement FIDO2 for admins. Block legacy authentication protocols.',
  'A.8.7':  'Deploy Microsoft Defender for Endpoint on all devices. Enable real-time and cloud-delivered protection.',
  'A.8.8':  'Implement automated patching via Intune. Track open CVEs with Defender Vulnerability Management.',
  'A.8.12': 'Configure Microsoft Purview DLP policies for Teams, SharePoint, Exchange, and OneDrive.',
  'A.8.13': 'Configure geo-redundant Azure Backup. Test restoration monthly. Document and test RTO/RPO targets.',
  'A.8.15': 'Enable Microsoft Sentinel. Set log retention to 2+ years per DPDP and regulatory requirements.',
  'A.8.16': 'Configure Sentinel analytics rules and scheduled alerts. Define SOC monitoring runbooks.',
  'A.8.20': 'Implement Azure Firewall and NSG rules. Enable network segmentation for all sensitive data workloads.',
  'A.8.24': 'Implement Azure Key Vault for all encryption keys. Apply AES-256 at rest, TLS 1.3 in transit.',
  'A.8.25': 'Integrate SAST, DAST, and dependency scanning into GitHub Actions CI/CD pipelines.',
  'A.8.28': 'Adopt OWASP Secure Coding Guidelines. Conduct quarterly code security reviews with security champions.',
};

const DPDP_REMEDIATIONS = {
  'Section 4':    'Document lawful basis for each data processing activity in a processing register. Review annually.',
  'Section 5':    'Implement consent notice before any data collection. Use plain language in English and regional languages.',
  'Section 6':    'Deploy consent management system. Enable one-click consent withdrawal. Maintain consent audit trail.',
  'Section 7':    'Document all legitimate use cases with legal justification. Ensure each meets Section 7 criteria.',
  'Section 8':    'Implement data minimization. Define retention schedule. Automate data erasure after retention period.',
  'Section 9':    'Add age verification at registration. Implement parental consent workflow. Restrict profiling of children.',
  'Section 10':   'If classified as SDF: appoint Data Auditor, conduct annual DPIA, assess data localization requirements.',
  'Section 11':   'Build DSAR portal. Process data access requests and provide response within timelines set by DPB.',
  'Section 12':   'Implement correction/erasure request workflow with audit trail. Propagate changes to all processors.',
  'Section 13':   'Publish DPO contact on website. Create grievance redressal process with defined SLA.',
  'Section 14':   'Add nomination functionality to user account settings. Store nominee details securely.',
  'Section 16':   'Document all claimed exemptions with legal basis. Review with legal counsel annually.',
  'Rule 6(1)(a)': 'Deploy Azure Key Vault. Implement field-level encryption for Aadhaar, PAN, and financial data.',
  'Rule 6(1)(b)': 'Configure Entra ID RBAC with least-privilege principle. Enable Conditional Access. Quarterly reviews.',
  'Rule 6(1)(c)': 'Enable Microsoft Sentinel. Configure Data Access Auditing in SharePoint. Set 2-year log retention.',
  'Rule 6(1)(d)': 'Configure geo-redundant Azure Backup. Document RTO < 4 hours, RPO < 1 hour. Test quarterly.',
  'Section 40':   'Implement breach detection pipeline. Configure 72-hour notification workflow to CERT-In and DPB.',
};

const CRITICAL_ISO_IDS  = new Set(['A.5.34', 'A.8.5', 'A.8.15', 'A.8.24', 'A.5.24', 'A.8.12']);
const CRITICAL_DPDP_IDS = new Set(['Section 5', 'Section 6', 'Rule 6(1)(a)', 'Section 40', 'Section 8']);

function analyzeGaps(policyText = '', evidenceItems = []) {
  const corpus = [policyText, ...evidenceItems.map(e => e.content || e.preview || e.filename || '')].join(' ').toLowerCase();

  const isoResults = ISO27001_CONTROLS.map(control => {
    const covered = control.keywords.some(kw => corpus.includes(kw.toLowerCase()));
    return {
      id: control.id,
      name: control.name,
      domain: control.domain,
      status: covered ? 'compliant' : 'gap',
      remediation: covered ? null : (ISO_REMEDIATIONS[control.id] || `Implement controls for ${control.id} per ISO 27001:2022.`),
      critical: CRITICAL_ISO_IDS.has(control.id),
    };
  });

  const dpdpResults = DPDP_REQUIREMENTS.map(req => {
    const covered = req.keywords.some(kw => corpus.includes(kw.toLowerCase()));
    return {
      section: req.section,
      name: req.name,
      status: covered ? 'compliant' : 'gap',
      remediation: covered ? null : (DPDP_REMEDIATIONS[req.section] || `Review DPDP Act ${req.section} requirements.`),
      critical: CRITICAL_DPDP_IDS.has(req.section),
    };
  });

  const isoCompliant = isoResults.filter(c => c.status === 'compliant').length;
  const dpdpCompliant = dpdpResults.filter(c => c.status === 'compliant').length;
  const total = isoResults.length + dpdpResults.length;

  const criticalGaps = [
    ...isoResults.filter(c => c.status === 'gap' && c.critical),
    ...dpdpResults.filter(c => c.status === 'gap' && c.critical),
  ];

  return {
    iso27001: {
      controls: isoResults,
      total: isoResults.length,
      compliant: isoCompliant,
      gaps: isoResults.length - isoCompliant,
      compliancePercent: Math.round((isoCompliant / isoResults.length) * 100),
    },
    dpdp: {
      requirements: dpdpResults,
      total: dpdpResults.length,
      compliant: dpdpCompliant,
      gaps: dpdpResults.length - dpdpCompliant,
      compliancePercent: Math.round((dpdpCompliant / dpdpResults.length) * 100),
    },
    overallCompliancePercent: Math.round(((isoCompliant + dpdpCompliant) / total) * 100),
    criticalGaps,
  };
}

module.exports = { analyzeGaps };
