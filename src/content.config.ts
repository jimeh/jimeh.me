import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** Accepts string or YAML-parsed Date, normalizes to YYYY-MM-DD. */
const dateStr = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v));

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: dateStr,
      updatedDate: dateStr.optional(),
      tags: z.array(z.string()).optional(),
      image: z
        .object({
          src: image(),
          alt: z.string().default(""),
          caption: z.string().optional(),
          size: z
            .union([
              z.enum(["default", "wide", "full"]),
              z.string().regex(/^\d+%$/, "Must be a percentage like '50%'"),
            ])
            .default("default"),
          position: z.enum(["center", "left", "right"]).default("center"),
          /** Hide from automatic rendering at the top of the post body. */
          hidden: z.boolean().default(false),
        })
        .optional(),
    }),
});

export const collections = { blog };
