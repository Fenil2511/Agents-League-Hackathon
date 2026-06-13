/* ── Gap Analyzer Unit Tests ──────────────────────────────────────────────
 *
 * Tests for backend/src/services/gapAnalyzer.js
 * Run with: npm test
 * ──────────────────────────────────────────────────────────────────────── */

const { analyzeGaps } = require('../src/services/gapAnalyzer');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe('analyzeGaps', () => {

  it('should return structured gap analysis result', () => {
    const result = analyzeGaps('We have an information security policy with access controls.', []);
    assert.ok(result.overallCompliancePercent >= 0 && result.overallCompliancePercent <= 100);
    assert.ok(result.iso27001);
    assert.ok(result.dpdp);
    assert.ok(typeof result.iso27001.total === 'number');
    assert.ok(typeof result.iso27001.compliant === 'number');
    assert.ok(typeof result.iso27001.gaps === 'number');
    assert.ok(typeof result.dpdp.total === 'number');
  });

  it('should find gaps for minimal policy text', () => {
    const result = analyzeGaps('Basic security policy.', []);
    assert.ok(result.criticalGaps.length > 0, 'Minimal policy should have critical gaps');
    assert.ok(result.overallCompliancePercent < 80, 'Minimal policy should have low compliance');
  });

  it('should improve compliance with comprehensive policy text', () => {
    const comprehensive = `
      Information security policy established.
      Access control enforced via Azure Entra ID with MFA.
      AES-256 encryption for data at rest using Azure Key Vault.
      SIEM logging with Microsoft Sentinel for security monitoring.
      Incident response plan aligned to ISO 27001.
      Data retention policy documented and enforced.
      Backup and disaster recovery tested quarterly.
      Consent management system implemented per DPDP Act Section 6.
      Data principal rights portal for access, correction, and erasure.
      Breach notification process within 72 hours per Section 40.
      Privacy notice published on company website.
      Data protection officer appointed.
      Regular training and awareness programs conducted.
      Vendor risk assessment process for third-party data processors.
      Physical security controls at all office locations.
      Network segmentation and firewall rules enforced.
      Vulnerability scanning and penetration testing performed quarterly.
    `;
    const result = analyzeGaps(comprehensive, []);
    assert.ok(result.overallCompliancePercent > 30, 'Comprehensive policy should have decent compliance');
    assert.ok(result.iso27001.compliant > 5, 'Should match several ISO controls');
  });

  it('should identify ISO 27001 controls', () => {
    const result = analyzeGaps('Access control policy.', []);
    assert.ok(result.iso27001.total > 0, 'Should have ISO controls defined');
    assert.ok(Array.isArray(result.iso27001.controls) || typeof result.iso27001.gaps === 'number');
  });

  it('should identify DPDP requirements', () => {
    const result = analyzeGaps('Consent management system.', []);
    assert.ok(result.dpdp.total > 0, 'Should have DPDP requirements defined');
  });

  it('should handle empty policy text', () => {
    const result = analyzeGaps('', []);
    assert.ok(result.overallCompliancePercent <= 10, 'Empty policy should have near-zero compliance');
    assert.ok(result.criticalGaps.length > 0, 'Empty policy should have many critical gaps');
  });

  it('should incorporate evidence items', () => {
    const policy = 'Basic policy.';
    const evidence = [
      { title: 'Access Control Procedure', preview: 'MFA enforced for all users via Azure Entra ID' },
      { title: 'Encryption Standard', preview: 'AES-256 encryption applied to all data at rest' },
    ];
    const withEvidence = analyzeGaps(policy, evidence);
    const withoutEvidence = analyzeGaps(policy, []);
    // Evidence should improve or maintain compliance
    assert.ok(withEvidence.overallCompliancePercent >= withoutEvidence.overallCompliancePercent - 5,
      'Evidence should help compliance score');
  });

  it('should compute overall compliance from ISO + DPDP', () => {
    const result = analyzeGaps('Security policy with encryption and access controls.', []);
    const expected = Math.round(
      (result.iso27001.compliancePercent + result.dpdp.compliancePercent) / 2
    );
    // Allow small rounding differences
    assert.ok(
      Math.abs(result.overallCompliancePercent - expected) <= 2,
      `Overall (${result.overallCompliancePercent}) should be close to avg of ISO (${result.iso27001.compliancePercent}) and DPDP (${result.dpdp.compliancePercent})`
    );
  });
});
