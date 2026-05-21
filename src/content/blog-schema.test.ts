import { describe, expect, test } from "vitest";
import { z } from "astro/zod";

import {
  blogFrontmatterDate,
  blogRuntimeDate,
  createBlogFrontmatterSchema,
} from "./blog-schema";

const schema = createBlogFrontmatterSchema({
  date: blogFrontmatterDate,
  image: () => z.string().min(1),
});

describe("blogRuntimeDate", () => {
  test("normalizes Date values to YYYY-MM-DD", () => {
    expect(blogRuntimeDate.parse(new Date("2025-06-09T12:34:56Z"))).toBe(
      "2025-06-09",
    );
  });

  test("leaves string dates untouched for Astro runtime parsing", () => {
    expect(blogRuntimeDate.parse("2025-06-09")).toBe("2025-06-09");
  });
});

describe("createBlogFrontmatterSchema", () => {
  test("accepts minimal valid frontmatter", () => {
    expect(
      schema.parse({
        title: "Post",
        description: "Description",
        date: "2025-06-09",
        slug: "post-slug",
      }),
    ).toEqual({
      title: "Post",
      description: "Description",
      date: "2025-06-09",
      slug: "post-slug",
    });
  });

  test("applies image and thumbnail defaults", () => {
    const result = schema.parse({
      title: "Post",
      description: "Description",
      date: "2025-06-09",
      slug: "post-slug",
      image: {
        src: "./image.jpg",
        thumbnail: {},
      },
    });

    expect(result.image).toMatchObject({
      src: "./image.jpg",
      alt: "",
      size: "default",
      position: "center",
      objectPosition: "center",
      hidden: false,
      thumbnail: {
        fill: "fill",
        size: "100%",
      },
    });
  });

  test("accepts light and dark image sources", () => {
    expect(() =>
      schema.parse({
        title: "Post",
        description: "Description",
        date: "2025-06-09",
        slug: "post-slug",
        image: {
          src: {
            light: "./light.jpg",
            dark: "./dark.jpg",
          },
        },
      }),
    ).not.toThrow();
  });

  test("rejects invalid slug, tag, and percentage values", () => {
    const result = schema.safeParse({
      title: "Post",
      description: "Description",
      date: "2025-06-09",
      slug: "Post Slug",
      tags: ["Valid"],
      image: {
        src: "./image.jpg",
        thumbnail: {
          size: "large",
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual([
      "slug",
      "tags.0",
      "image.thumbnail.size",
    ]);
  });

  test("rejects unknown frontmatter keys", () => {
    const result = schema.safeParse({
      title: "Post",
      description: "Description",
      date: "2025-06-09",
      slug: "post-slug",
      extra: true,
    });

    expect(result.success).toBe(false);
  });

  test("rejects archive names that resolve to reserved route slugs", () => {
    const result = schema.safeParse({
      title: "Post",
      description: "Description",
      date: "2025-06-09",
      slug: "post-slug",
      archive: "Tags!",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual([
      "archive",
    ]);
  });
});
