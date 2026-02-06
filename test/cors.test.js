import test from "node:test";
import assert from "node:assert/strict";

import { corsHeadersForOrigin } from "../src/cors.js";

test("corsHeadersForOrigin returns null for missing or disallowed origin", () => {
  const allowedOrigins = new Set(["https://chatgpt.com"]);
  assert.equal(corsHeadersForOrigin("", { allowedOrigins }), null);
  assert.equal(corsHeadersForOrigin("https://evil.example", { allowedOrigins }), null);
});

test("corsHeadersForOrigin returns allowlist headers for allowed origin", () => {
  const allowedOrigins = new Set(["https://chatgpt.com"]);
  const h = corsHeadersForOrigin("https://chatgpt.com", { allowedOrigins });
  assert.ok(h);
  assert.equal(h["Access-Control-Allow-Origin"], "https://chatgpt.com");
  assert.equal(h.Vary, "Origin");
});

