import { describe, expect, test } from "vitest";
import { siteConfig } from "../data/site";
import {
  type BlogPost,
  blogPostMarkdown,
  llmsDirectoryMarkdown,
  postListMarkdown,
  publicProfileMarkdown,
} from "./markdown-export";

function post(
  id: string,
  data: Partial<BlogPost["data"]> = {},
  body = "",
): BlogPost {
  return {
    body,
    data: {
      date: "2025-01-01",
      slug: id,
      title: id,
      ...data,
    },
    id,
  } as BlogPost;
}

describe("publicProfileMarkdown", () => {
  test("omits email address details", () => {
    const markdown = publicProfileMarkdown();

    expect(markdown).not.toContain("mailto:");
    expect(markdown).not.toContain(siteConfig.email.rot13Href);
    expect(markdown).not.toContain(siteConfig.email.rot13Text);
  });
});

describe("llmsDirectoryMarkdown", () => {
  test("sorts posts and omits missing descriptions", () => {
    const markdown = llmsDirectoryMarkdown(
      [
        post("older", { date: "2024-01-01", title: "Older" }),
        post("newer", {
          date: "2025-01-01",
          description: "Newer description",
          title: "Newer",
        }),
      ],
      [],
    );

    expect(markdown.indexOf("[Newer]")).toBeLessThan(
      markdown.indexOf("[Older]"),
    );
    expect(markdown).toContain("[Newer](https://jimeh.me/blog/2025/newer.md):");
    expect(markdown).toContain("Newer description");
    expect(markdown).toContain("[Older](https://jimeh.me/blog/2024/older.md)");
    expect(markdown).not.toContain("undefined");
  });
});

describe("blogPostMarkdown", () => {
  test("omits missing descriptions", () => {
    const markdown = blogPostMarkdown(post("post-title", { title: "Post" }));

    expect(markdown).toContain("# Post");
    expect(markdown).not.toContain("undefined");
  });
});

describe("postListMarkdown", () => {
  test("sorts posts with the shared blog comparator", () => {
    const markdown = postListMarkdown([
      post("older", { date: "2024-01-01", title: "Older" }),
      post("newer-b", { date: "2025-01-01", title: "Newer B" }),
      post("newer-a", { date: "2025-01-01", title: "Newer A" }),
    ]);

    expect(markdown.indexOf("[Newer B]")).toBeLessThan(
      markdown.indexOf("[Newer A]"),
    );
    expect(markdown.indexOf("[Newer A]")).toBeLessThan(
      markdown.indexOf("[Older]"),
    );
  });
});
