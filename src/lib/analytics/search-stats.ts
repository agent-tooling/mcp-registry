import { sql } from "drizzle-orm";

import { getAnalyticsDb } from "./db";

export type SearchTermStat = {
  term: string;
  allTime: number;
  thisWeek: number;
};

export type SearchStats = {
  totalAllTime: number;
  totalThisWeek: number;
  terms: SearchTermStat[];
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const ERROR_RETRY_MS = 60 * 1000;

let cached: { value: SearchStats | null; expiresAt: number } | undefined;

type SearchStatsRow = {
  term: string;
  all_time: number;
  this_week: number;
};

async function fetchSearchStats(): Promise<SearchStats | null> {
  const db = getAnalyticsDb();
  if (!db) {
    return null;
  }

  const result = await db.execute<SearchStatsRow>(sql`
    select
      lower(trim(search)) as term,
      count(*)::int as all_time,
      (count(*) filter (where created_at >= now() - interval '7 days'))::int as this_week
    from api_requests
    where search is not null
      and trim(search) <> ''
      and route = '/api/v1/servers'
      and status < 500
    group by lower(trim(search))
    order by all_time desc
  `);

  const terms: SearchTermStat[] = result.rows.map((row) => ({
    term: row.term,
    allTime: row.all_time,
    thisWeek: row.this_week,
  }));

  return {
    totalAllTime: terms.reduce((sum, t) => sum + t.allTime, 0),
    totalThisWeek: terms.reduce((sum, t) => sum + t.thisWeek, 0),
    terms,
  };
}

const TRENDING_TERM_PATTERN = /^[a-z0-9][a-z0-9 ._-]{1,39}$/;
const TRENDING_MIN_COUNT = 2;

/**
 * Human-presentable search terms, ranked by activity this week with all-time
 * counts as tiebreaker. Filters out noise like single keystrokes or symbols.
 */
export function getTrendingTerms(stats: SearchStats, limit = 6): string[] {
  return stats.terms
    .filter(
      (t) =>
        TRENDING_TERM_PATTERN.test(t.term) && t.allTime >= TRENDING_MIN_COUNT,
    )
    .sort((a, b) => b.thisWeek - a.thisWeek || b.allTime - a.allTime)
    .slice(0, limit)
    .map((t) => t.term);
}

/**
 * Aggregated search term counts from API analytics. Returns null when no
 * analytics database is configured or the query fails, so callers can fall
 * back gracefully (e.g. alphabetical sorting).
 */
export async function getSearchStats(): Promise<SearchStats | null> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const value = await fetchSearchStats();
    cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown analytics error";
    console.error("Failed to load search stats:", message);
    cached = { value: null, expiresAt: Date.now() + ERROR_RETRY_MS };
    return null;
  }
}
