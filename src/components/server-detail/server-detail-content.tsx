"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  GitForkIcon,
  ScaleIcon,
  StarIcon,
  TagIcon,
  CircleDotIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServerIcon } from "@/components/server-icon";
import { InstallConfigurator } from "./install-configurator";

type EnvVar = {
  name: string;
  description?: string;
  isRequired?: boolean;
  isSecret?: boolean;
};

type Package = {
  registryType: string;
  identifier: string;
  version?: string;
  runtimeHint?: string;
  transport?: { type: string };
  environmentVariables?: EnvVar[];
};

type RemoteHeader = {
  name: string;
  description?: string;
  isRequired?: boolean;
  isSecret?: boolean;
  format?: string;
  default?: string;
};

type Remote = {
  type: string;
  url: string;
  headers?: RemoteHeader[];
};

type GitHubRepoData = {
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  license: string | null;
  updatedAt: string;
  htmlUrl: string;
  latestRelease: {
    tagName: string;
    publishedAt: string;
    htmlUrl: string;
  } | null;
};

type Icon = {
  src: string;
  mimeType?: string;
  sizes?: string[];
  theme?: "light" | "dark";
};

type ServerData = {
  name: string;
  title?: string;
  description: string;
  version: string;
  websiteUrl?: string;
  repository?: { url?: string; source?: string; subfolder?: string };
  icons?: Icon[];
  packages?: Package[];
  remotes?: Remote[];
};

type ServerDetailContentProps = {
  server: ServerData;
  officialStatus?: string;
  githubData?: GitHubRepoData | null;
};

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function GitHubCard({ data }: { data: GitHubRepoData }) {
  return (
    <a href={data.htmlUrl} target="_blank" rel="noreferrer" className="block">
      <Card className="transition-colors hover:border-primary/50">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <GitBranchIcon className="size-4 text-muted-foreground" />
            <span className="font-mono text-sm font-medium">
              {data.fullName}
            </span>
          </div>

          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <StarIcon className="size-3.5" />
              {formatNumber(data.stars)}
            </span>
            <span className="inline-flex items-center gap-1">
              <GitForkIcon className="size-3.5" />
              {formatNumber(data.forks)}
            </span>
            <span className="inline-flex items-center gap-1">
              <CircleDotIcon className="size-3.5" />
              {formatNumber(data.openIssues)} issues
            </span>
            {data.language && (
              <span className="inline-flex items-center gap-1">
                <span className="size-2.5 rounded-full bg-primary" />
                {data.language}
              </span>
            )}
            {data.license && (
              <span className="inline-flex items-center gap-1">
                <ScaleIcon className="size-3.5" />
                {data.license}
              </span>
            )}
          </div>

          {data.latestRelease && (
            <div className="flex items-center gap-1.5 text-xs">
              <TagIcon className="size-3.5 text-muted-foreground" />
              <span className="font-mono">{data.latestRelease.tagName}</span>
              <span className="text-muted-foreground">
                released{" "}
                {formatDistanceToNow(new Date(data.latestRelease.publishedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Updated{" "}
            {formatDistanceToNow(new Date(data.updatedAt), {
              addSuffix: true,
            })}
          </p>
        </CardContent>
      </Card>
    </a>
  );
}

export function ServerDetailContent({
  server,
  officialStatus,
  githubData,
}: ServerDetailContentProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <Link
        href="/"
        className={buttonVariants({
          variant: "ghost",
          className: "mb-6 gap-1.5 pl-2 text-muted-foreground",
        })}
      >
        <ArrowLeftIcon className="size-4" />
        Back to registry
      </Link>

      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <ServerIcon
            icons={server.icons}
            title={server.title ?? server.name}
            size="lg"
          />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {server.title ?? server.name}
                </h1>
                <Badge variant="secondary" className="shrink-0">
                  v{server.version}
                </Badge>
              </div>
              {officialStatus && (
                <Badge variant="outline" className="shrink-0 capitalize">
                  {officialStatus}
                </Badge>
              )}
            </div>
            <p className="font-mono text-sm text-muted-foreground break-all">
              {server.name}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground">{server.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          {server.websiteUrl && (
            <a
              href={server.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-6 gap-1 text-xs",
              })}
            >
              <ExternalLinkIcon className="size-3" />
              Website
            </a>
          )}
          {!githubData && server.repository?.url && (
            <a
              href={server.repository.url}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-6 gap-1 text-xs",
              })}
            >
              <GitBranchIcon className="size-3" />
              Repository
            </a>
          )}
        </div>
      </div>

      <hr className="my-8 border-border" />

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Install with add-mcp</h2>
            <p className="text-sm text-muted-foreground">
              Configure your installation and copy the command below. Uses{" "}
              <a
                href="https://github.com/neondatabase/add-mcp"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                add-mcp
              </a>{" "}
              to install the server into your agent of choice.
            </p>
            <InstallConfigurator
              packages={server.packages}
              remotes={server.remotes}
            />
          </section>
        </div>

        {githubData && (
          <aside className="w-full shrink-0 lg:w-72">
            <div className="lg:sticky lg:top-8">
              <h2 className="mb-3 text-lg font-semibold">Repository</h2>
              <GitHubCard data={githubData} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
