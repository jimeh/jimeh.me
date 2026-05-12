import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** Accepts string or YAML-parsed Date, normalizes to YYYY-MM-DD. */
const dateStr = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v));

const percentageStr = z
  .string()
  .regex(/^\d+(?:\.\d+)?%$/, "Must be a percentage like '90%'");

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) => {
    const imageSource = z.union([
      image(),
      z.object({
        light: image(),
        dark: image().optional(),
      }),
    ]);

    return z.object({
      title: z.string(),
      description: z.string(),
      date: dateStr,
      updatedDate: dateStr.optional(),
      tags: z.array(z.string()).optional(),
      archive: z.union([z.boolean(), z.string().min(1)]).optional(),
      image: z
        .object({
          src: imageSource,
          alt: z.string().default(""),
          caption: z.string().optional(),
          size: z
            .union([z.enum(["default", "wide", "full"]), percentageStr])
            .default("default"),
          position: z.enum(["center", "left", "right"]).default("center"),
          /** Remove top margin so the image sits flush with content. */
          flush: z.boolean().optional(),
          /** Disable the Fancybox lightbox for this image. */
          noLightbox: z.boolean().optional(),
          /** Lightbox gallery group name. */
          gallery: z.string().optional(),
          /** CSS aspect-ratio for the displayed image box (e.g. "16/9"). */
          aspect: z.string().optional(),
          /** CSS object-position when aspect is set (e.g. "top", "center"). */
          objectPosition: z.string().default("center"),
          /** Attribution / credit line shown below the caption. */
          credit: z
            .object({
              text: z.string(),
              href: z.url().optional(),
              position: z.enum(["left", "center", "right"]).default("center"),
            })
            .optional(),
          /** Hide from automatic rendering at the top of the post body. */
          hidden: z.boolean().default(false),
        })
        .optional(),
      thumbnail: z
        .object({
          src: imageSource.optional(),
          /** How the thumbnail fills the thumbnail container. */
          fill: z.enum(["fill", "fit"]).default("fill"),
          /** CSS object-position for cropped thumbnail images. */
          objectPosition: z.string().optional(),
          /** Draw the thumbnail inside a bordered background. */
          frame: z.boolean().optional(),
          /** Image size within thumbnail boxes, as a percentage. */
          size: percentageStr.default("100%"),
        })
        .optional(),
    });
  },
});

export const collections = { blog };
