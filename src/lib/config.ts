import { configSchema, server } from "better-env/config-schema";
import { z } from "zod";

export const appConfig = configSchema("McpRegistry", {
  sourcePath: server({ env: "MCP_REGISTRY_SOURCE_PATH" }),
  host: server({
    env: "HOST",
    schema: z.string().default("0.0.0.0"),
  }),
  port: server({
    env: "PORT",
    schema: z.coerce.number().int().min(1).max(65535).default(3000),
  }),
});
