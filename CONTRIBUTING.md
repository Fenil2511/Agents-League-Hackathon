# Contributing to CompliYUG

Thank you for your interest in contributing to CompliYUG!

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies for both backend and MCP server
4. Copy `.env.example` files and configure your local environment
5. Run tests before submitting a pull request

## Development Setup

```bash
# Backend
cd backend
npm install
copy .env.example .env
npm start

# MCP Server
cd mcp-server
npm install
copy .env.example .env
npm start
```

## Running Tests

```bash
cd backend
npm test
```

## Security

- **Never** commit `.env` files, API keys, tokens, or tenant IDs
- Use `.env.example` files as templates — they contain placeholder values only
- For production, use Azure Key Vault for secret management

## Code of Conduct

This project follows the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
