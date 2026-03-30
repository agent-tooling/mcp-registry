import type { ServerEntry } from "./schema";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

type QueryInput = {
  search?: string;
  cursor?: string;
  limit?: string;
};

type QueryResult = {
  servers: ServerEntry[];
  metadata: {
    count: number;
    nextCursor?: string;
  };
};

type CursorPayload = {
  offset: number;
  search: string;
};

function normalizeSearch(search: string | undefined): string {
  return (search ?? "").trim().toLowerCase();
}

const NOISE_SEGMENTS = new Set(["com", "io", "github", "app", "mcp"]);

function sortLabel(entry: ServerEntry): string {
  if (entry.server.title) {
    return entry.server.title.toLowerCase();
  }
  return entry.server.name
    .split(/[./]/)
    .filter((seg) => seg && !NOISE_SEGMENTS.has(seg))
    .join(" ")
    .toLowerCase();
}

function parseLimit(limit: string | undefined): number {
  if (!limit) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number(limit);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(
      "Invalid 'limit' query parameter. It must be a positive integer.",
    );
  }

  return Math.min(parsed, MAX_LIMIT);
}

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): CursorPayload {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as Partial<CursorPayload>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.offset !== "number" ||
      !Number.isInteger(parsed.offset) ||
      parsed.offset < 0 ||
      typeof parsed.search !== "string"
    ) {
      throw new Error("Malformed cursor payload");
    }
    return { offset: parsed.offset, search: parsed.search };
  } catch {
    throw new Error("Invalid 'cursor' query parameter.");
  }
}

export function queryServers(
  entries: ServerEntry[],
  input: QueryInput,
): QueryResult {
  const search = normalizeSearch(input.search);
  const limit = parseLimit(input.limit);

  let offset = 0;
  if (input.cursor) {
    const cursorPayload = decodeCursor(input.cursor);
    if (cursorPayload.search !== search) {
      throw new Error("Cursor does not match current search filter.");
    }
    offset = cursorPayload.offset;
  }

  const filtered = entries
    .slice()
    .sort((a, b) => sortLabel(a).localeCompare(sortLabel(b)))
    .filter((entry) => {
      if (!search) {
        return true;
      }
      return entry.server.name.toLowerCase().includes(search);
    });

  const page = filtered.slice(offset, offset + limit);
  const nextOffset = offset + page.length;
  const nextCursor =
    nextOffset < filtered.length
      ? encodeCursor({ offset: nextOffset, search })
      : undefined;

  return {
    servers: page,
    metadata: {
      count: page.length,
      ...(nextCursor ? { nextCursor } : {}),
    },
  };
}
