import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createMcpServer({ appName }) {
  const server = new McpServer({ name: appName.toLowerCase().replace(/\s+/g, "-"), version: "0.1.0" });

  server.registerTool(
    "ping",
    {
      title: "Ping",
      description: "Returns pong.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => ({
      content: [{ type: "text", text: "pong" }],
    })
  );

  server.registerTool(
    "echo",
    {
      title: "Echo",
      description: "Echo back text (example tool with schema validation).",
      inputSchema: z.object({ text: z.string().max(2000) }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (args) => ({
      content: [{ type: "text", text: String(args?.text ?? "") }],
    })
  );

  return server;
}

