import Link from "next/link";

import { OpenApiMenu } from "@/components/openapi-menu";
import { ServerSearchInput } from "@/components/search/server-search-input";
import { ThemeSelector } from "@/components/themes/selector";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listServersByPage } from "@/lib/registry-service";

export const revalidate = 60;

type SearchParams = {
  search?: string;
  page?: string;
};

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

function safePageIndex(value: string | undefined): number {
  const parsed = Number(value ?? "0");
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function buildPageHref(search: string, page: number): string {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  params.set("page", String(page));
  return `/?${params.toString()}`;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const search = (params.search ?? "").trim();
  const page = safePageIndex(params.page);
  const pageData = await listServersByPage({ search, page });
  const currentPage = pageData.pageIndex + 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section with grid background */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

        <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
                MCP Registry
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-pretty text-base text-muted-foreground md:text-lg">
                  Browse and discover MCP servers.
                </p>
                <OpenApiMenu />
              </div>
            </div>
            <ThemeSelector />
          </div>

          <div className="mt-8">
            <ServerSearchInput className="max-w-md" />
          </div>
        </div>
      </section>

      {/* Search results */}
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8 md:py-10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {currentPage}</p>
          <div className="flex gap-2">
            {pageData.prevPageIndex === undefined ? (
              <Button type="button" variant="outline" disabled>
                {"<"}
              </Button>
            ) : (
              <Link
                href={buildPageHref(search, pageData.prevPageIndex)}
                className={buttonVariants({ variant: "outline" })}
              >
                {"<"}
              </Link>
            )}

            {pageData.nextPageIndex === undefined ? (
              <Button type="button" variant="outline" disabled>
                {">"}
              </Button>
            ) : (
              <Link
                href={buildPageHref(search, pageData.nextPageIndex)}
                className={buttonVariants({ variant: "outline" })}
              >
                {">"}
              </Link>
            )}
          </div>
        </div>

        {pageData.servers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              {search
                ? "No servers found for this search."
                : "No servers available."}
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-3">
            {pageData.servers.map((entry) => {
              const server = entry.server;
              const status =
                entry._meta?.["io.modelcontextprotocol.registry/official"]
                  ?.status;

              return (
                <Link
                  key={server.name}
                  href={`/servers/${server.name}`}
                  className="group"
                >
                  <Card className="transition-colors group-hover:border-primary/50">
                    <CardHeader className="space-y-1 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base md:text-lg">
                          {server.title ?? server.name}
                        </CardTitle>
                        {status ? (
                          <span className="inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium capitalize">
                            {status}
                          </span>
                        ) : null}
                      </div>
                      <CardDescription className="break-all">
                        {server.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1.5 px-3 pb-3 pt-0 text-sm">
                      <p className="text-muted-foreground">
                        {server.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md bg-muted px-2 py-1">
                          version: {server.version}
                        </span>
                        {server.websiteUrl ? (
                          <span className="rounded-md bg-muted px-2 py-1">
                            website
                          </span>
                        ) : null}
                        {server.repository?.url ? (
                          <span className="rounded-md bg-muted px-2 py-1">
                            repository
                          </span>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
