import { readFile } from "node:fs/promises";

import { ZodError } from "zod";

import { sourceRegistrySchema, type ServerEntry } from "./schema";

function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");
}

export async function loadRegistryFromFile(
  sourcePath: string,
): Promise<ServerEntry[]> {
  const rawContent = await readFile(sourcePath, "utf8");

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawContent);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown JSON parse error";
    throw new Error(
      `Invalid JSON in MCP registry source file at ${sourcePath}: ${detail}`,
    );
  }

  const result = sourceRegistrySchema.safeParse(parsedJson);
  if (!result.success) {
    throw new Error(
      `Invalid MCP registry structure in ${sourcePath}: ${formatZodError(result.error)}`,
    );
  }

  return result.data;
}
