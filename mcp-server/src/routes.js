/* ── REST API routes for MCP tools ────────────────────────────────────────
 *
 * These Express routes expose the MCP tool functions as standard REST
 * endpoints so they can be consumed via the mcp-openapi.yaml spec by
 * the Copilot API plugin runtime. This is the OpenAPI bridge layer.
 * ──────────────────────────────────────────────────────────────────────── */

import { Router } from "express";
import {
  readCompliancePolicies,
  writeComplianceFinding,
  readComplianceStatus,
  readRegulatoryUpdates,
  writeBreachRecord,
  readAuditTrail,
} from "./store.js";

export function createMcpApiRouter() {
  const router = Router();

  // GET /api/mcp/policies?framework=all|dpdp|iso27001
  router.get("/policies", (req, res) => {
    try {
      const result = readCompliancePolicies(req.query.framework);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/mcp/findings
  router.post("/findings", (req, res) => {
    try {
      const { title, severity } = req.body;
      if (!title) return res.status(400).json({ error: "title is required" });
      if (!severity) return res.status(400).json({ error: "severity is required" });
      const entry = writeComplianceFinding(req.body);
      res.status(201).json(entry);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/mcp/status
  router.get("/status", (_req, res) => {
    try {
      res.json(readComplianceStatus());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/mcp/regulatory-updates?impactLevel=all|high|medium|low
  router.get("/regulatory-updates", (req, res) => {
    try {
      res.json(readRegulatoryUpdates(req.query.impactLevel));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/mcp/breaches
  router.post("/breaches", (req, res) => {
    try {
      const { natureOfBreach } = req.body;
      if (!natureOfBreach) return res.status(400).json({ error: "natureOfBreach is required" });
      const entry = writeBreachRecord(req.body);
      res.status(201).json(entry);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/mcp/audit-trail?limit=50
  router.get("/audit-trail", (req, res) => {
    try {
      res.json(readAuditTrail(req.query.limit));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
