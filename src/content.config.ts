import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** Accepts string or YAML-parsed Date, normalizes to YYYY-MM-DD. */
const dateStr = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v));

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: dateStr,
    updatedDate: dateStr.optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
