function readEnv(name, fallback = "") {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function loadConfig() {
  return {
    port: Number(readEnv("PORT", "3000")),
    graph: {
      tenantId: readEnv("GRAPH_TENANT_ID"),
      clientId: readEnv("GRAPH_CLIENT_ID"),
      clientSecret: readEnv("GRAPH_CLIENT_SECRET"),
      userId: readEnv("GRAPH_USER_ID"),
      driveId: readEnv("GRAPH_DRIVE_ID"),
      notificationSender: readEnv("GRAPH_NOTIFICATION_SENDER"),
    },
    foundry: {
      runUrl: readEnv("FOUNDRY_RUN_URL"),
      apiKey: readEnv("FOUNDRY_API_KEY"),
    },
    teams: {
      webhookUrl: readEnv("TEAMS_WEBHOOK_URL"),
    },
    boardNotificationEmail: readEnv("BOARD_NOTIFICATION_EMAIL", "dpb-notify@example.gov.in"),
    riskAlertThreshold: Number(readEnv("RISK_ALERT_THRESHOLD", "70")),
  };
}

module.exports = {
  loadConfig,
};