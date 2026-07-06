import { afterEach, describe, expect, it } from "vitest";

import { getSiteConfig } from "../src/lib/site-config";

const ENV_KEYS = ["SITE_NAME", "SITE_DESCRIPTION", "SITE_REPOSITORY_URL"];

afterEach(() => {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
});

describe("getSiteConfig", () => {
  it("returns defaults when no env vars are set", () => {
    expect(getSiteConfig()).toEqual({
      name: "MCP Registry",
      description: "Browse and discover MCP servers.",
      repositoryUrl: undefined,
    });
  });

  it("reads branding from env vars", () => {
    process.env.SITE_NAME = "add-mcp registry";
    process.env.SITE_DESCRIPTION = "Registry for the add-mcp CLI.";
    process.env.SITE_REPOSITORY_URL =
      "https://github.com/neon-solutions/add-mcp";

    expect(getSiteConfig()).toEqual({
      name: "add-mcp registry",
      description: "Registry for the add-mcp CLI.",
      repositoryUrl: "https://github.com/neon-solutions/add-mcp",
    });
  });

  it("treats empty strings as unset", () => {
    process.env.SITE_NAME = "  ";
    expect(getSiteConfig().name).toBe("MCP Registry");
  });
});
