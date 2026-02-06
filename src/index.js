import { readConfig } from "./config.js";
import { createHttpServer } from "./http.js";

const config = readConfig(process.env);
const server = createHttpServer(config);

server.listen(config.port, () => {
  console.log(`${config.appName} listening on :${config.port}`);
  console.log(`MCP: ${config.mcpPath}`);
  console.log(`Allowed origins: ${[...config.allowedOrigins].join(", ")}`);
});

