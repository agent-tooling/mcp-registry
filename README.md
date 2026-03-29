# mcp-registry

A read-only MCP registry service built with Bun, TypeScript, and Hono.

## Install

```bash
bun install
```

## Environment

Set `MCP_REGISTRY_SOURCE_PATH` in `.env` to a JSON file containing an array of server entries.

Example:

```bash
MCP_REGISTRY_SOURCE_PATH=./fixtures/registry.json
```

## Build

```bash
bun run build
```

Build output entry point:

```bash
dist/server.js
```

## Run

```bash
bun dist/server.js
```
