import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import type { BlogPostFile } from "./blog-content.ts";
import { archiveSlug, builtSiteFailures } from "./check-site.ts";

let tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { force: true, recursive: true });
  }
  tempDirs = [];
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "jimeh-check-site-"));
  tempDirs.push(dir);
  return dir;
}

function writeFile(root: string, path: string, source = ""): void {
  const filePath = join(root, path);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, source);
}

function postHtml(markdownUrl: string): string {
  return [
    "data-post-markdown-toggle",
    "data-post-markdown-view",
    "data-post-markdown-code",
    "data-post-markdown-raw",
    "data-post-markdown-download",
    'data-language="markdown"',
    `href="${markdownUrl}"`,
    'symbol id="ai:octicon:copy-16"',
    'symbol id="ai:octicon:check-16"',
    'id="code-copy-btn-tpl"',
  ].join(" ");
}

function post(
  id: string,
  frontmatter: Record<string, boolean | string | string[]>,
): BlogPostFile {
  const source = [
    "---",
    ...Object.entries(frontmatter).map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map((item) => `"${item}"`).join(", ")}]`;
      }
      return `${key}: ${value}`;
    }),
    "---",
    "",
    "Body",
  ].join("\n");

  return {
    dirPath: "/tmp/post",
    fileName: "index.md",
    filePath: "/tmp/post/index.md",
    id,
    source,
  };
}

function writeRequiredSiteFiles(root: string): void {
  for (const path of ["index.html", "llms.txt", "sitemap-index.xml"]) {
    writeFile(root, path);
  }
  writeFile(
    root,
    "llms.txt",
    ["## Profile", "## Links", "https://github.com/jimeh"].join("\n"),
  );
  writeFile(
    root,
    "blog/index.html",
    '<a href="/blog/archives/">Archives</a><article aria-label="Latest post">',
  );
  writeFile(root, "blog/index.md");
  writeFile(root, "blog/tags/index.html", '<a href="/blog/tags/astro/">');
  writeFile(
    root,
    "rss.xml",
    [
      "<title>Jim Myhrberg (jimeh)</title>",
      "<description>Software Engineering Mercenary</description>",
      "<link>https://example.com/</link>",
    ].join(""),
  );
  writeFile(root, "sitemap-0.xml", "https://example.com/llms.txt");
  writeFile(root, "favicon.ico");
  writeFile(root, "apple-touch-icon.png");
  writeFile(root, "img/jimeh-4.2.0.jpg");
}

describe("archiveSlug", () => {
  test("slugifies archive labels for built archive routes", () => {
    expect(archiveSlug("Zydev.info")).toBe("zydev-info");
    expect(archiveSlug(" Old WordPress Dump! ")).toBe("old-wordpress-dump");
  });
});

describe("builtSiteFailures", () => {
  test("reports missing required build files", () => {
    const distDir = tempDir();

    expect(builtSiteFailures({ distDir, posts: [] })).toEqual(
      expect.arrayContaining([
        "index.html: expected built file to exist.",
        "rss.xml: expected built file to exist.",
      ]),
    );
  });

  test("accepts canonical post, archive, tag, and feed outputs", () => {
    const distDir = tempDir();
    const siteUrl = "https://example.com";
    const mainUrl = `${siteUrl}/blog/2025/main/`;
    const archiveUrl = `${siteUrl}/blog/2024/archive/`;
    const generalArchiveUrl = `${siteUrl}/blog/2023/general-archive/`;
    const posts = [
      post("2025/main/index", {
        archive: false,
        title: "Main",
        description: "Main description",
        date: "2025-06-09",
        slug: "main",
        tags: ["astro"],
      }),
      post("2024/archive/index", {
        archive: "Zydev.info",
        title: "Archive",
        description: "Archive description",
        date: "2024-01-01",
        slug: "archive",
        tags: ["php"],
      }),
      post("2023/general-archive/index", {
        archive: true,
        title: "General Archive",
        description: "General archive description",
        date: "2023-01-01",
        slug: "general-archive",
        tags: ["life"],
      }),
    ];

    writeRequiredSiteFiles(distDir);
    writeFile(
      distDir,
      "rss.xml",
      [
        "<title>Jim Myhrberg (jimeh)</title>",
        "<description>Software Engineering Mercenary</description>",
        "<link>https://example.com/</link>",
        mainUrl,
      ].join(""),
    );
    writeFile(
      distDir,
      "sitemap-0.xml",
      `${siteUrl}/llms.txt\n${mainUrl}\n${archiveUrl}\n${generalArchiveUrl}`,
    );
    writeFile(
      distDir,
      "blog/2025/main/index.html",
      postHtml("/blog/2025/main.md"),
    );
    writeFile(distDir, "blog/2025/main.md", `Source: ${mainUrl}`);
    writeFile(
      distDir,
      "blog/2024/archive/index.html",
      postHtml("/blog/2024/archive.md"),
    );
    writeFile(distDir, "blog/2024/archive.md", `Source: ${archiveUrl}`);
    writeFile(
      distDir,
      "blog/2023/general-archive/index.html",
      postHtml("/blog/2023/general-archive.md"),
    );
    writeFile(
      distDir,
      "blog/2023/general-archive.md",
      `Source: ${generalArchiveUrl}`,
    );
    writeFile(distDir, "blog/2025/index.html", '<a href="/blog/"><article');
    writeFile(distDir, "blog/tags/astro/index.html", "<article");
    writeFile(
      distDir,
      "blog/archives/index.html",
      '<a href="/blog/archives/zydev-info/">',
    );
    writeFile(distDir, "blog/archives/index.md");
    writeFile(
      distDir,
      "blog/archives/tags/index.html",
      '<a href="/blog/archives/tags/life/">',
    );
    writeFile(distDir, "blog/archives/tags/life/index.html", "<article");
    writeFile(distDir, "blog/archives/zydev-info/index.html", "<article");
    writeFile(distDir, "blog/archives/zydev-info.md");
    writeFile(
      distDir,
      "blog/archives/zydev-info/tags/index.html",
      '<a href="/blog/archives/zydev-info/tags/php/">',
    );
    writeFile(
      distDir,
      "blog/archives/zydev-info/tags/php/index.html",
      "<article",
    );

    expect(builtSiteFailures({ distDir, posts, siteUrl })).toEqual([]);
  });

  test("reports lightboxed featured post images", () => {
    const distDir = tempDir();
    const posts = [
      post("2020/emacs-native-comp-on-macos-a-mostly-automated-build-script", {
        title: "Emacs",
        description: "Emacs description",
        date: "2020-08-26",
        slug: "emacs-native-comp-on-macos-a-mostly-automated-build-script",
        tags: ["emacs"],
      }),
    ];

    writeFile(
      distDir,
      "blog/2020/emacs-native-comp-on-macos-a-mostly-automated-build-script/index.html",
      '<article><figure><a data-fancybox="gallery"><img></a></figure></article>',
    );

    expect(builtSiteFailures({ distDir, posts })).toEqual(
      expect.arrayContaining([
        "blog/2020/emacs-native-comp-on-macos-a-mostly-automated-build-script/index.html: expected featured figure to omit Fancybox.",
      ]),
    );
  });

  test("reports missing body Fancybox links on image gallery posts", () => {
    const distDir = tempDir();
    const posts = [
      post("2015/my-website-remade", {
        title: "My Website, Remade",
        description: "Website description",
        date: "2015-10-26",
        slug: "my-website-remade",
        tags: ["blogging"],
      }),
    ];

    writeFile(
      distDir,
      "blog/2015/my-website-remade/index.html",
      "<article><figure><img></figure></article>",
    );

    expect(builtSiteFailures({ distDir, posts })).toEqual(
      expect.arrayContaining([
        "blog/2015/my-website-remade/index.html: expected article body to include Fancybox image links.",
      ]),
    );
  });
});
