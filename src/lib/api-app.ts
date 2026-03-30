import path from "node:path";

import { track } from "@vercel/analytics/server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, openAPIRouteHandler, resolver } from "hono-openapi";
import { z } from "zod";

import { analyticsConfig } from "./analytics/config";
import { loadRegistryFromFile } from "./load-registry";
import { queryServers } from "./query-servers";
import { listResponseSchema, type ServerEntry } from "./schema";

const querySchema = z.object({
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.string().optional(),
});
const healthResponseSchema = z.object({ status: z.literal("ok") });

function getSourcePath(): string {
  return (
    process.env.MCP_REGISTRY_SOURCE_PATH ??
    path.resolve(process.cwd(), "../registry.json")
  );
}

let entriesPromise: Promise<ServerEntry[]> | undefined;
async function getRegistryEntries(): Promise<ServerEntry[]> {
  if (!entriesPromise) {
    entriesPromise = loadRegistryFromFile(getSourcePath());
  }
  return entriesPromise;
}

export const apiApp = new Hono().basePath("/api");

apiApp.use(async (c, next) => {
  await next();
  if (!analyticsConfig.isEnabled) return;
  track("api_request", {
    path: c.req.path,
    method: c.req.method,
    status: c.res.status,
    search: c.req.query("search") ?? "",
  }).catch(() => {});
});

apiApp.get(
  "/health",
  describeRoute({
    tags: ["system"],
    summary: "Health check",
    responses: {
      200: {
        description: "Service is healthy.",
        content: {
          "application/json": {
            schema: resolver(healthResponseSchema),
          },
        },
      },
    },
  }),
  (c) => c.json({ status: "ok" }),
);

apiApp.get(
  "/v1/servers",
  describeRoute({
    tags: ["servers"],
    summary: "List MCP servers",
    description:
      "Returns paginated MCP servers and supports search and cursor pagination.",
    parameters: [
      {
        in: "query",
        name: "search",
        required: false,
        schema: { type: "string" },
        description: "Case-insensitive match against server name.",
      },
      {
        in: "query",
        name: "cursor",
        required: false,
        schema: { type: "string" },
        description: "Cursor from the previous response for pagination.",
      },
      {
        in: "query",
        name: "limit",
        required: false,
        schema: { type: "string" },
        description: "Maximum number of servers per page.",
      },
    ],
    responses: {
      200: {
        description: "Successful server listing response.",
        content: {
          "application/json": {
            schema: resolver(listResponseSchema),
          },
        },
      },
      400: {
        description: "Invalid query parameters.",
      },
    },
  }),
  async (c) => {
    const parsedQuery = querySchema.parse({
      search: c.req.query("search"),
      cursor: c.req.query("cursor"),
      limit: c.req.query("limit"),
    });
    const entries = await getRegistryEntries();

    try {
      const result = queryServers(entries, parsedQuery);
      return c.json(listResponseSchema.parse(result));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Invalid query";
      throw new HTTPException(400, { message: detail });
    }
  },
);

apiApp.get(
  "/openapi.json",
  openAPIRouteHandler(apiApp, {
    documentation: {
      info: {
        title: "MCP Registry API",
        version: "1.0.0",
        description:
          "Read-only API for querying MCP registry servers with search and cursor pagination.",
      },
    },
    exclude: ["/api/openapi.json"],
  }),
);

apiApp.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";
  console.error("Unhandled API error:", message);
  return c.json({ error: "Internal server error" }, 500);
});
