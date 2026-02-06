import { createServer } from "node:http";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { corsHeadersForOrigin } from "./cors.js";
import { createMcpServer } from "./mcp.js";

function normalizePath(p) {
  const s = typeof p === "string" ? p : "/";
  const noQuery = s.split("?")[0].split("#")[0];
  const withoutTrailing = noQuery !== "/" ? noQuery.replace(/\/+$/, "") : noQuery;
  return withoutTrailing || "/";
}

export function createHttpServer(config) {
  const { mcpPath, allowedOrigins, maxBodyBytes, appName } = config;
  const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);

  return createServer(async (req, res) => {
    if (!req.url) return void res.writeHead(400).end("Missing URL");

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const path = normalizePath(url.pathname);

    if (req.method === "GET" && path === "/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff" });
      return res.end(JSON.stringify({ ok: true, app: appName }));
    }

    // CORS is only relevant for the MCP endpoint.
    const origin = String(req.headers.origin ?? "");
    const cors = corsHeadersForOrigin(origin, { allowedOrigins });

    if (req.method === "OPTIONS" && path === mcpPath) {
      if (!cors) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
        return res.end("Origin not allowed");
      }
      res.writeHead(204, { ...cors, "X-Content-Type-Options": "nosniff" });
      return res.end();
    }

    if (path === mcpPath && req.method && MCP_METHODS.has(req.method)) {
      if (origin && !cors) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
        return res.end("Origin not allowed");
      }

      const contentLength = Number(req.headers["content-length"] ?? 0);
      if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
        res.writeHead(413, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
        return res.end("Request too large");
      }

      if (cors) {
        for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
      }

      const server = createMcpServer({ appName });
      const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });

      res.on("close", () => {
        transport.close();
        server.close();
      });

      try {
        await server.connect(transport);
        await transport.handleRequest(req, res);
      } catch (err) {
        // Avoid leaking details to clients; log server-side.
        console.error("MCP request error:", err);
        if (!res.headersSent) res.writeHead(500).end("Internal server error");
      }
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
    return res.end("Not found");
  });
}

