# 🏢 CompliYUG - Enterprise Agent Submission
**Track: Battle #3 - Enterprise Agents for Microsoft 365 Copilot**

Welcome to the official submission for **CompliYUG**, an intelligent Enterprise Agent designed to act as your **DPDP & ISO Compliance Copilot**. 

This document explicitly maps the capabilities of our project to the evaluation criteria of the Enterprise Agents challenge, making it easy for judges to review and score our submission.

---

## 📋 Evaluation Criteria Mapping

### ✅ Core Requirements

#### 1. 💬 Microsoft 365 Copilot Chat Agent (Required)
**Status: Satisfied**
CompliYUG is built as a **Declarative Agent (DA)** using the Microsoft 365 Agents Toolkit (ATK). It is designed to be hosted directly within the Microsoft 365 Copilot Chat interface. Users can interact seamlessly with the agent in natural language to run compliance scans, analyze documents for PII, and generate audit reports without leaving their workflow. 
* **Evidence:** See `appPackage/declarativeAgent.json` and `appPackage/manifest.json` in the repository.

#### 2. 🧠 Microsoft IQ Integration (Required)
**Status: Satisfied**
CompliYUG heavily leverages **Work IQ**—the intelligence layer behind Microsoft 365 Copilot. By extending context memory using custom Skills and Tools (via our API Plugin), the agent reasons over workplace data (emails, chats, documents) to identify compliance gaps against the **DPDP Act 2023** and **ISO/IEC 27001:2022**. It understands work context to classify sensitive PII seamlessly.
* **Evidence:** See our AI orchestration logic and tool definitions in `appPackage/apiPlugin.json`.

---

### 🌟 Bonus Criteria

#### 3. 📦 MCP Apps (Higher Rating)
**Status: Satisfied**
We have packaged our compliance capabilities as an **MCP App**. Our backend orchestration is exposed through a complete Microsoft 365 Copilot extensibility experience, encapsulating data classification and gap analysis into reusable agent functions.
* **Evidence:** The repository contains the `mcp-server` directory, fully configured to expose endpoints and operations as an MCP app.

#### 4. 🔌 External MCP Server Integration (Optional)
**Status: Satisfied**
CompliYUG integrates with a custom, external **Model Context Protocol (MCP) server** built in Node.js. 
* **Read Operations:** The agent retrieves complex compliance policies and historical breach logs from the external server.
* **Write Operations:** When a breach is detected, the agent writes the 72-hour Breach Notification ticket directly to the external backend system.
* **Evidence:** See the logic inside the `backend/` and `mcp-server/src/` directories.

#### 5. 🔐 OAuth Security for MCP Server (Optional)
**Status: Satisfied**
Security is paramount for an enterprise compliance tool. Our MCP server is protected using **OAuth 2.0 via Microsoft Entra ID**. The agent securely acquires tokens on behalf of the user to access the MCP endpoints.
* **Evidence:** See the authentication implementation in `mcp-server/src/auth.js` and the OAuth2 configuration in our app manifest.

---

## 🛡️ Enterprise Security & Best Practices

In alignment with the challenge's strict security guidelines, CompliYUG enforces the following:

* **No Hardcoded Secrets:** We utilize a `.env` configuration (included in `.gitignore`) and ensure no credentials or tenant IDs are committed to the repository.
* **Microsoft Entra ID Authentication:** We leverage Microsoft Entra ID to securely authenticate users before they can trigger gap analyses or classify data.
* **Principle of Least Privilege:** Granular API scopes are defined so the agent only accesses the necessary M365 data required for compliance checks.
* **Data Protection:** No actual customer PII is stored persistently by the agent; data is processed in-memory during classification and then discarded, ensuring GDPR and DPDP compliance.

---

## 🚀 Quick Start / How to Run

1. **Prerequisites:** Ensure you have Node.js, Visual Studio Code, and the Microsoft 365 Agents Toolkit (ATK) installed.
2. **Setup:**
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install MCP server dependencies
   cd ../mcp-server && npm install
   ```
3. **Environment Variables:** Create a `.env` file in the root based on `.env.example` and input your specific App IDs and Tenant IDs.
4. **Deploy:** Use the Teams Toolkit extension in VS Code (`F5`) to provision and sideload the agent into your Microsoft 365 Copilot test tenant.
5. **Dashboard UI:** Navigate to `backend/public/index.html` (hosted locally) to view the companion Fluent Design Compliance Dashboard.

---
*Thank you for reviewing CompliYUG! We are excited to empower enterprises to navigate the complex landscape of digital compliance directly from Microsoft 365.*
