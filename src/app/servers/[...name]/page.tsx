import { notFound } from "next/navigation";

import { ServerDetailContent } from "@/components/server-detail/server-detail-content";
import { loadRegistryFromFile } from "@/lib/load-registry";
import { getServerByName, getSourcePath } from "@/lib/registry-service";

export const revalidate = 60;

export async function generateStaticParams() {
  const entries = await loadRegistryFromFile(getSourcePath());
  return entries.map((entry) => ({
    name: entry.server.name.split("/"),
  }));
}

type PageProps = {
  params: Promise<{ name: string[] }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { name } = await params;
  const serverName = name.join("/");
  const entry = await getServerByName(serverName);

  if (!entry) {
    return { title: "Server not found" };
  }

  return {
    title: `${entry.server.title ?? entry.server.name} - MCP Registry`,
    description: entry.server.description,
  };
}

export default async function ServerDetailPage({ params }: PageProps) {
  const { name } = await params;
  const serverName = name.join("/");
  const entry = await getServerByName(serverName);

  if (!entry) {
    notFound();
  }

  const server = entry.server;
  const officialStatus =
    entry._meta?.["io.modelcontextprotocol.registry/official"]?.status;

  return (
    <div className="min-h-screen bg-background">
      <ServerDetailContent
        server={{
          name: server.name,
          title: server.title,
          description: server.description,
          version: server.version,
          websiteUrl: server.websiteUrl,
          repository: server.repository,
          packages: server.packages,
          remotes: server.remotes,
        }}
        officialStatus={officialStatus}
      />
    </div>
  );
}
