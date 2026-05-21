import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import type { BlogPostFile } from "./blog-content.ts";
import { collectContentFailures } from "./check-content.ts";

let tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { force: true, recursive: true });
  }
  tempDirs = [];
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "jimeh-check-content-"));
  tempDirs.push(dir);
  return dir;
}

function source(frontmatter: string): string {
  const lines = frontmatter
    .replace(/^\n/, "")
    .replace(/\n\s*$/, "")
    .split("\n");
  const indent = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^\s*/)![0].length),
  );
  const body = lines.map((line) => line.slice(indent)).join("\n");

  return ["---", body, "---", "", "Body"].join("\n");
}

function post(
  frontmatter: string,
  overrides: Partial<BlogPostFile> = {},
): BlogPostFile {
  const dirPath = overrides.dirPath ?? tempDir();
  const filePath = join(dirPath, overrides.fileName ?? "index.md");

  return {
    dirPath,
    fileName: "index.md",
    filePath,
    id: "2025/example/index",
    source: source(frontmatter),
    ...overrides,
  };
}

describe("collectContentFailures", () => {
  test("accepts valid frontmatter, local assets, and static imports", () => {
    const dirPath = tempDir();
    writeFileSync(join(dirPath, "image.jpg"), "");
    writeFileSync(join(dirPath, "imported.jpg"), "");

    const failures = collectContentFailures([
      post(
        `
        title: Valid Post
        description: Valid description
        date: 2025-06-09
        slug: valid-post
        tags: ["astro", "testing"]
        image:
          src: ./image.jpg
        `,
        {
          dirPath,
          source:
            source(`
              title: Valid Post
              description: Valid description
              date: 2025-06-09
              slug: valid-post
              tags: ["astro", "testing"]
              image:
                src: ./image.jpg
            `) + '\nimport asset from "./imported.jpg";',
        },
      ),
    ]);

    expect(failures).toEqual([]);
  });

  test("reports missing and malformed frontmatter invariants", () => {
    const failures = collectContentFailures([
      post(`
        description: Invalid description
        date: 2025/06/09
        slug: Invalid Slug
        updatedDate: 2025-01-01
        tags:
      `),
    ]);

    expect(failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining("frontmatter must include title"),
        expect.stringContaining("frontmatter date must use YYYY-MM-DD"),
        expect.stringContaining("slug must be lowercase URL segments"),
        expect.stringContaining("tags must be an inline string array"),
      ]),
    );
  });

  test("reports duplicate canonical routes and missing local assets", () => {
    const first = post(
      `
      title: First
      description: First description
      date: 2025-06-09
      slug: duplicate
      `,
      { id: "2025/first/index" },
    );
    const second = post(
      `
      title: Second
      description: Second description
      date: 2025-06-09
      slug: duplicate
      image:
        src: ./missing.jpg
      `,
      {
        id: "2025/second/index",
        source:
          source(`
            title: Second
            description: Second description
            date: 2025-06-09
            slug: duplicate
            image:
              src: ./missing.jpg
          `) + '\nimport asset from "./missing-import.jpg";',
      },
    );

    const failures = collectContentFailures([first, second]);

    expect(failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining("duplicates"),
        expect.stringContaining("image.src points at missing local asset"),
        expect.stringContaining("static import points at missing local asset"),
      ]),
    );
  });

  test("reports archive names that resolve to reserved route slugs", () => {
    const failures = collectContentFailures([
      post(`
        title: Reserved Archive
        description: Reserved archive description
        date: 2025-06-09
        slug: reserved-archive
        archive: Tags!
      `),
    ]);

    expect(failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('archive "Tags!" uses a reserved route slug'),
      ]),
    );
  });
});
