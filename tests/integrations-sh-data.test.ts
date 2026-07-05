import { describe, expect, it } from "vitest";

import { loadRegistryFromFile } from "../src/lib/load-registry";

describe("integrations.sh registry data", () => {
  it("keeps the package-only overlay in MCP registry shape", async () => {
    const entries = await loadRegistryFromFile(
      "./data/integrations-sh-overlay.json",
    );

    expect(entries.length).toBeGreaterThan(0);
    expect(
      entries.some((entry) => entry.server.name === "dev.firecrawl/mcp"),
    ).toBe(true);
    expect(
      entries.some(
        (entry) => entry.server.name === "io.github.microsoft/playwright-mcp",
      ),
    ).toBe(true);
  });
});
