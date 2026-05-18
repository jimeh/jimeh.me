import { expect, test } from "vitest";

import { blogPostRoute, blogPostUrl, blogPostYear } from "./blog-url";

type BlogPost = Parameters<typeof blogPostRoute>[0];

function post(date: string, slug: string): BlogPost {
  return { data: { date, slug } } as BlogPost;
}

test("returns the year from a post date", () => {
  expect(blogPostYear(post("2025-06-09", "liquid-glass"))).toBe("2025");
});

test("returns the canonical blog route", () => {
  expect(blogPostRoute(post("2025-06-09", "liquid-glass"))).toBe(
    "2025/liquid-glass",
  );
});

test("returns the canonical site-relative blog URL", () => {
  expect(blogPostUrl(post("2025-06-09", "liquid-glass"))).toBe(
    "/blog/2025/liquid-glass/",
  );
});
