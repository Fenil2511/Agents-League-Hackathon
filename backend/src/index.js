const path = require('path');
const express = require('express');
const { loadConfig } = require('./config');
const { createComplianceRouter } = require('./routes/compliance');
const { entraAuthMiddleware } = require('./middleware/auth');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { responsibleAIMiddleware } = require('./middleware/responsibleAI');

async function main() {
  const config = loadConfig();
  const app = express();

  // ── CORS ─────────────────────────────────────────────────────────────
  app.use((req, res, next) => {
    const allowedOrigins = [
      'https://teams.microsoft.com',
      'https://copilot.microsoft.com',
      'https://m365.cloud.microsoft',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.some((o) => origin.startsWith(o))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // ── Security headers ─────────────────────────────────────────────────
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // ── Body parsing ─────────────────────────────────────────────────────
  app.use(express.json({ limit: '4mb' }));

  // ── Rate limiting ────────────────────────────────────────────────────
  app.use(rateLimitMiddleware);

  // ── Entra ID authentication ──────────────────────────────────────────
  app.use(entraAuthMiddleware);

  // ── Responsible AI guardrails ────────────────────────────────────────
  app.use(responsibleAIMiddleware);

  // ── Static dashboard ─────────────────────────────────────────────────
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // ── API routes ───────────────────────────────────────────────────────
  app.use('/api', createComplianceRouter(config));

  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  app.listen(config.port, () => {
    console.log(`CompliYUG backend listening on http://localhost:${config.port}`);
    console.log(`Dashboard: http://localhost:${config.port}/`);
    console.log(`Security: CORS ✓ | Rate Limit ✓ | Auth ✓ | RAI ✓`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
