/* ── MCP Tool Definitions ────────────────────────────────────────────────
 *
 * Each tool corresponds to a compliance operation exposed via the
 * Model Context Protocol. Tools support both read and write operations
 * to demonstrate full MCP server integration capabilities.
 * ──────────────────────────────────────────────────────────────────────── */

import {
  readCompliancePolicies,
  writeComplianceFinding,
  readComplianceStatus,
  readRegulatoryUpdates,
  writeBreachRecord,
  readAuditTrail,
} from "./store.js";

/**
 * Tool schemas for MCP registration.
 * Each tool has a name, description, input schema, and handler.
 */
export const TOOLS = [
  {
    name: "read_compliance_policies",
    description:
      "Retrieve compliance policy requirements for DPDP Act 2023 and/or ISO/IEC 27001:2022. " +
      "Returns structured policy data including section references, titles, and descriptions. " +
      "Use this when the user asks about compliance requirements, what controls exist, or needs policy reference data.",
    inputSchema: {
      type: "object",
      properties: {
        framework: {
          type: "string",
          enum: ["all", "dpdp", "iso27001"],
          description: "Which compliance framework to retrieve. Use 'all' for both DPDP and ISO 27001.",
          default: "all",
        },
      },
      required: [],
    },
    handler: (args) => readCompliancePolicies(args.framework),
  },

  {
    name: "write_compliance_finding",
    description:
      "Record a new compliance finding or violation in the compliance database. " +
      "Creates a persistent record with severity, framework reference, affected asset, and remediation plan. " +
      "Use this when a compliance issue is identified that needs tracking and remediation.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Short title describing the compliance finding",
        },
        description: {
          type: "string",
          description: "Detailed description of the finding",
        },
        severity: {
          type: "string",
          enum: ["critical", "high", "medium", "low"],
          description: "Severity level of the finding",
        },
        framework: {
          type: "string",
          enum: ["DPDP", "ISO27001", "Both"],
          description: "Compliance framework the finding relates to",
        },
        controlId: {
          type: "string",
          description: "Specific control ID (e.g. 'DPDP-S8' or 'A.5.34')",
        },
        affectedAsset: {
          type: "string",
          description: "The system, document, or process affected",
        },
        remediationPlan: {
          type: "string",
          description: "Proposed remediation steps",
        },
      },
      required: ["title", "severity"],
    },
    handler: (args) => writeComplianceFinding(args),
  },

  {
    name: "read_compliance_status",
    description:
      "Get the current compliance posture summary including total findings, open issues by severity, " +
      "breach count, and a computed compliance health score (0-100). " +
      "Use this when the user asks for compliance status, health check, or risk overview.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: () => readComplianceStatus(),
  },

  {
    name: "read_regulatory_updates",
    description:
      "Retrieve the latest regulatory updates and guidance related to DPDP Act 2023 and ISO 27001:2022. " +
      "Returns dated updates with impact levels and source references. " +
      "Use this when the user asks about recent regulatory changes, new rules, or compliance deadlines.",
    inputSchema: {
      type: "object",
      properties: {
        impactLevel: {
          type: "string",
          enum: ["all", "high", "medium", "low"],
          description: "Filter updates by impact level",
          default: "all",
        },
      },
      required: [],
    },
    handler: (args) => readRegulatoryUpdates(args.impactLevel),
  },

  {
    name: "write_breach_record",
    description:
      "Create a new data breach incident record in the compliance database. " +
      "Automatically calculates the 72-hour DPDP Act Section 40 reporting deadline. " +
      "Use this when a data breach is reported and needs to be formally recorded and tracked.",
    inputSchema: {
      type: "object",
      properties: {
        natureOfBreach: {
          type: "string",
          description: "Description of what happened (e.g. 'Unauthorised access to employee records')",
        },
        extentOfBreach: {
          type: "string",
          description: "Scope of data affected (e.g. '850 employee records')",
        },
        location: {
          type: "string",
          description: "System or location where the breach occurred",
        },
        likelyImpact: {
          type: "string",
          description: "Potential consequences for data principals",
        },
        detectedAt: {
          type: "string",
          description: "ISO 8601 timestamp of when the breach was detected. Defaults to now.",
        },
      },
      required: ["natureOfBreach"],
    },
    handler: (args) => writeBreachRecord(args),
  },

  {
    name: "read_audit_trail",
    description:
      "Read the audit trail of all compliance operations performed through the MCP server. " +
      "Returns a chronological log of actions (reads, writes, status checks) for governance and accountability. " +
      "Use this when the user needs an audit log, activity history, or accountability records.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of audit entries to return (default 50, max 200)",
          default: 50,
        },
      },
      required: [],
    },
    handler: (args) => readAuditTrail(args.limit),
  },
];
