const workflows = require("../data/dpdp-compliance-workflows.json");

function asIso(value) {
  return new Date(value).toISOString();
}

function addHours(dateInput, hours) {
  const date = new Date(dateInput);
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function buildBreachArtifacts(input) {
  const detectedAt = input.detectedAt ? new Date(input.detectedAt) : new Date();
  const reportDeadline = addHours(detectedAt, 72);
  const now = new Date();

  const boardInitialAlert = {
    natureOfBreach: input.natureOfBreach || "Not provided",
    extentOfBreach: input.extentOfBreach || "Not provided",
    timing: input.timing || asIso(detectedAt),
    location: input.location || "Not provided",
    likelyImpact: input.likelyImpact || "Under assessment",
  };

  const boardComprehensiveReport = {
    updatedBreachDetails: input.updatedBreachDetails || input.natureOfBreach || "Pending update",
    eventsAndCircumstances: input.eventsAndCircumstances || "Pending investigation",
    mitigationMeasures: input.mitigationMeasures || "Immediate containment actions started",
    findingsOnResponsibleEntity: input.findingsOnResponsibleEntity || "Investigation in progress",
    remedialMeasures: input.remedialMeasures || "Pending post-incident report",
    statusOfDataPrincipalNotifications: input.statusOfDataPrincipalNotifications || "Pending",
  };

  const dataPrincipalNotification = {
    natureExtentTiming: `${boardInitialAlert.natureOfBreach}; ${boardInitialAlert.extentOfBreach}; ${boardInitialAlert.timing}`,
    consequencesRelevantToUser: input.consequencesRelevantToUser || "Potential impact under assessment",
    mitigationMeasuresTaken: input.mitigationMeasures || "Containment controls activated",
    userSafetyActions: input.userSafetyActions || "Reset password and enable MFA",
    dpoContact: input.dpoContact || "privacy@contoso.example",
    formatting: workflows.DPDP_Compliance_Workflows.Breach_Notification.Payloads.DataPrincipal_Notification.Formatting,
  };

  return {
    detectedAt: asIso(detectedAt),
    reportDeadline: asIso(reportDeadline),
    hoursRemaining: Math.max(0, Math.round((reportDeadline.getTime() - now.getTime()) / (60 * 60 * 1000))),
    initialAlertRequiredNow: true,
    extensionRequestRequired: now > reportDeadline,
    boardInitialAlert,
    boardComprehensiveReport,
    dataPrincipalNotification,
    policySnapshot: workflows.DPDP_Compliance_Workflows,
  };
}

module.exports = {
  buildBreachArtifacts,
};
