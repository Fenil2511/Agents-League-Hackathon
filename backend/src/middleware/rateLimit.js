/* ── Rate Limiting Middleware ─────────────────────────────────────────────
 *
 * Simple in-memory rate limiter that tracks requests per IP address.
 * Prevents abuse of compliance analysis endpoints.
 * No external dependencies required.
 * ──────────────────────────────────────────────────────────────────────── */

const windowMs = 60 * 1000; // 1 minute window
const maxRequests = 60;     // 60 requests per minute per IP

const requestCounts = new Map();

// Cleanup old entries every 2 minutes
setInterval(() => {
  const cutoff = Date.now() - windowMs;
  for (const [key, entry] of requestCounts) {
    if (entry.windowStart < cutoff) requestCounts.delete(key);
  }
}, 2 * 60 * 1000);

function rateLimitMiddleware(req, res, next) {
  // Skip rate limiting for health checks and static files
  if (req.path === "/api/health" || !req.path.startsWith("/api/")) {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  let entry = requestCounts.get(ip);
  if (!entry || entry.windowStart < now - windowMs) {
    entry = { windowStart: now, count: 0 };
    requestCounts.set(ip, entry);
  }

  entry.count++;

  // Set rate limit headers
  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - entry.count));
  res.setHeader("X-RateLimit-Reset", Math.ceil((entry.windowStart + windowMs) / 1000));

  if (entry.count > maxRequests) {
    return res.status(429).json({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Maximum ${maxRequests} requests per minute.`,
      retryAfterMs: entry.windowStart + windowMs - now,
    });
  }

  next();
}

module.exports = { rateLimitMiddleware };
