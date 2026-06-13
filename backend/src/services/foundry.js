function deriveLocalRiskScore(evidence) {
  const text = evidence
    .map((item) => `${item.title || ""} ${item.preview || ""}`.toLowerCase())
    .join(" ");

  const indicators = ["password", "aadhaar", "bank", "card", "panic", "breach", "personal data", "secret", "confidential"];
  const hits = indicators.filter((term) => text.includes(term)).length;
  const score = Math.min(100, 20 + hits * 15 + Math.min(30, evidence.length * 5));

  return {
    riskScore: score,
    riskLevel: score >= 75 ? "high" : score >= 45 ? "medium" : "low",
    reasoning: "Local fallback score generated from keyword and volume signals because no Foundry endpoint was configured.",
  };
}

async function scoreWithFoundry(foundryConfig, evidence, context) {
  if (!foundryConfig.runUrl) {
    return deriveLocalRiskScore(evidence);
  }

  const response = await fetch(foundryConfig.runUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(foundryConfig.apiKey ? { Authorization: `Bearer ${foundryConfig.apiKey}` } : {}),
    },
    body: JSON.stringify({
      task: "compliance-risk-scoring",
      context,
      evidence,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Foundry scoring failed: ${response.status} ${details}`);
  }

  return response.json();
}

module.exports = {
  scoreWithFoundry,
};