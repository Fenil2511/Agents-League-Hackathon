const store = {
  scans: [],
  classifications: [],
  gapAnalyses: [],
  breachNotifications: [],

  addScan(result) {
    this.scans.unshift({ id: `SCN-${Date.now()}`, timestamp: new Date().toISOString(), ...result });
    if (this.scans.length > 100) this.scans.length = 100;
  },

  addClassification(result) {
    this.classifications.unshift({ id: `CLS-${Date.now()}`, timestamp: new Date().toISOString(), ...result });
    if (this.classifications.length > 100) this.classifications.length = 100;
  },

  addGapAnalysis(result) {
    this.gapAnalyses.unshift({ id: `GAP-${Date.now()}`, timestamp: new Date().toISOString(), ...result });
    if (this.gapAnalyses.length > 20) this.gapAnalyses.length = 20;
  },

  addBreachNotification(result) {
    this.breachNotifications.unshift({ id: `BRN-${Date.now()}`, timestamp: new Date().toISOString(), ...result });
    if (this.breachNotifications.length > 50) this.breachNotifications.length = 50;
  },

  getDashboardStats() {
    const latestGap = this.gapAnalyses[0] ?? null;
    const avgRisk = this.scans.length
      ? Math.round(this.scans.reduce((s, r) => s + (r.riskScore || 0), 0) / this.scans.length)
      : 0;

    const recentActivity = [
      ...this.scans.slice(0, 3).map(s => ({ type: 'scan', id: s.id, timestamp: s.timestamp, label: `Risk: ${s.riskLevel ?? 'unknown'}`, riskLevel: s.riskLevel })),
      ...this.classifications.slice(0, 2).map(c => ({ type: 'classify', id: c.id, timestamp: c.timestamp, label: c.classificationLabel ?? 'classified' })),
      ...this.breachNotifications.slice(0, 2).map(b => ({ type: 'breach', id: b.id, timestamp: b.timestamp, label: 'Breach notification filed' })),
      ...this.gapAnalyses.slice(0, 1).map(g => ({ type: 'gap', id: g.id, timestamp: g.timestamp, label: `Gap analysis — ${g.overallCompliancePercent ?? '?'}% compliant` })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);

    return {
      totalScans: this.scans.length,
      totalClassifications: this.classifications.length,
      totalGapAnalyses: this.gapAnalyses.length,
      totalBreaches: this.breachNotifications.length,
      averageRiskScore: avgRisk,
      riskLevel: avgRisk >= 70 ? 'high' : avgRisk >= 40 ? 'medium' : 'low',
      isoCompliancePercent: latestGap?.iso27001?.compliancePercent ?? null,
      dpdpCompliancePercent: latestGap?.dpdp?.compliancePercent ?? null,
      overallCompliancePercent: latestGap?.overallCompliancePercent ?? null,
      criticalGaps: latestGap?.criticalGaps?.length ?? null,
      recentActivity,
    };
  },
};

module.exports = store;
