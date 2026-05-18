import { getCollection } from "astro:content";
import { describe, expect, test } from "vitest";

import { renderComponent } from "../../components/test-utils";
import PostPage from "./[...slug].astro";
import ArchivePage from "./archives/[archive].astro";
import ArchivesIndexPage from "./archives/index.astro";
import BlogIndexPage from "./index.astro";
import TagPage from "./tags/[tag].astro";
import TagsIndexPage from "./tags/index.astro";
import YearPage from "./[year]/index.astro";

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
