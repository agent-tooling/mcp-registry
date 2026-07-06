# mcp-registry

Self-hostable read-only MCP registry server following the [official MCP registry specification](https://github.com/modelcontextprotocol/registry).

## Architecture

- **Next.js** app with a React Server Component UI and a [Hono](https://hono.dev/) API mounted at `/api`
- **Registry source** is a JSON file (local path or URL) matching the MCP registry schema
- **API** provides search, cursor pagination, and an OpenAPI spec at `/api/openapi.json`
- **UI** uses shadcn/ui with dark mode via next-themes and instant search via nuqs
- **Analytics** optionally records API requests and search terms to Postgres

## Development

```bash
pnpm install
cp .env.example .env
pnpm run dev
```

Set `MCP_REGISTRY_SOURCE_PATH` in `.env` to a local JSON file or a raw GitHub URL:

```env
MCP_REGISTRY_SOURCE_PATH=./fixtures/registry.json
```

### Branding

Customize the registry name and description shown in the UI and page metadata:

```env
SITE_NAME=add-mcp registry
SITE_DESCRIPTION=Registry for the add-mcp CLI, serving a cached version of the integrations.sh MCP servers.
SITE_REPOSITORY_URL=https://github.com/neon-solutions/add-mcp
```

All three are optional. `SITE_REPOSITORY_URL` adds a GitHub link to the header and footer.

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

### API Analytics

Set these variables to record API requests and search terms to Postgres:

```env
ENABLE_ANALYTICS=true
DATABASE_URL=postgres://...
ANALYTICS_SALT=replace-with-a-stable-random-secret
```

When enabled, mcp-registry creates an `api_requests` table if it does not already exist. It stores request metadata such as method, path, status, duration, search term, pagination flags, user agent, referrer, and a salted hash of the client IP address. Raw IP addresses are not stored.

### Search-based popularity

When `DATABASE_URL` is set, recorded search terms power additional features:

- The default (unfiltered) server listing in the UI and API is sorted by search popularity instead of alphabetically. A search term counts towards every server it matches, and overly generic terms (matching more than 25 servers) are ignored.
- The home page shows registry stats (total searches all time and this week) and trending search terms.
- Server cards show per-server search counts.

Without a database, the registry falls back to alphabetical sorting and hides the analytics UI.

## Example

An example server running mcp-registry is [mcp-registry.agent-tooling.dev](https://mcp.agent-tooling.dev/).
