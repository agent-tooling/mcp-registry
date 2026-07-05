import path from "node:path";

import { unstable_cache } from "next/cache";

import { loadRegistryFromFile } from "./load-registry";
import { queryServers } from "./query-servers";
import type { ServerEntry } from "./schema";

const PAGE_SIZE = 20;

type PageResult = {
  servers: ServerEntry[];
  pageIndex: number;
  prevPageIndex?: number;
  nextPageIndex?: number;
};

export function getSourcePath(): string {
  return (
    process.env.MCP_REGISTRY_SOURCE_PATH ??
    path.resolve(process.cwd(), "fixtures/registry.json")
  );
}

const loadRegistryCached = unstable_cache(
  async () => loadRegistryFromFile(getSourcePath()),
  ["registry-entries"],
  { revalidate: 300 },
);

export async function getAllServers(): Promise<ServerEntry[]> {
  return loadRegistryCached();
}

export async function getServerByName(
  name: string,
): Promise<ServerEntry | undefined> {
  const entries = await loadRegistryCached();
  return entries.find((entry) => entry.server.name === name);
}

export async function listServersByPage(input: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PageResult> {
  const entries = await loadRegistryCached();
  const search = (input.search ?? "").trim();
  const limit = input.limit ?? PAGE_SIZE;
  const requestedPage = input.page ?? 0;
  const safePage =
    Number.isInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0;

  let cursor: string | undefined;
  let currentPage = 0;
  let result = queryServers(entries, {
    search,
    limit: String(limit),
  });

  while (currentPage < safePage && result.metadata.nextCursor) {
    cursor = result.metadata.nextCursor;
    currentPage += 1;
    result = queryServers(entries, {
      search,
      limit: String(limit),
      cursor,
    });
  }

  const reachedRequestedPage = currentPage === safePage;

  return {
    servers: result.servers,
    pageIndex: currentPage,
    prevPageIndex: currentPage > 0 ? currentPage - 1 : undefined,
    nextPageIndex:
      reachedRequestedPage && result.metadata.nextCursor
        ? currentPage + 1
        : undefined,
  };
}
