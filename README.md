# mcp-registry

Self-hostable read-only MCP registry server following the [official MCP registry specification](https://github.com/modelcontextprotocol/registry).

## Architecture

- **Next.js** app with a React Server Component UI and a [Hono](https://hono.dev/) API mounted at `/api`
- **Registry source** is a JSON file (local path or URL) matching the MCP registry schema
- **API** provides search, cursor pagination, and an OpenAPI spec at `/api/openapi.json`
- **UI** uses shadcn/ui with dark mode via next-themes and instant search via nuqs

## Development

```bash
bun install
cp .env.example .env
bun run dev
```

Set `MCP_REGISTRY_SOURCE_PATH` in `.env` to a local JSON file or a raw GitHub URL:

```env
MCP_REGISTRY_SOURCE_PATH=./fixtures/registry.json
```

Other scripts:

```bash
bun run typecheck    # type check
bun run test         # run tests
bun run fmt          # format with prettier
bun run fmt:check    # check formatting
```

## Deployment

Deploy to Vercel or any platform that supports Next.js:

```bash
vercel
```

Set `MCP_REGISTRY_SOURCE_PATH` as an environment variable pointing to your registry JSON file.

## Example

An example server running mcp-registry is [mcp-registry.agent-tooling.dev](https://mcp.agent-tooling.dev/).
