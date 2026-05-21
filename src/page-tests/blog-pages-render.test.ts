import { getCollection } from "astro:content";
import { describe, expect, test } from "vitest";

import { renderComponent } from "../components/test-utils";
import PostPage from "../pages/blog/[...slug].astro";
import ArchivePage from "../pages/blog/archives/[archive].astro";
import NamedArchiveTagPage from "../pages/blog/archives/[archive]/tags/[tag].astro";
import NamedArchiveTagsIndexPage from "../pages/blog/archives/[archive]/tags/index.astro";
import ArchivesIndexPage from "../pages/blog/archives/index.astro";
import ArchiveTagPage from "../pages/blog/archives/tags/[tag].astro";
import ArchiveTagsIndexPage from "../pages/blog/archives/tags/index.astro";
import BlogIndexPage from "../pages/blog/index.astro";
import TagPage from "../pages/blog/tags/[tag].astro";
import TagsIndexPage from "../pages/blog/tags/index.astro";
import YearPage from "../pages/blog/[year]/index.astro";

describe("blog pages", () => {
  test("renders the blog index with latest post and archives link", async () => {
    const document = await renderComponent(BlogIndexPage);

    expect(document.querySelector("h1")?.textContent?.trim()).toBe("Blog");
    expect(document.querySelector('[aria-label="Latest post"]')).not.toBeNull();
    expect(
      document
        .querySelector('nav[aria-label="Archives"] a')
        ?.getAttribute("href"),
    ).toBe("/blog/archives/");
  });

  test("renders a year listing page", async () => {
    const document = await renderComponent(YearPage, { year: "2025" });

    expect(document.querySelector("h1")?.textContent?.trim()).toBe("2025");
    expect(
      [...document.querySelectorAll('a[href="/blog/"]')].some((link) => {
        return link.textContent?.includes("all posts");
      }),
    ).toBe(true);
    expect(document.querySelectorAll("article")).not.toHaveLength(0);
  });

  test("renders tags index and a tag listing page", async () => {
    const tagsDocument = await renderComponent(TagsIndexPage);
    const tagDocument = await renderComponent(TagPage, { tag: "macos" });

    expect(tagsDocument.querySelector("h1")?.textContent?.trim()).toBe("Tags");
    expect(
      tagsDocument.querySelector('a[href="/blog/tags/macos/"]'),
    ).not.toBeNull();
    expect(tagDocument.querySelector("h1")?.textContent?.trim()).toBe("macos");
    expect(tagDocument.querySelectorAll("article")).not.toHaveLength(0);
  });

  test("renders archive index and a named archive page", async () => {
    const indexDocument = await renderComponent(ArchivesIndexPage);
    const archiveDocument = await renderComponent(ArchivePage, {
      label: "zydev.info",
      slug: "zydev-info",
    });

    expect(indexDocument.querySelector("h1")?.textContent?.trim()).toBe(
      "Archives",
    );
    expect(
      indexDocument.querySelector('a[href="/blog/archives/zydev-info/"]'),
    ).not.toBeNull();
    expect(archiveDocument.querySelector("h1")?.textContent).toContain(
      "Archive: zydev.info",
    );
    expect(archiveDocument.querySelectorAll("article")).not.toHaveLength(0);
  });

  test("renders general archive and named archive tag pages", async () => {
    const archiveTagsDocument = await renderComponent(ArchiveTagsIndexPage);
    const archiveTagDocument = await renderComponent(ArchiveTagPage, {
      tag: "php",
    });
    const namedTagsDocument = await renderComponent(NamedArchiveTagsIndexPage, {
      label: "zydev.info",
      slug: "zydev-info",
    });
    const namedTagDocument = await renderComponent(NamedArchiveTagPage, {
      label: "zydev.info",
      slug: "zydev-info",
      tag: "macos",
    });

    expect(archiveTagsDocument.querySelector("h1")?.textContent).toContain(
      "Archive Tags",
    );
    expect(
      archiveTagsDocument.querySelector('a[href="/blog/archives/tags/php/"]'),
    ).not.toBeNull();
    expect(archiveTagDocument.querySelectorAll("article")).not.toHaveLength(0);
    expect(namedTagsDocument.querySelector("h1")?.textContent).toContain(
      "zydev.info",
    );
    expect(
      namedTagsDocument.querySelector(
        'a[href="/blog/archives/zydev-info/tags/macos/"]',
      ),
    ).not.toBeNull();
    expect(namedTagDocument.querySelectorAll("article")).not.toHaveLength(0);
  });

  test("renders a blog post detail page", async () => {
    const posts = await getCollection("blog");
    const post = posts.find((post) =>
      post.id.includes("cleaning-up-after-svn"),
    );
    expect(post).toBeDefined();

    const document = await renderComponent(PostPage, { post });

    expect(document.querySelector("article h1")?.textContent).toContain("SVN");
    expect(document.querySelector("time")?.getAttribute("datetime")).toBe(
      post!.data.date,
    );
    expect(
      document.querySelector('nav[aria-label="Post navigation"]'),
    ).not.toBeNull();
  });
});
