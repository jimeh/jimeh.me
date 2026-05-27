import { describe, expect, test } from "vitest";

import {
  BLOG_POST_SLUG_PATTERN,
  blogRoutePath,
  blogRouteSlug,
  blogRouteYear,
  blogSourceSlug,
} from "./blog-route";

describe("BLOG_POST_SLUG_PATTERN", () => {
  test("accepts lowercase slug segments with optional nesting", () => {
    expect(BLOG_POST_SLUG_PATTERN.test("simple-post")).toBe(true);
    expect(BLOG_POST_SLUG_PATTERN.test("nested/post-slug-2")).toBe(true);
  });

  test("rejects uppercase, empty, and malformed slug segments", () => {
    expect(BLOG_POST_SLUG_PATTERN.test("Simple-Post")).toBe(false);
    expect(BLOG_POST_SLUG_PATTERN.test("nested//post")).toBe(false);
    expect(BLOG_POST_SLUG_PATTERN.test("-post")).toBe(false);
    expect(BLOG_POST_SLUG_PATTERN.test("post-")).toBe(false);
  });
});

test("derives route year from the first four date characters", () => {
  expect(blogRouteYear("2025-06-09")).toBe("2025");
});

test("derives source slug from file and directory ids", () => {
  expect(blogSourceSlug("2025/example-post")).toBe("example-post");
  expect(blogSourceSlug("2025/example-post/index")).toBe("example-post");
  expect(blogSourceSlug("/2025/example-post/")).toBe("example-post");
  expect(blogSourceSlug("index")).toBe("index");
});

test("uses frontmatter slug as the canonical route slug", () => {
  expect(blogRouteSlug({ date: "2025-06-09", slug: "custom-slug" })).toBe(
    "custom-slug",
  );
});

test("builds canonical route path from date and slug", () => {
  expect(blogRoutePath({ date: "2025-06-09", slug: "custom-slug" })).toBe(
    "2025/custom-slug",
  );
});
