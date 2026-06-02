import { describe, expect, test } from "vitest";
import type { ImageMetadata } from "astro";
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
  test("omits email address details", async () => {
    const markdown = await publicProfileMarkdown();

    expect(markdown).not.toContain("mailto:");
    expect(markdown).not.toContain(siteConfig.email.rot13Href);
    expect(markdown).not.toContain(siteConfig.email.rot13Text);
  });
});

describe("llmsDirectoryMarkdown", () => {
  test("sorts posts and omits missing descriptions", async () => {
    const markdown = await llmsDirectoryMarkdown(
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
  test("omits missing descriptions", async () => {
    const markdown = await blogPostMarkdown(
      post("post-title", { title: "Post" }),
    );

    expect(markdown).toContain("# Post");
    expect(markdown).not.toContain("undefined");
  });

  test("places descriptions after frontmatter and title", async () => {
    const markdown = await blogPostMarkdown(
      post("post-title", {
        description: "Post description.",
        title: "Post",
      }),
    );

    expect(markdown).toContain(
      "---\nsource: https://jimeh.me/blog/2025/post-title/\n" +
        "date: 2025-01-01\n---\n\n# Post\n\nPost description.",
    );
    expect(markdown.indexOf("# Post")).toBeLessThan(
      markdown.indexOf("Post description."),
    );
  });

  test("renders post metadata as YAML frontmatter", async () => {
    const markdown = await blogPostMarkdown(
      post("post-title", {
        archive: "zydev.info",
        tags: ["macos", "liquid-glass"],
        title: "Post",
        updatedDate: "2025-02-02",
      }),
    );

    expect(markdown).toContain(
      [
        "---",
        "source: https://jimeh.me/blog/2025/post-title/",
        "date: 2025-01-01",
        "updatedDate: 2025-02-02",
        "archive: zydev.info",
        "tags:",
        "  - macos",
        "  - liquid-glass",
        "---",
        "",
        "# Post",
      ].join("\n"),
    );
    expect(markdown).not.toContain("\nSource:");
    expect(markdown).not.toContain("\nDate:");
    expect(markdown).not.toContain("\nTags:");
  });

  test("labels general archive posts as jimeh.me in frontmatter", async () => {
    const markdown = await blogPostMarkdown(
      post("post-title", {
        archive: true,
        title: "Post",
      }),
    );

    expect(markdown).toContain("archive: jimeh.me");
    expect(markdown).not.toContain("archive: Archives");
  });

  test("resolves featured image assets through the asset resolver", async () => {
    const markdown = await blogPostMarkdown(
      post("post-title", {
        image: {
          src: imageMetadata(
            "/@fs/Users/jimeh/project/src/content/blog/post/cover.jpg",
          ),
          alt: "Cover",
          size: "default",
          position: "center",
          objectPosition: "center",
          hidden: false,
        },
      }),
      {
        resolveAsset: (_post, source) => {
          expect(source).toBe(
            "/@fs/Users/jimeh/project/src/content/blog/post/cover.jpg",
          );

          return "/_astro/cover.hash.jpg";
        },
      },
    );

    expect(markdown).toContain(
      "![Cover](https://jimeh.me/_astro/cover.hash.jpg)",
    );
    expect(markdown).not.toContain("/@fs/");
  });

  test("keeps already-built featured image asset URLs", async () => {
    const markdown = await blogPostMarkdown(
      post("post-title", {
        image: {
          src: imageMetadata("/_astro/cover.hash.jpg"),
          alt: "Cover",
          size: "default",
          position: "center",
          objectPosition: "center",
          hidden: false,
        },
      }),
      {
        resolveAsset: () => {
          throw new Error("Unexpected asset resolver call.");
        },
      },
    );

    expect(markdown).toContain(
      "![Cover](https://jimeh.me/_astro/cover.hash.jpg)",
    );
  });

  test("formats generated Markdown from transparent MDX wrappers", async () => {
    const markdown = await blogPostMarkdown(
      post(
        "post-title",
        { title: "Post" },
        [
          'import { Image, ImageGrid } from "@mdx/index";',
          "",
          "Before.",
          "",
          '<ImageGrid columns={2} size="wide">',
          '  <Image src="./one.jpg" alt="One" />',
          '  <Image src="./two.jpg" alt="Two" />',
          "</ImageGrid>",
        ].join("\n"),
      ),
      { resolveAsset: (_post, src) => `/assets/${src.split("/").pop()}` },
    );

    expect(markdown).toContain(
      "Before.\n\n![One](/assets/one.jpg)\n\n![Two](/assets/two.jpg)",
    );
    expect(markdown).not.toMatch(/\n[ \t]+\n/);
    expect(markdown).not.toMatch(/\n{3,}/);
  });
});

describe("postListMarkdown", () => {
  test("sorts posts with the shared blog comparator", () => {
    const markdown = postListMarkdown([
      post("older", { date: "2024-01-01", title: "Older" }),
      post("newer-b", { date: "2025-01-01", title: "Newer B" }),
      post("newer-a", { date: "2025-01-01", title: "Newer A" }),
    ]);

    expect(markdown).toContain("[Newer B]");
    expect(markdown).toContain("[Newer A]");
    expect(markdown).toContain("[Older]");
    expect(markdown.indexOf("[Newer B]")).toBeLessThan(
      markdown.indexOf("[Newer A]"),
    );
    expect(markdown.indexOf("[Newer A]")).toBeLessThan(
      markdown.indexOf("[Older]"),
    );
  });
});

function imageMetadata(src: string): ImageMetadata {
  return {
    src,
    width: 800,
    height: 400,
    format: "jpg",
  } as ImageMetadata;
}
