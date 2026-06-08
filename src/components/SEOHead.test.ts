import { describe, expect, test } from "vitest";

import { renderComponent } from "./test-utils";
import SEOHead from "./SEOHead.astro";

function jsonLd(document: Document): Record<string, unknown> {
  const script = document.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();

  return JSON.parse(script!.textContent ?? "{}") as Record<string, unknown>;
}

describe("SEOHead", () => {
  test("renders default website metadata", async () => {
    const document = await renderComponent(
      SEOHead,
      {},
      {},
      { request: new Request("https://jimeh.me/") },
    );

    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toBe("Software Engineering Mercenary");
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://jimeh.me/");
    expect(
      document
        .querySelector('meta[property="og:type"]')
        ?.getAttribute("content"),
    ).toBe("website");
    expect(
      document
        .querySelector('meta[name="twitter:card"]')
        ?.getAttribute("content"),
    ).toBe("summary");
    expect(jsonLd(document)).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Jim Myhrberg (jimeh)",
      url: "https://jimeh.me",
    });
  });

  test("renders article metadata with image and tags", async () => {
    const document = await renderComponent(
      SEOHead,
      {
        title: "Post title",
        description: "Post description",
        ogType: "article",
        publishedTime: "2025-06-09",
        modifiedTime: "2025-06-10",
        tags: ["astro", "testing"],
        ogImage: "https://jimeh.me/image.jpg",
        alternateLinks: [
          {
            href: "https://jimeh.me/blog/post.md",
            type: "text/markdown",
            title: "Markdown",
          },
        ],
      },
      {},
      { request: new Request("https://jimeh.me/blog/post/") },
    );

    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://jimeh.me/blog/post/");
    expect(
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content"),
    ).toBe("https://jimeh.me/image.jpg");
    expect(
      document
        .querySelector('meta[name="twitter:card"]')
        ?.getAttribute("content"),
    ).toBe("summary_large_image");
    const markdownAlternate = document.querySelector(
      'link[rel="alternate"][type="text/markdown"]',
    );
    expect(markdownAlternate?.getAttribute("href")).toBe(
      "https://jimeh.me/blog/post.md",
    );
    expect(markdownAlternate?.getAttribute("title")).toBe("Markdown");
    expect(
      [...document.querySelectorAll('meta[property="article:tag"]')].map(
        (tag) => tag.getAttribute("content"),
      ),
    ).toEqual(["astro", "testing"]);
    expect(jsonLd(document)).toMatchObject({
      "@type": "BlogPosting",
      headline: "Post title",
      datePublished: "2025-06-09",
      dateModified: "2025-06-10",
      keywords: "astro, testing",
      image: "https://jimeh.me/image.jpg",
    });
  });

  test("uses published time as article modified time fallback in JSON-LD", async () => {
    const document = await renderComponent(SEOHead, {
      title: "Post title",
      description: "Post description",
      ogType: "article",
      publishedTime: "2025-06-09",
    });

    expect(jsonLd(document).dateModified).toBe("2025-06-09");
    expect(
      document.querySelector('meta[property="article:modified_time"]'),
    ).toBeNull();
  });
});
