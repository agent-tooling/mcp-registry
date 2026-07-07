export type SiteConfig = {
  /** Display name of this registry, e.g. "add-mcp registry". */
  name: string;
  /** Short description shown in the hero and page metadata. */
  description: string;
  /** Optional link to the source or data repository behind this registry. */
  repositoryUrl?: string;
  /**
   * Custom image URL for the header logo. `null` renders the built-in
   * monochrome mark, which follows the active theme.
   */
  logoUrl: string | null;
};

const DEFAULT_NAME = "MCP Registry";
const DEFAULT_DESCRIPTION = "Browse and discover MCP servers.";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getSiteConfig(): SiteConfig {
  return {
    name: readEnv("SITE_NAME") ?? DEFAULT_NAME,
    description: readEnv("SITE_DESCRIPTION") ?? DEFAULT_DESCRIPTION,
    repositoryUrl: readEnv("SITE_REPOSITORY_URL"),
    logoUrl: readEnv("SITE_LOGO_URL") ?? null,
  };
}
