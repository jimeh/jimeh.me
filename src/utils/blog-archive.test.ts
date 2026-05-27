import { describe, expect, test } from "vitest";

import {
  blogArchiveInfo,
  blogArchiveSlug,
  blogArchiveUrl,
  isReservedBlogArchiveSlug,
  isArchivedPost,
  isGeneralArchivePost,
  isMainBlogPost,
  sameBlogArchiveContext,
} from "./blog-archive";

type BlogPost = Parameters<typeof isArchivedPost>[0];

function post(archive?: boolean | string): BlogPost {
  return { data: { archive } } as BlogPost;
}

describe("archive classification", () => {
  test("identifies main, general archive, and named archive posts", () => {
    const main = post();
    const general = post(true);
    const named = post("zydev.info");

    expect(isMainBlogPost(main)).toBe(true);
    expect(isArchivedPost(main)).toBe(false);
    expect(isArchivedPost(general)).toBe(true);
    expect(isGeneralArchivePost(general)).toBe(true);
    expect(isArchivedPost(named)).toBe(true);
    expect(isGeneralArchivePost(named)).toBe(false);
  });
});

describe("archive route details", () => {
  test("slugifies archive names for routes", () => {
    expect(blogArchiveSlug("Zydev.info")).toBe("zydev-info");
    expect(blogArchiveSlug(" Old WordPress Dump! ")).toBe("old-wordpress-dump");
  });

  test("identifies reserved archive route slugs", () => {
    expect(isReservedBlogArchiveSlug("Tags!")).toBe(true);
    expect(isReservedBlogArchiveSlug("Zydev.info")).toBe(false);
  });

  test("builds canonical archive URLs", () => {
    expect(blogArchiveUrl("Zydev.info")).toBe("/blog/archives/zydev-info/");
  });

  test("returns general archive info", () => {
    expect(blogArchiveInfo(post(true))).toEqual({
      label: "Archives",
      slug: "",
      url: "/blog/archives/",
      isGeneral: true,
    });
  });

  test("returns named archive info", () => {
    expect(blogArchiveInfo(post("Zydev.info"))).toEqual({
      label: "Zydev.info",
      slug: "zydev-info",
      url: "/blog/archives/zydev-info/",
      isGeneral: false,
    });
  });

  test("returns undefined for main blog posts", () => {
    expect(blogArchiveInfo(post())).toBeUndefined();
  });
});

describe("archive context matching", () => {
  test("matches two main blog posts", () => {
    expect(sameBlogArchiveContext(post(), post())).toBe(true);
  });

  test("does not match main and archived posts", () => {
    expect(sameBlogArchiveContext(post(), post(true))).toBe(false);
  });

  test("matches general archives only with other general archives", () => {
    expect(sameBlogArchiveContext(post(true), post(true))).toBe(true);
    expect(sameBlogArchiveContext(post(true), post("Archives"))).toBe(false);
  });

  test("matches named archives by slug", () => {
    expect(sameBlogArchiveContext(post("Zydev.info"), post("zydev info"))).toBe(
      true,
    );
    expect(sameBlogArchiveContext(post("Zydev.info"), post("Zhuoqe"))).toBe(
      false,
    );
  });
});
