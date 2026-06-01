import { describe, expect, test } from "vitest";
import { markdownMdxFailures, renderMarkdownMdx } from "./markdown-mdx";

describe("renderMarkdownMdx", () => {
  test("renders supported MDX components to Markdown", () => {
    const markdown = renderMarkdownMdx(
      [
        'import { Image, YouTube } from "@mdx/index";',
        'import inventory from "./dim.webp";',
        "",
        "Before.",
        "",
        '<Image src={inventory} alt="Inventory" />',
        "",
        "<YouTube",
        '  src="https://youtu.be/ea6UuRTjkKs"',
        '  title="Hard Can Be Fun"',
        "/>",
      ].join("\n"),
      { resolveAsset: (src) => `/assets/${src.split("/").pop()}` },
    );

    expect(markdown).toContain("Before.");
    expect(markdown).toContain("![Inventory](/assets/dim.webp)");
    expect(markdown).toContain(
      "[Video: Hard Can Be Fun](https://www.youtube.com/watch?v=ea6UuRTjkKs)",
    );
    expect(markdown).not.toContain("import inventory");
    expect(markdown).not.toContain("<Image");
  });

  test("renders dead links with visible dead-link text", () => {
    expect(
      renderMarkdownMdx("[Cow](dead+http://cow.example/reflection/)"),
    ).toBe("[Cow](http://cow.example/reflection/) (dead link)\n");
  });

  test("reports missing component renderers", () => {
    expect(markdownMdxFailures("<Gallery />")).toEqual([
      "Missing Markdown renderer for MDX component: Gallery",
    ]);
  });

  test("reports unsupported prop expressions", () => {
    expect(markdownMdxFailures("<Image src={images[0]} />")).toEqual([
      "Unsupported MDX prop expression in Markdown export: {images[0]}",
    ]);
  });
});
