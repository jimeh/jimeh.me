import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import {
  blogFrontmatterJsonSchema,
  generateBlogFrontmatterSchema,
} from "./generate-blog-frontmatter-schema.ts";

let tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { force: true, recursive: true });
  }
  tempDirs = [];
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "jimeh-blog-schema-"));
  tempDirs.push(dir);
  return dir;
}

describe("blog frontmatter schema generation", () => {
  test("builds schema metadata and required post fields", () => {
    const schema = blogFrontmatterJsonSchema();

    expect(schema).toMatchObject({
      $id: "https://jimeh.me/schemas/blog-frontmatter.schema.json",
      title: "jimeh.me Blog Frontmatter",
      type: "object",
    });
    expect(schema.required).toEqual(
      expect.arrayContaining(["title", "description", "date", "slug"]),
    );
  });

  test("writes formatted JSON schema to the requested path", async () => {
    const outputPath = join(tempDir(), "nested", "schema.json");

    await generateBlogFrontmatterSchema(outputPath);

    expect(existsSync(outputPath)).toBe(true);
    expect(JSON.parse(readFileSync(outputPath, "utf8"))).toMatchObject({
      $id: "https://jimeh.me/schemas/blog-frontmatter.schema.json",
    });
    expect(readFileSync(outputPath, "utf8")).toContain('\n  "title": ');
  });
});
