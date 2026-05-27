import { expect, test } from "vitest";

import {
  blogArchiveTagUrl,
  blogArchiveTagsUrl,
  blogArchivesUrl,
  blogArchiveUrl,
  blogIndexUrl,
  blogNamedArchiveTagUrl,
  blogNamedArchiveTagsUrl,
  blogPostRoute,
  blogPostUrl,
  blogPostYear,
  blogTagUrl,
  blogTagsUrl,
  blogYearUrl,
} from "./blog-url";

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

test("returns listing and tag URLs", () => {
  expect(blogIndexUrl()).toBe("/blog/");
  expect(blogYearUrl("2025")).toBe("/blog/2025/");
  expect(blogTagsUrl()).toBe("/blog/tags/");
  expect(blogTagUrl("macos")).toBe("/blog/tags/macos/");
});

test("returns archive URLs", () => {
  expect(blogArchivesUrl()).toBe("/blog/archives/");
  expect(blogArchiveUrl("zydev-info")).toBe("/blog/archives/zydev-info/");
  expect(blogArchiveTagsUrl()).toBe("/blog/archives/tags/");
  expect(blogArchiveTagUrl("php")).toBe("/blog/archives/tags/php/");
  expect(blogNamedArchiveTagsUrl("zydev-info")).toBe(
    "/blog/archives/zydev-info/tags/",
  );
  expect(blogNamedArchiveTagUrl("zydev-info", "macos")).toBe(
    "/blog/archives/zydev-info/tags/macos/",
  );
});
