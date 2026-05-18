import { parseHTML } from "linkedom";
import { describe, expect, test } from "vitest";

import {
  type ImportPost,
  type PostAsset,
  assetNameMap,
  convertLocalImages,
  createTurndown,
  dateOnly,
  datedSlug,
  decodeHtmlEntities,
  detectCodeLanguage,
  elementTextWithBreaks,
  frontmatter,
  imageComponent,
  imageImport,
  importNameFor,
  isCodeLikeBlockquote,
  isLocalImagePath,
  listMarker,
  mdxImportBlock,
  normalizeListSpacing,
  normalizeMarkdown,
  normalizeOrderedLists,
  plainDescription,
  postTags,
  rewriteUploadUrls,
  sanitizeHtml,
  slugTag,
  summarizeDescription,
  wrapHeading,
  wrapListItem,
  wrapMarkdownProse,
  wrapWords,
  wpAutop,
} from "./import-wordpress-posts.ts";

function importPost(overrides: Partial<ImportPost> = {}): ImportPost {
  return {
    source: "zydev",
    old_id: 1,
    post_date: "2010-02-26 12:34:56",
    post_modified: "2010-02-27 12:34:56",
    title: "Imported Post",
    slug: "imported-post",
    categories: "Ruby, Mac OS X, Ruby",
    tags: "",
    content_html: "<p>Body</p>",
    ...overrides,
  };
}

function asset(
  uploadPath: string,
  localPath = "tmp/uploads/file.jpg",
): PostAsset {
  return { old_id: 1, upload_path: uploadPath, local_path: localPath };
}

describe("WordPress import metadata helpers", () => {
  test("derives dates and dated slugs", () => {
    const post = importPost();

    expect(dateOnly(post.post_date)).toBe("2010-02-26");
    expect(datedSlug(post)).toBe("2010-02-26-imported-post");
  });

  test("normalizes tags from categories", () => {
    expect(slugTag("Mac OS X & iPhone")).toBe("mac-os-x-and-iphone");
    expect(postTags(importPost())).toEqual(["mac-os-x", "ruby"]);
  });

  test("builds deterministic asset names and avoids collisions", () => {
    const names = assetNameMap([
      asset("2009/09/image.jpg"),
      asset("2010/01/image.jpg"),
      asset("2010/01/other.png"),
    ]);

    expect([...names.entries()]).toEqual([
      ["2009/09/image.jpg", "image.jpg"],
      ["2010/01/image.jpg", "2010-01-image.jpg"],
      ["2010/01/other.png", "other.png"],
    ]);
  });

  test("rewrites WordPress upload URLs to local asset paths", () => {
    const names = new Map([["2009/09/image.jpg", "image.jpg"]]);
    const html = [
      '<img src="https://old.test/wp-content/uploads/2009/09/image.jpg">',
      '<a href="/wp-content/uploads/2009/09/image.jpg">download</a>',
    ].join("");

    expect(rewriteUploadUrls(html, names)).toBe(
      '<img src="./image.jpg"><a href="./image.jpg">download</a>',
    );
  });

  test("builds frontmatter with updatedDate and sorted tags", () => {
    expect(frontmatter(importPost(), "Description")).toBe(
      [
        "---",
        'title: "Imported Post"',
        'description: "Description"',
        "date: 2010-02-26",
        "updatedDate: 2010-02-27",
        'tags: ["mac-os-x", "ruby"]',
        "---",
      ].join("\n"),
    );
  });
});

