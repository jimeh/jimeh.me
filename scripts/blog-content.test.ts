import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import {
  type BlogPostFile,
  blogPostRoute,
  frontmatter,
  frontmatterBlockScalar,
  frontmatterNestedBlockScalar,
  frontmatterPathScalar,
  frontmatterScalar,
  frontmatterStringArray,
  localPostAssetExists,
  localStaticImports,
} from "./blog-content.ts";

let tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { force: true, recursive: true });
  }
  tempDirs = [];
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "jimeh-blog-content-"));
  tempDirs.push(dir);
  return dir;
}

function post(overrides: Partial<BlogPostFile> = {}): BlogPostFile {
  const dirPath = overrides.dirPath ?? tempDir();

  return {
    dirPath,
    fileName: "index.mdx",
    filePath: join(dirPath, "index.mdx"),
    id: "2025/example-post/index",
    source: "",
    ...overrides,
  };
}

describe("frontmatter parsing", () => {
  const source = [
    "---",
    'title: "Quoted title"',
    "date: 2025-06-09",
    'tags: ["astro", "testing"]',
    "image:",
    "  src:",
    "    light: ./light.jpg",
    "    dark: './dark.jpg'",
    "  alt: Example",
    "  thumbnail:",
    "    src: ./thumb.jpg",
    "---",
    "",
    "Body",
  ].join("\n");

  test("extracts frontmatter blocks", () => {
    expect(frontmatter(source)).toContain('title: "Quoted title"');
    expect(frontmatter("Body only")).toBeNull();
  });

  test("reads quoted and unquoted scalar values", () => {
    const body = frontmatter(source)!;

    expect(frontmatterScalar(body, "title")).toBe("Quoted title");
    expect(frontmatterScalar(body, "date")).toBe("2025-06-09");
    expect(frontmatterScalar(body, "missing")).toBeNull();
  });

  test("reads values from top-level and nested object blocks", () => {
    const body = frontmatter(source)!;

    expect(frontmatterBlockScalar(body, "image", "alt")).toBe("Example");
    expect(frontmatterNestedBlockScalar(body, "image", "src", "dark")).toBe(
      "./dark.jpg",
    );
    expect(frontmatterPathScalar(body, ["image", "thumbnail", "src"])).toBe(
      "./thumb.jpg",
    );
  });

  test("reads inline string arrays", () => {
    const body = frontmatter(source)!;

    expect(frontmatterStringArray(body, "tags")).toEqual(["astro", "testing"]);
    expect(frontmatterStringArray(body, "missing")).toEqual([]);
  });
});

describe("blog post route derivation", () => {
  test("returns canonical route details for valid dates", () => {
    expect(blogPostRoute(post(), "2025-06-09", "custom-slug")).toEqual({
      date: "2025-06-09",
      path: "2025/custom-slug",
      slug: "custom-slug",
      sourceSlug: "example-post",
      year: "2025",
    });
  });

  test("returns null for invalid frontmatter dates", () => {
    expect(blogPostRoute(post(), "2025/06/09", "custom-slug")).toBeNull();
  });
});

describe("asset and import helpers", () => {
  test("treats remote and absolute-ish sources as existing", () => {
    const file = post();

    expect(localPostAssetExists(file, "https://example.com/image.jpg")).toBe(
      true,
    );
    expect(localPostAssetExists(file, "/img/avatar.jpg")).toBe(true);
  });

  test("checks local relative assets against the post directory", () => {
    const dirPath = tempDir();
    const file = post({ dirPath });
    writeFileSync(join(dirPath, "image.jpg"), "");

    expect(localPostAssetExists(file, "./image.jpg")).toBe(true);
    expect(localPostAssetExists(file, "./missing.jpg")).toBe(false);
  });

  test("extracts local static imports and strips query strings", () => {
    const file = post({
      source: [
        'import one from "./one.jpg";',
        'import two from "./two.svg?raw";',
        'import external from "pkg";',
        'import "../side-effect.css";',
      ].join("\n"),
    });

    expect(localStaticImports(file)).toEqual(["./one.jpg", "./two.svg"]);
  });
});
