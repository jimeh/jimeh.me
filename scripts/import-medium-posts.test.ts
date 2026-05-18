import { parseHTML } from "linkedom";
import { describe, expect, test } from "vitest";

import {
  buildFigureHtml,
  buildFrontmatter,
  contentTypeToExt,
  createTurndown,
  decodeHtmlEntities,
  dedentCode,
  deriveSlug,
  detectCodeLanguage,
  extractFallbackDescription,
  extractTags,
  formatDate,
  getGuidText,
  getUpdatedDate,
  imageBaseName,
  normalizeQuotes,
  parseItems,
  postProcessMarkdown,
  replaceImageUrls,
} from "./import-medium-posts.ts";

describe("Medium import image helpers", () => {
  test("maps content types to extensions and falls back to URL extension", () => {
    expect(contentTypeToExt("image/webp; charset=binary", "https://x/y")).toBe(
      ".webp",
    );
    expect(
      contentTypeToExt("application/octet-stream", "https://x/y.png"),
    ).toBe(".png");
    expect(contentTypeToExt("application/octet-stream", "https://x/y")).toBe(
      ".jpg",
    );
  });

  test("derives filesystem-safe Medium image base names", () => {
    expect(imageBaseName("https://miro.medium.com/v2/1*abcDEF.jpeg")).toBe(
      "1-abcDEF",
    );
  });

  test("replaces downloaded image URLs with local paths", () => {
    const urls = new Map([["https://example.com/image.jpg", "./image.webp"]]);

    expect(
      replaceImageUrls("![alt](https://example.com/image.jpg)", urls),
    ).toBe("![alt](./image.webp)");
  });

  test("extracts the largest picture source from Medium figure markup", () => {
    const { document } = parseHTML(
      [
        "<figure>",
        '<picture><source srcset="small.jpg 320w, large.jpg 1200w" /></picture>',
        "<figcaption><p>Caption <strong>text</strong></p></figcaption>",
        "</figure>",
      ].join(""),
    );

    expect(buildFigureHtml(document.querySelector("figure")!)).toBe(
      '<figure><img src="large.jpg" alt="" /><figcaption><p>Caption <strong>text</strong></p></figcaption></figure>',
    );
  });
});

describe("Medium import feed and metadata helpers", () => {
  test("parses single-item RSS feeds as an array", () => {
    const items = parseItems(`
      <rss>
        <channel>
          <item>
            <title>Post</title>
            <link>https://jimeh.io/post-abcd</link>
            <guid>https://medium.com/p/abcd</guid>
            <dc:creator>Jim</dc:creator>
            <pubDate>Fri, 26 Feb 2010 00:00:00 GMT</pubDate>
            <atom:updated>Fri, 26 Feb 2010 00:00:00 GMT</atom:updated>
            <content:encoded>Body</content:encoded>
          </item>
        </channel>
      </rss>
    `);

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("Post");
  });

  test("removes Medium hash suffixes from slugs", () => {
    expect(
      deriveSlug("https://jimeh.io/my-post-abcd", "https://medium.com/p/abcd"),
    ).toBe("my-post");
  });

  test("formats publication dates and omits unchanged updated dates", () => {
    expect(formatDate("Fri, 26 Feb 2010 00:00:00 GMT")).toBe("2010-02-26");
    expect(
      getUpdatedDate(
        "Fri, 26 Feb 2010 00:00:00 GMT",
        "Fri, 26 Feb 2010 00:00:00 GMT",
      ),
    ).toBeNull();
    expect(
      getUpdatedDate(
        "Fri, 26 Feb 2010 00:00:00 GMT",
        "Sat, 27 Feb 2010 00:00:00 GMT",
      ),
    ).toBe("2010-02-27");
  });

  test("normalizes category and guid shapes", () => {
    expect(extractTags(undefined)).toEqual([]);
    expect(extractTags("ruby")).toEqual(["ruby"]);
    expect(extractTags(["ruby", "macos"])).toEqual(["ruby", "macos"]);
    expect(getGuidText("guid")).toBe("guid");
    expect(getGuidText({ "#text": "guid" })).toBe("guid");
  });

  test("builds JSON-safe frontmatter", () => {
    expect(
      buildFrontmatter({
        title: 'A "quoted" post',
        description: "Description",
        date: "2010-02-26",
        updatedDate: "2010-02-27",
        tags: ["ruby", "macos"],
      }),
    ).toBe(
      [
        "---",
        'title: "A \\"quoted\\" post"',
        'description: "Description"',
        "date: 2010-02-26",
        "updatedDate: 2010-02-27",
        'tags: ["ruby", "macos"]',
        "---",
      ].join("\n"),
    );
  });
});

describe("Medium import markdown conversion helpers", () => {
  test("decodes common HTML entities", () => {
    expect(decodeHtmlEntities("&lt;tag&gt;&amp;&#39;&#x2F;")).toBe("<tag>&'/");
  });

  test("dedents code blocks by their shared indentation", () => {
    expect(dedentCode("    one\n      two\n")).toBe("one\n  two\n");
  });

  test("detects common code block languages", () => {
    expect(detectCodeLanguage('{"name": "jimeh"}')).toBe("json");
    expect(detectCodeLanguage("<div>html</div>")).toBe("xml");
    expect(detectCodeLanguage("pnpm install")).toBe("sh");
    expect(detectCodeLanguage("plain text")).toBe("");
  });

  test("converts Medium pre and figure HTML through Turndown", () => {
    const markdown = createTurndown().turndown(
      '<pre><span id="code">  pnpm test</span></pre><figure><img src="./x.jpg" alt="Alt" /></figure>',
    );

    expect(markdown).toContain("```sh\npnpm test\n```");
    expect(markdown).toContain("![Alt](./x.jpg)");
  });

  test("normalizes quotes and collapses excessive blank lines", () => {
    expect(normalizeQuotes("\u201cHello\u201d \u2018there\u2019")).toBe(
      "\"Hello\" 'there'",
    );
    expect(postProcessMarkdown("a\n\n\n\nb")).toBe("a\n\nb");
  });

  test("extracts fallback descriptions from prose", () => {
    expect(
      extractFallbackDescription(
        [
          "# Heading",
          "```",
          "ignored",
          "```",
          "First sentence. Second sentence.",
        ].join("\n"),
        "Fallback",
      ),
    ).toBe("First sentence.");
  });
});
