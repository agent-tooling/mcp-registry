"use client";

import Link from "next/link";
import { ArrowLeftIcon, ExternalLinkIcon, GitBranchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type ServerData = {
  name: string;
  title?: string;
  description: string;
  version: string;
  websiteUrl?: string;
  repository?: { url?: string; source?: string; subfolder?: string };
  packages?: Package[];
  remotes?: Remote[];
};

type ServerDetailContentProps = {
  server: ServerData;
  officialStatus?: string;
};

export function ServerDetailContent({
  server,
  officialStatus,
}: ServerDetailContentProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:py-12">
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
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {server.title ?? server.name}
          </h1>
          {officialStatus && (
            <Badge variant="outline" className="shrink-0 capitalize">
              {officialStatus}
            </Badge>
          )}
        </div>
        <p className="font-mono text-sm text-muted-foreground break-all">
          {server.name}
        </p>
        <p className="text-muted-foreground">{server.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">v{server.version}</Badge>
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
          {server.repository?.url && (
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

      <hr className="my-8 border-border" />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Server details</h2>
        <Card>
          <CardContent className="grid gap-3 p-4 text-sm">
            <div className="grid grid-cols-[8rem_1fr] gap-2">
              <span className="font-medium text-muted-foreground">Name</span>
              <span className="font-mono break-all">{server.name}</span>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-2">
              <span className="font-medium text-muted-foreground">Version</span>
              <span>{server.version}</span>
            </div>
            {server.packages && server.packages.length > 0 && (
              <div className="grid grid-cols-[8rem_1fr] gap-2">
                <span className="font-medium text-muted-foreground">
                  Packages
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {server.packages.map((pkg) => (
                    <Badge
                      key={pkg.identifier}
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      {pkg.identifier}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {server.remotes && server.remotes.length > 0 && (
              <div className="grid grid-cols-[8rem_1fr] gap-2">
                <span className="font-medium text-muted-foreground">
                  Remotes
                </span>
                <div className="space-y-1">
                  {server.remotes.map((remote) => (
                    <div key={remote.url} className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs">
                        {remote.type}
                      </Badge>
                      <span className="font-mono text-xs break-all">
                        {remote.url}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {server.repository?.url && (
              <div className="grid grid-cols-[8rem_1fr] gap-2">
                <span className="font-medium text-muted-foreground">
                  Repository
                </span>
                <a
                  href={server.repository.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs underline underline-offset-4 break-all hover:text-foreground"
                >
                  {server.repository.url}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
