import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  blogRuntimeDate,
  createBlogFrontmatterSchema,
} from "./content/blog-schema";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    createBlogFrontmatterSchema({ date: blogRuntimeDate, image }),
});

export const collections = { blog };
