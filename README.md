# mcp-registry

Self-hostable read-only MCP registry server following the [official MCP registry specification](https://github.com/modelcontextprotocol/registry).

## Architecture

- **Next.js** app with a React Server Component UI and a [Hono](https://hono.dev/) API mounted at `/api`
- **Registry source** is a JSON file (local path or URL) matching the MCP registry schema
- **Default registry data** is generated from [integrations.sh](https://integrations.sh) and merged with a small package-only overlay
- **API** provides search, cursor pagination, and an OpenAPI spec at `/api/openapi.json`
- **UI** uses shadcn/ui with dark mode via next-themes and instant search via nuqs

To be listed in the add-mcp registry, add your MCP server to [integrations.sh](https://integrations.sh). This registry is regenerated from integrations.sh data.

## Development

```bash
pnpm install
cp .env.example .env
pnpm run registry:sync
pnpm run dev
```

Set `MCP_REGISTRY_SOURCE_PATH` in `.env` to a local JSON file or a raw GitHub URL:

```env
MCP_REGISTRY_SOURCE_PATH=./data/integrations-sh-registry.json
```

Regenerate the integrations.sh-backed registry whenever the upstream catalog should be refreshed:

```bash
pnpm run registry:sync
```

Other scripts:

```bash
pnpm run typecheck    # type check
pnpm run test         # run tests
pnpm run fmt          # format with prettier
pnpm run fmt:check    # check formatting
```

## Deployment

Deploy to Vercel or any platform that supports Next.js:

```bash
vercel
```

Set `MCP_REGISTRY_SOURCE_PATH` as an environment variable pointing to your registry JSON file.

## Example

An example server running mcp-registry is [mcp-registry.agent-tooling.dev](https://mcp.agent-tooling.dev/).
