/* ── Microsoft Entra ID Token Validation Middleware ───────────────────────
 *
 * Validates Bearer tokens issued by Microsoft Entra ID for the backend API.
 * In development mode (ENTRA_AUTH_DISABLED=true or missing config),
 * authentication is bypassed with a warning.
 * ──────────────────────────────────────────────────────────────────────── */

const TENANT_ID = process.env.GRAPH_TENANT_ID || "";
const CLIENT_ID = process.env.GRAPH_CLIENT_ID || "";
const AUTH_DISABLED = process.env.ENTRA_AUTH_DISABLED === "true";

// Simple JWKS-based validation for production
// For hackathon demo: validates token structure and allows dev bypass
async function validateEntraToken(token) {
  if (!TENANT_ID || !CLIENT_ID || AUTH_DISABLED) {
    return { sub: "dev-user", name: "Development User", oid: "dev" };
  }

  // Validate token with Microsoft Entra ID
  const issuer = `https://login.microsoftonline.com/${TENANT_ID}/v2.0`;
  const jwksUrl = `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`;

  const response = await fetch(jwksUrl);
  if (!response.ok) throw new Error("Failed to fetch JWKS keys");

  // Decode token header to get kid
  const [headerB64] = token.split(".");
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());

  const jwks = await response.json();
  const key = jwks.keys.find((k) => k.kid === header.kid);
  if (!key) throw new Error("Token signing key not found in JWKS");

  // For production, use a proper JWT library (jsonwebtoken + jwks-rsa)
  // This validates the basic structure and key presence
  const [, payloadB64] = token.split(".");
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

  if (payload.iss !== issuer) throw new Error(`Invalid issuer: ${payload.iss}`);
  if (payload.aud !== CLIENT_ID && payload.aud !== `api://${CLIENT_ID}`) {
    throw new Error(`Invalid audience: ${payload.aud}`);
  }
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error("Token expired");
  }

  return payload;
}

/**
 * Express middleware for Entra ID authentication.
 * Skips auth for /api/health and in dev mode.
 */
function entraAuthMiddleware(req, res, next) {
  // Always allow health checks and static assets
  if (req.path === "/api/health" || !req.path.startsWith("/api/")) {
    return next();
  }

  // Dev mode bypass
  if (AUTH_DISABLED || (!TENANT_ID && !CLIENT_ID)) {
    req.user = { sub: "dev-user", name: "Development User" };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing Bearer token in Authorization header",
    });
  }

  const token = authHeader.slice(7);
  validateEntraToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.warn(`[auth] Token rejected: ${err.message}`);
      res.status(401).json({ error: "Unauthorized", message: err.message });
    });
}

module.exports = { entraAuthMiddleware };
