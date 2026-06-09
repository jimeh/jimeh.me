import { describe, expect, test } from "vitest";
import type { CollectionEntry } from "astro:content";
import { posix } from "node:path";
import { resolveBlogMarkdownAsset } from "./markdown-assets";

type BlogPost = CollectionEntry<"blog">;

const post = {
  id: "2025/how-to-add-apples-new-liquid-glass-icons-to-applications",
  filePath:
    "src/content/blog/2025/how-to-add-apples-new-liquid-glass-icons-to-applications/how-to-add-apples-new-liquid-glass-icons-to-applications.md",
} as BlogPost & { filePath: string };

describe("resolveBlogMarkdownAsset", () => {
  test("resolves Astro dev-time filesystem asset paths", () => {
    const assetPath =
      "src/content/blog/2025/how-to-add-apples-new-liquid-glass-icons-to-applications/Apple-WWDC25-Liquid-Glass-Icon-Composer.jpg";
    const relative = resolveBlogMarkdownAsset(
      post,
      "./Apple-WWDC25-Liquid-Glass-Icon-Composer.jpg",
    );
    const fsPath = resolveBlogMarkdownAsset(
      post,
      `/@fs/${posix.join(process.cwd(), assetPath)}?origWidth=1960`,
    );

    expect(fsPath).toBe(relative);
    expect(fsPath).toMatch(/^https:\/\/jimeh\.me\//);
    expect(fsPath).not.toContain("/@fs/");
  });
});
