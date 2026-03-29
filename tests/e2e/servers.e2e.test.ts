import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setTimeout as delay } from "node:timers/promises";
import { join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

type StartedServer = {
  port: number;
  proc: ChildProcess;
};

const host = "127.0.0.1";
const testPort = 32000 + Math.floor(Math.random() * 1000);
const fixturePath = join(process.cwd(), "fixtures", "registry-e2e.json");

let started: StartedServer | undefined;

async function waitForServer(port: number): Promise<void> {
  const deadlineMs = Date.now() + 10_000;
  const url = `http://${host}:${String(port)}/health`;

  while (Date.now() < deadlineMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // no-op while process is booting
    }
    await delay(100);
  }

  throw new Error("Timed out waiting for server to start");
}

describe("mcp-registry e2e", () => {
  beforeAll(async () => {
    const proc = spawn("bun", ["run", "src/server.ts"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        HOST: host,
        PORT: String(testPort),
        MCP_REGISTRY_SOURCE_PATH: fixturePath,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    started = { port: testPort, proc };
    await waitForServer(testPort);
  });

  afterAll(async () => {
    if (!started) {
      return;
    }
    started.proc.kill("SIGTERM");
    await Promise.race([
      new Promise<void>((resolve) => {
        started?.proc.once("exit", () => resolve());
      }),
      delay(2_000).then(() => {
        started?.proc.kill("SIGKILL");
      }),
    ]);
  });

  it("responds to health checks", async () => {
    const response = await fetch(`http://${host}:${String(testPort)}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("lists servers with official response envelope", async () => {
    const response = await fetch(
      `http://${host}:${String(testPort)}/api/v1/servers?limit=2`,
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      servers: Array<{ server: { name: string } }>;
      metadata: { count: number; nextCursor?: string };
    };

    expect(body.metadata.count).toBe(2);
    expect(body.servers.length).toBe(2);
    expect(typeof body.metadata.nextCursor).toBe("string");
    expect(body.servers[0]?.server.name).toBe("io.github.example/filesystem");
  });

  it("supports search filtering and cursor pagination", async () => {
    const firstPageResponse = await fetch(
      `http://${host}:${String(testPort)}/api/v1/servers?search=io.github.example&limit=1`,
    );
    expect(firstPageResponse.status).toBe(200);
    const firstPage = (await firstPageResponse.json()) as {
      servers: Array<{ server: { name: string } }>;
      metadata: { count: number; nextCursor?: string };
    };

    expect(firstPage.metadata.count).toBe(1);
    expect(firstPage.servers.length).toBe(1);
    expect(typeof firstPage.metadata.nextCursor).toBe("string");

    const cursor = firstPage.metadata.nextCursor;
    expect(cursor).toBeTruthy();

    const secondPageResponse = await fetch(
      `http://${host}:${String(testPort)}/api/v1/servers?search=io.github.example&limit=1&cursor=${encodeURIComponent(cursor!)}`,
    );
    expect(secondPageResponse.status).toBe(200);
    const secondPage = (await secondPageResponse.json()) as {
      servers: Array<{ server: { name: string } }>;
      metadata: { count: number; nextCursor?: string };
    };

    expect(secondPage.metadata.count).toBe(1);
    expect(secondPage.servers.length).toBe(1);
  });
});