describe("WordPress import HTML cleanup and Turndown", () => {
  test("removes unsafe HTML and event attributes", () => {
    const html = sanitizeHtml(
      [
        '<script>alert("x")</script>',
        '<iframe src="https://example.com"></iframe>',
        '<p style="color:red" onclick="x()">Safe</p>',
        '<a href="javascript:alert(1)" rel="nofollow">Bad link</a>',
      ].join(""),
    );

    expect(html).not.toContain("<script");
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("rel=");
    expect(html).toContain("<p>Safe</p>");
  });

  test("wraps plain WordPress text in paragraphs", () => {
    const html = wpAutop("First line\nsecond line\n\n<ul><li>Item</li></ul>");

    expect(html).toContain("<p>First line<br />\nsecond line</p>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("</li>");
    expect(html).toContain("</ul>");
    expect(html).not.toContain("<p></li></p>");
  });

  test("decodes entities and extracts text with line breaks", () => {
    const { document } = parseHTML(
      "<div>One<br>Two<p>Three &amp; four</p></div>",
    );
    const div = document.querySelector("div")!;

    expect(decodeHtmlEntities("&lt;tag&gt;&amp;&#x27;")).toBe("<tag>&'");
    expect(elementTextWithBreaks(div)).toBe("One\nTwo\nThree & four");
  });

  test("detects code languages and code-like blockquotes", () => {
    expect(detectCodeLanguage("AddType text/html .html")).toBe("apache");
    expect(detectCodeLanguage("<?php echo 'x';")).toBe("php");
    expect(detectCodeLanguage("sudo make install")).toBe("sh");
    expect(detectCodeLanguage("<p>html</p>")).toBe("html");
    expect(isCodeLikeBlockquote("DocumentRoot /var/www")).toBe(true);
  });

  test("converts pre blocks, code blockquotes, and image paragraphs", () => {
    const markdown = createTurndown().turndown(
      [
        "<pre>&lt;VirtualHost *:80&gt;</pre>",
        "<blockquote><p>DocumentRoot /var/www</p></blockquote>",
        '<p><img src="./image.jpg" title="Title"></p>',
      ].join(""),
    );

    expect(markdown).toContain("```apache\n<VirtualHost *:80>\n```");
    expect(markdown).toContain("```apache\nDocumentRoot /var/www\n```");
    expect(markdown).toContain("![Title](./image.jpg)");
  });
});

describe("WordPress import local image conversion", () => {
  test("detects local image paths", () => {
    expect(isLocalImagePath("./image.jpg")).toBe(true);
    expect(isLocalImagePath("./archive.zip")).toBe(false);
    expect(isLocalImagePath("https://example.com/image.jpg")).toBe(false);
  });

  test("generates unique import names", () => {
    const used = new Set<string>();

    expect(importNameFor("my-image.jpg", used)).toBe("myImage");
    expect(importNameFor("my-image.png", used)).toBe("myImage2");
    expect(importNameFor("123-image.png", used)).toBe("image123Image");
  });

  test("deduplicates image imports", () => {
    const imports = new Map<string, string>();
    const used = new Set<string>();

    expect(imageImport(imports, used, "./image.jpg")).toBe("image");
    expect(imageImport(imports, used, "./image.jpg")).toBe("image");
    expect([...imports.entries()]).toEqual([["image.jpg", "image"]]);
  });

  test("renders image components and import blocks", () => {
    const imports = new Map([["image.jpg", "image"]]);

    expect(imageComponent("image", 'Alt "text"')).toBe(
      '<Image src={image} alt="Alt \\"text\\"" />',
    );
    expect(mdxImportBlock(imports)).toBe(
      'import { Image } from "@mdx/index";\nimport image from "./image.jpg";\n\n',
    );
  });

  test("converts local markdown images to MDX image components", () => {
    const result = convertLocalImages(
      [
        "![Alt](./image.jpg)",
        '[![Thumb](./thumb.jpg)](./full.jpg "Full title")',
        "[![Zip](./zip-thumb.jpg)](./download.zip)",
      ].join("\n\n"),
    );

    expect(result.body).toContain('<Image src={image} alt="Alt" />');
    expect(result.body).toContain('<Image src={full} alt="Full title" />');
    expect(result.body).toContain("[![Zip](./zip-thumb.jpg)](./download.zip)");
    expect([...result.imports.entries()].sort()).toEqual([
      ["full.jpg", "full"],
      ["image.jpg", "image"],
    ]);
  });
});

describe("WordPress import markdown normalization", () => {
  test("normalizes ordered list numbering", () => {
    expect(normalizeOrderedLists("4. Four\n9. Nine\n\n1. One")).toBe(
      "1. Four\n2. Nine\n\n1. One",
    );
  });

  test("wraps words, headings, and list items", () => {
    expect(wrapWords("one two three", 7)).toEqual(["one two", "three"]);
    expect(listMarker("- item")).toBe("- ");
    expect(wrapListItem("- one two three", "- ")).toEqual(["- one two three"]);
    expect(wrapHeading("# Step 1: Do the thing")).toEqual([
      "# Step 1: Do the thing",
    ]);
  });

  test("recognizes standalone block lines", () => {
    expect(
      wrapMarkdownProse("A paragraph that should wrap together.\n\n<hr>"),
    ).toBe("A paragraph that should wrap together.\n\n<hr>");
  });

  test("normalizes list spacing and markdown artifacts", () => {
    expect(normalizeListSpacing("- one\n\n- two")).toBe("- one\n- two");
    expect(normalizeMarkdown("Hello\u00a0world\n\n\n#tag")).toBe(
      "Hello world\n\n\\#tag",
    );
  });

  test("summarizes and extracts plain descriptions", () => {
    expect(
      summarizeDescription("![Alt](./image.jpg) [Link](https://example.com)"),
    ).toBe("Link");
    expect(
      plainDescription("# Heading\n\nFirst paragraph here.", "Fallback"),
    ).toBe("First paragraph here.");
    expect(plainDescription("```sh\nignored\n```", "Fallback")).toBe(
      "Fallback",
    );
  });
});
