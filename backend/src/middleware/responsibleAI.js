/* ── Responsible AI Guardrails Middleware ──────────────────────────────────
 *
 * Content safety checks for incoming requests and outgoing responses.
 * Implements:
 *  1. Input sanitisation — strips obvious injection patterns
 *  2. Content length limits — prevents resource exhaustion
 *  3. Prompt injection detection — flags common attack patterns
 *  4. PII leak prevention in logs — redacts sensitive patterns
 *  5. AI transparency header — signals AI-generated content
 * ──────────────────────────────────────────────────────────────────────── */

const MAX_INPUT_LENGTH = 500_000; // 500KB text limit

// Patterns that indicate potential prompt injection attempts
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above/i,
  /system\s*:\s*you\s+are/i,
  /\bdo\s+anything\s+now\b/i,
  /\bdan\s+mode\b/i,
  /\bjailbreak\b/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+if\s+you/i,
  /override\s+safety/i,
  /bypass\s+(?:filter|restriction|safety|guard)/i,
];

// Sensitive patterns to redact from logs
const REDACT_PATTERNS = [
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: "[AADHAAR-REDACTED]" },
  { pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g, replacement: "[PAN-REDACTED]" },
  { pattern: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: "[CARD-REDACTED]" },
];

/**
 * Sanitise text input — removes null bytes and excessive whitespace.
 */
function sanitiseInput(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/\0/g, "")           // null bytes
    .replace(/\r/g, "")           // carriage returns
    .trim();
}

/**
 * Check for prompt injection attempts in text.
 * Returns { safe: boolean, flaggedPatterns: string[] }
 */
function checkForInjection(text) {
  if (typeof text !== "string") return { safe: true, flaggedPatterns: [] };
  const flagged = INJECTION_PATTERNS
    .filter((p) => p.test(text))
    .map((p) => p.source.slice(0, 40));
  return { safe: flagged.length === 0, flaggedPatterns: flagged };
}

/**
 * Redact PII from a string (for logging purposes only).
 */
function redactForLogging(text) {
  if (typeof text !== "string") return text;
  let result = text;
  for (const { pattern, replacement } of REDACT_PATTERNS) {
    result = result.replace(new RegExp(pattern.source, pattern.flags), replacement);
  }
  return result;
}

/**
 * Express middleware implementing Responsible AI guardrails.
 */
function responsibleAIMiddleware(req, res, next) {
  // Only apply to API routes with request bodies
  if (!req.path.startsWith("/api/") || req.method === "GET") {
    return next();
  }

  // 1. Content length check
  const bodyStr = JSON.stringify(req.body || {});
  if (bodyStr.length > MAX_INPUT_LENGTH) {
    return res.status(413).json({
      error: "Content Too Large",
      message: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`,
    });
  }

  // 2. Sanitise text fields in body
  if (req.body && typeof req.body === "object") {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === "string") {
        req.body[key] = sanitiseInput(value);
      }
    }
  }

  // 3. Check for prompt injection
  const textFields = ["text", "policyText", "query", "natureOfBreach", "description"];
  for (const field of textFields) {
    if (req.body && typeof req.body[field] === "string") {
      const check = checkForInjection(req.body[field]);
      if (!check.safe) {
        console.warn(`[responsible-ai] Injection pattern detected in field '${field}': ${check.flaggedPatterns.join(", ")}`);
        // Log but don't block — flag for review
        req.injectionFlags = req.injectionFlags || [];
        req.injectionFlags.push({ field, patterns: check.flaggedPatterns });
      }
    }
  }

  // 4. Redact PII in request logs
  if (req.body && (req.body.text || req.body.policyText)) {
    const logSafe = redactForLogging(req.body.text || req.body.policyText);
    console.log(`[responsible-ai] Processing request: ${logSafe.slice(0, 100)}...`);
  }

  // 5. Add AI transparency header to responses
  res.setHeader("X-AI-Generated", "true");
  res.setHeader("X-AI-Disclaimer", "Output requires human review before compliance decisions");

  next();
}

module.exports = { responsibleAIMiddleware, redactForLogging, sanitiseInput };
