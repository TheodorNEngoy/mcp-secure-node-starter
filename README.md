# mcp-secure-node-starter

Secure-by-default Node.js starter for an MCP server.

Goal: make the safe thing the easy thing.

## What You Get

- CORS allowlist (no `*`, no reflected origins)
- Request size limit (via `Content-Length` guard; set a proxy limit too)
- A minimal MCP server with `ping` + `echo` tools
- CI: tests + optional `mcp-safety-scanner` gate

## Run

```bash
cd /Users/theodornengoy/Projects/mcp-secure-node-starter
npm install
npm test
npm start
```

## Configure

Environment variables:

- `PORT` (default: `8787`)
- `APP_NAME` (default: `Secure MCP Starter`)
- `ALLOWED_ORIGINS` (comma-separated origins, e.g. `https://chatgpt.com,https://chat.openai.com`)
- `MAX_BODY_BYTES` (default: `200000`)

Example:

```bash
ALLOWED_ORIGINS="https://chatgpt.com,https://chat.openai.com" PORT=8787 npm start
```

## Why This Matters

The most common “oops” when shipping tool servers is permissive CORS. This starter makes it hard to accidentally expose your tool endpoint to arbitrary websites.

