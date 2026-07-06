import { describe, expect, it } from "vitest";

import { computePopularityScores } from "../src/lib/analytics/popularity";
import { queryServers } from "../src/lib/query-servers";
import type { ServerEntry } from "../src/lib/schema";

function entry(name: string, title: string): ServerEntry {
  return {
    server: {
      name,
      title,
      description: `${title} MCP server`,
      version: "1.0.0",
    },
  };
}

const entries = [
  entry("io.github.example/alpha", "Alpha"),
  entry("com.neon/mcp", "Neon"),
  entry("com.postman/mcp", "Postman"),
];

describe("computePopularityScores", () => {
  it("attributes search counts to matching servers", () => {
    const scores = computePopularityScores(entries, {
      totalAllTime: 30,
      totalThisWeek: 8,
      terms: [
        { term: "neon", allTime: 23, thisWeek: 5 },
        { term: "postman", allTime: 7, thisWeek: 3 },
      ],
    });

    expect(scores.get("com.neon/mcp")).toEqual({ allTime: 23, thisWeek: 5 });
    expect(scores.get("com.postman/mcp")).toEqual({ allTime: 7, thisWeek: 3 });
    expect(scores.get("io.github.example/alpha")).toBeUndefined();
  });

  it("ignores terms matching too many servers", () => {
    const manyEntries = Array.from({ length: 30 }, (_, i) =>
      entry(`io.github.example/tool-${i}`, `Tool ${i}`),
    );

    const scores = computePopularityScores(manyEntries, {
      totalAllTime: 10,
      totalThisWeek: 10,
      terms: [{ term: "tool", allTime: 10, thisWeek: 10 }],
    });

    expect(scores.size).toBe(0);
  });
});

describe("queryServers with popularity", () => {
  it("sorts by all-time searches before alphabetical fallback", () => {
    const popularity = new Map([
      ["com.postman/mcp", { allTime: 20, thisWeek: 2 }],
      ["com.neon/mcp", { allTime: 5, thisWeek: 1 }],
    ]);

    const result = queryServers(entries, { limit: "10" }, { popularity });

    expect(result.servers.map((e) => e.server.name)).toEqual([
      "com.postman/mcp",
      "com.neon/mcp",
      "io.github.example/alpha",
    ]);
  });

  it("keeps alphabetical sorting without popularity", () => {
    const result = queryServers(entries, { limit: "10" });

    expect(result.servers.map((e) => e.server.name)).toEqual([
      "io.github.example/alpha",
      "com.neon/mcp",
      "com.postman/mcp",
    ]);
  });
});
