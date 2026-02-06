import { z } from "zod";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://chatgpt.com",
  "https://chat.openai.com",
];

function normalizeOrigin(input) {
  try {
    return new URL(String(input)).origin;
  } catch {
    return null;
  }
}

function parseAllowedOrigins(raw) {
  const set = new Set(DEFAULT_ALLOWED_ORIGINS);
  const parts = String(raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const p of parts) {
    const o = normalizeOrigin(p);
    if (o) set.add(o);
  }
  return set;
}

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  APP_NAME: z.string().trim().default("Secure MCP Starter"),
  ALLOWED_ORIGINS: z.string().optional(),
  MAX_BODY_BYTES: z.coerce.number().int().min(1_000).max(10_000_000).default(200_000),
});

export function readConfig(env = process.env) {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".") || "env"}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${msg}`);
  }

  const { PORT, APP_NAME, ALLOWED_ORIGINS, MAX_BODY_BYTES } = parsed.data;
  return {
    port: PORT,
    appName: APP_NAME,
    allowedOrigins: parseAllowedOrigins(ALLOWED_ORIGINS),
    maxBodyBytes: MAX_BODY_BYTES,
    mcpPath: "/mcp",
  };
}

