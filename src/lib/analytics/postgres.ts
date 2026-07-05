import { createHash } from "node:crypto";

import postgres from "postgres";

type ApiRequestAnalytics = {
  method: string;
  path: string;
  status: number;
  search?: string;
  limit?: string;
  cursorPresent: boolean;
  userAgent?: string;
  referrer?: string;
  ip?: string;
  durationMs: number;
};

const enabled = process.env.ENABLE_ANALYTICS === "true";
const databaseUrl = process.env.DATABASE_URL;
const analyticsSalt = process.env.ANALYTICS_SALT;

let sqlClient: ReturnType<typeof postgres> | undefined;
let schemaPromise: Promise<void> | undefined;

function getSqlClient(): ReturnType<typeof postgres> | undefined {
  if (!enabled || !databaseUrl) {
    return undefined;
  }
  sqlClient ??= postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 5,
    prepare: false,
  });
  return sqlClient;
}

function parseLimit(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function routeForPath(path: string): string {
  if (path === "/api/health") return "/api/health";
  if (path === "/api/openapi.json") return "/api/openapi.json";
  if (path === "/api/v1/servers") return "/api/v1/servers";
  return path;
}

function hashIp(ip: string | undefined): string | null {
  if (!ip || !analyticsSalt) return null;
  return createHash("sha256").update(`${analyticsSalt}:${ip}`).digest("hex");
}

async function ensureAnalyticsSchema(
  sql: ReturnType<typeof postgres>,
): Promise<void> {
  schemaPromise ??= (async () => {
    try {
      await sql`
        create table if not exists api_requests (
          id bigserial primary key,
          created_at timestamptz not null default now(),
          method text not null,
          path text not null,
          route text not null,
          status integer not null,
          search text,
          limit_value integer,
          cursor_present boolean not null default false,
          user_agent text,
          referrer text,
          ip_hash text,
          duration_ms integer not null
        )
      `;
      await sql`
        create index if not exists api_requests_created_at_idx
        on api_requests (created_at desc)
      `;
      await sql`
        create index if not exists api_requests_search_idx
        on api_requests (search)
        where search is not null and search <> ''
      `;
      await sql`
        create index if not exists api_requests_route_created_at_idx
        on api_requests (route, created_at desc)
      `;
    } catch (error) {
      schemaPromise = undefined;
      throw error;
    }
  })();
  await schemaPromise;
}

export async function recordApiRequest(
  event: ApiRequestAnalytics,
): Promise<void> {
  const sql = getSqlClient();
  if (!sql) {
    return;
  }

  try {
    await ensureAnalyticsSchema(sql);
    await sql`
      insert into api_requests (
        method,
        path,
        route,
        status,
        search,
        limit_value,
        cursor_present,
        user_agent,
        referrer,
        ip_hash,
        duration_ms
      )
      values (
        ${event.method},
        ${event.path},
        ${routeForPath(event.path)},
        ${event.status},
        ${event.search?.trim() || null},
        ${parseLimit(event.limit)},
        ${event.cursorPresent},
        ${event.userAgent || null},
        ${event.referrer || null},
        ${hashIp(event.ip)},
        ${event.durationMs}
      )
    `;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown analytics error";
    console.error("Failed to record API analytics:", message);
  }
}
