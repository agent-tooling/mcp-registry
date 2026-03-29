import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { appConfig } from "./lib/config";
import { loadRegistryFromFile } from "./lib/load-registry";
import { queryServers } from "./lib/query-servers";
import { listResponseSchema } from "./lib/schema";

const registryEntries = await loadRegistryFromFile(appConfig.server.sourcePath);

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/api/v1/servers", (c) => {
  const search = c.req.query("search");
  const cursor = c.req.query("cursor");
  const limit = c.req.query("limit");

  let result;
  try {
    result = queryServers(registryEntries, { search, cursor, limit });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Invalid query";
    throw new HTTPException(400, { message: detail });
  }

  const validatedResponse = listResponseSchema.parse(result);
  return c.json(validatedResponse);
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";
  console.error("Unhandled server error:", message);
  return c.json({ error: "Internal server error" }, 500);
});

Bun.serve({
  fetch: app.fetch,
  hostname: appConfig.server.host,
  port: appConfig.server.port,
});

console.log(
  `mcp-registry listening on http://${appConfig.server.host}:${String(appConfig.server.port)} with ${String(registryEntries.length)} entries`,
);
