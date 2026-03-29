import { z } from "zod";

const serverNamePattern = /^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/;

const officialMetaSchema = z
  .object({
    status: z.enum(["active", "deprecated", "deleted"]),
    statusMessage: z.string().max(500).optional(),
    publishedAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    isLatest: z.boolean().optional(),
  })
  .strict();

const responseMetaSchema = z
  .object({
    "io.modelcontextprotocol.registry/official": officialMetaSchema.optional(),
  })
  .passthrough();

const iconSchema = z
  .object({
    src: z.string().url(),
    mimeType: z
      .enum([
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/svg+xml",
        "image/webp",
      ])
      .optional(),
    sizes: z.array(z.string().regex(/^(\d+x\d+|any)$/)).optional(),
    theme: z.enum(["light", "dark"]).optional(),
  })
  .passthrough();

const serverDetailMetaSchema = z
  .object({
    "io.modelcontextprotocol.registry/publisher-provided": z
      .record(z.string(), z.unknown())
      .optional(),
  })
  .passthrough();

const repositorySchema = z
  .object({
    url: z.string().url().optional(),
    source: z.string().optional(),
    id: z.string().optional(),
    subfolder: z.string().optional(),
  })
  .passthrough();

export const serverDetailSchema = z
  .object({
    $schema: z.string().url().optional(),
    name: z.string().min(3).max(200).regex(serverNamePattern),
    description: z.string().min(1).max(100),
    title: z.string().min(1).max(100).optional(),
    repository: repositorySchema.optional(),
    version: z.string().min(1).max(255),
    websiteUrl: z.string().url().optional(),
    icons: z.array(iconSchema).optional(),
    packages: z.array(z.unknown()).optional(),
    remotes: z.array(z.unknown()).optional(),
    _meta: serverDetailMetaSchema.optional(),
  })
  .passthrough();

export const serverEntrySchema = z
  .object({
    server: serverDetailSchema,
    _meta: responseMetaSchema.optional(),
  })
  .passthrough();

export const sourceRegistrySchema = z.array(serverEntrySchema);

export const listResponseSchema = z.object({
  servers: z.array(serverEntrySchema),
  metadata: z.object({
    count: z.number().int().nonnegative(),
    nextCursor: z.string().optional(),
  }),
});

export type ServerEntry = z.infer<typeof serverEntrySchema>;
