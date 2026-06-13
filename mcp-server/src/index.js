/* ── CompliYUG MCP Server ────────────────────────────────────────────────
 *
 * Model Context Protocol server for compliance data operations.
 * Exposes 6 tools (3 read + 3 write) over SSE transport.
 * Secured with Microsoft Entra ID OAuth 2.0 token validation.
 *
 * Transport: Server-Sent Events (SSE) via Express
 * Auth: Bearer token validated against Entra ID JWKS
 * Data: Persistent JSON file store in ./data/
 * ──────────────────────────────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { requireAuth } from "./auth.js";
import { TOOLS } from "./tools.js";
import { createMcpApiRouter } from "./routes.js";

const PORT = Number(process.env.PORT || 3001);
const app = express();

app.use(express.json());

/* ── CORS ─────────────────────────────────────────────────────────────── */
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://teams.microsoft.com",
    "https://copilot.microsoft.com",
    "https://m365.cloud.microsoft",
    "http://localhost:3000",
    "http://localhost:3001",
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.some((o) => origin.startsWith(o))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ── OAuth middleware ──────────────────────────────────────────────────── */
app.use(requireAuth);

/* ── Health endpoint (unauthenticated) ────────────────────────────────── */
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "compliyug-mcp-server",
    protocol: "MCP/SSE",
    tools: TOOLS.map((t) => t.name),
    timestamp: new Date().toISOString(),
  });
});

/* ── REST API routes (OpenAPI bridge for Copilot plugin) ───────────────── */
app.use("/api/mcp", createMcpApiRouter());

/* ── SSE transport for MCP ────────────────────────────────────────────── */

// Track active transports for cleanup
const transports = new Map();

app.get("/sse", async (req, res) => {
  console.log(`[mcp] New SSE connection from ${req.ip}`);

  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;
  transports.set(sessionId, transport);

  // Create a fresh MCP server instance per session
  const server = createMcpServer();

  res.on("close", () => {
    console.log(`[mcp] SSE connection closed: ${sessionId}`);
    transports.delete(sessionId);
  });

  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports.get(sessionId);

  if (!transport) {
    return res.status(400).json({ error: "Unknown session" });
  }

  await transport.handlePostMessage(req, res);
});

/* ── MCP Server factory ──────────────────────────────────────────────── */

function createMcpServer() {
  const server = new McpServer({
    name: "CompliYUG Compliance MCP Server",
    version: "1.0.0",
  });

  // Register all tools from the tools module
  for (const tool of TOOLS) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema.properties,
      async (args) => {
        try {
          console.log(`[mcp] Tool call: ${tool.name}`, JSON.stringify(args).slice(0, 200));
          const result = tool.handler(args);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (err) {
          console.error(`[mcp] Tool error (${tool.name}):`, err.message);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: err.message }),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  return server;
}

/* ── Start server ─────────────────────────────────────────────────────── */

app.listen(PORT, () => {
  console.log(`CompliYUG MCP Server listening on http://localhost:${PORT}`);
  console.log(`  SSE endpoint:  http://localhost:${PORT}/sse`);
  console.log(`  Messages:      http://localhost:${PORT}/messages`);
  console.log(`  Health:        http://localhost:${PORT}/health`);
  console.log(`  Tools: ${TOOLS.map((t) => t.name).join(", ")}`);
});
