import test from "node:test";
import assert from "node:assert/strict";

import { createHttpServer } from "../src/http.js";

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve(`http://127.0.0.1:${addr.port}`);
    });
  });
}

test("OPTIONS /mcp rejects disallowed origins", async () => {
  const server = createHttpServer({
    appName: "Test",
    mcpPath: "/mcp",
    allowedOrigins: new Set(["https://chatgpt.com"]),
    maxBodyBytes: 200_000,
  });

  const base = await listen(server);
  try {
    const res = await fetch(`${base}/mcp`, { method: "OPTIONS", headers: { Origin: "https://evil.example" } });
    assert.equal(res.status, 403);
  } finally {
    server.close();
  }
});

test("OPTIONS /mcp allows allowlisted origins", async () => {
  const server = createHttpServer({
    appName: "Test",
    mcpPath: "/mcp",
    allowedOrigins: new Set(["https://chatgpt.com"]),
    maxBodyBytes: 200_000,
  });

  const base = await listen(server);
  try {
    const res = await fetch(`${base}/mcp`, { method: "OPTIONS", headers: { Origin: "https://chatgpt.com" } });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), "https://chatgpt.com");
  } finally {
    server.close();
  }
});

