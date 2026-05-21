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

function post(
  id: string,
  frontmatter: Record<string, string | true | string[]>,
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
  for (const path of [
    "index.html",
    "blog/index.html",
    "blog/tags/index.html",
    "rss.xml",
    "sitemap-index.xml",
    "sitemap-0.xml",
    "favicon.ico",
    "apple-touch-icon.png",
    "img/jimeh-4.2.0.jpg",
  ]) {
    writeFile(root, path);
  }
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
    writeFile(distDir, "rss.xml", mainUrl);
    writeFile(
      distDir,
      "sitemap-0.xml",
      `${mainUrl}\n${archiveUrl}\n${generalArchiveUrl}`,
    );
    writeFile(distDir, "blog/2025/main/index.html");
    writeFile(distDir, "blog/2024/archive/index.html");
    writeFile(distDir, "blog/2023/general-archive/index.html");
    writeFile(distDir, "blog/2025/index.html");
    writeFile(distDir, "blog/tags/astro/index.html");
    writeFile(distDir, "blog/archives/index.html");
    writeFile(distDir, "blog/archives/tags/index.html");
    writeFile(distDir, "blog/archives/tags/life/index.html");
    writeFile(distDir, "blog/archives/zydev-info/index.html");
    writeFile(distDir, "blog/archives/zydev-info/tags/index.html");
    writeFile(distDir, "blog/archives/zydev-info/tags/php/index.html");

    expect(builtSiteFailures({ distDir, posts, siteUrl })).toEqual([]);
  });
});
