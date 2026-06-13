import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

/* ── Microsoft Entra ID OAuth 2.0 token validation ───────────────────────
 *
 * Validates Bearer tokens issued by Microsoft Entra ID (Azure AD).
 * Uses JWKS (JSON Web Key Set) for automatic key rotation.
 * Enforces audience + issuer + expiry checks.
 * ──────────────────────────────────────────────────────────────────────── */

const TENANT_ID = process.env.ENTRA_TENANT_ID || "";
const CLIENT_ID = process.env.ENTRA_CLIENT_ID || "";

const JWKS_URI = TENANT_ID
  ? `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`
  : null;

const ISSUER = TENANT_ID
  ? `https://login.microsoftonline.com/${TENANT_ID}/v2.0`
  : null;

let client = null;

function getJwksClient() {
  if (!client && JWKS_URI) {
    client = jwksClient({
      jwksUri: JWKS_URI,
      cache: true,
      cacheMaxAge: 600_000,      // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }
  return client;
}

function getSigningKey(header, callback) {
  const c = getJwksClient();
  if (!c) return callback(new Error("JWKS client not configured — set ENTRA_TENANT_ID"));
  c.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

/**
 * Validate a Bearer token from the Authorization header.
 * Returns decoded payload on success, throws on failure.
 */
export function validateToken(authHeader) {
  return new Promise((resolve, reject) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reject(new Error("Missing or malformed Authorization header"));
    }

    const token = authHeader.slice(7);

    if (!TENANT_ID || !CLIENT_ID) {
      // Graceful fallback for local dev without Entra — log warning and allow
      console.warn("[auth] ENTRA_TENANT_ID or ENTRA_CLIENT_ID not set — skipping token validation (dev mode)");
      try {
        const decoded = jwt.decode(token);
        return resolve(decoded || { sub: "dev-user", name: "Local Developer" });
      } catch {
        return resolve({ sub: "dev-user", name: "Local Developer" });
      }
    }

    jwt.verify(
      token,
      getSigningKey,
      {
        audience: CLIENT_ID,
        issuer: ISSUER,
        algorithms: ["RS256"],
        clockTolerance: 30,  // 30-second clock skew tolerance
      },
      (err, decoded) => {
        if (err) return reject(new Error(`Token validation failed: ${err.message}`));
        resolve(decoded);
      }
    );
  });
}

/**
 * Express middleware that validates Entra ID tokens.
 * Attaches `req.user` on success.
 * Returns 401 on failure.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  // Allow health endpoint without auth
  if (req.path === "/health") return next();

  validateToken(authHeader)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.warn(`[auth] Rejected: ${err.message}`);
      res.status(401).json({ error: "Unauthorized", message: err.message });
    });
}
