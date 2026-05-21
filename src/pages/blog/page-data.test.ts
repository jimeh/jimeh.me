import { describe, expect, test } from "vitest";

import { blogPost } from "../../components/blog/test-helpers";
import {
  archivePageData,
  archiveStaticPaths,
  archivesIndexData,
  blogIndexData,
  blogPostStaticPaths,
  blogTagPosts,
  blogTagStaticPaths,
  blogYearPosts,
  blogYearStaticPaths,
  postPageNavigation,
  sortedTagCounts,
  yearRange,
} from "./page-data";
import type { BlogPost } from "./page-data";

function post(id: string, data: Partial<BlogPost["data"]> = {}): BlogPost {
  return blogPost({
    id,
    data: {
      title: id,
      date: "2025-01-01",
      slug: id.split("/").at(-2) ?? id,
      ...data,
    },
  });
}

describe("blog page data", () => {
  const posts = [
    post("2025/newest/index", {
      date: "2025-06-09",
      slug: "newest",
      tags: ["astro", "testing"],
    }),
    post("2024/older/index", {
      date: "2024-05-01",
      slug: "older",
      tags: ["astro"],
    }),
    post("2023/archive/index", {
      archive: true,
      date: "2023-01-01",
      slug: "archive",
      tags: ["archive"],
    }),
    post("2022/named/index", {
      archive: "Zydev.info",
      date: "2022-01-01",
      slug: "named",
      tags: ["testing"],
    }),
  ];

  test("builds blog index data with featured, grouped, and archive details", () => {
    const data = blogIndexData(posts, "jimeh.me", 1);

    expect(data.posts.map((post) => post.id)).toEqual([
      "2025/newest/index",
      "2024/older/index",
    ]);
    expect(data.featuredPost?.id).toBe("2025/newest/index");
    expect(data.remainingPosts.map((post) => post.id)).toEqual([
      "2024/older/index",
    ]);
    expect(data.years).toEqual(["2024"]);
    expect(data.postsByYear.get("2024")?.[0]?.id).toBe("2024/older/index");
    expect(data.eagerThumbnailIds.has("2024/older/index")).toBe(true);
    expect(data.archiveSummary).toBe("2 older posts from jimeh.me, Zydev.info");
  });

  test("builds year and tag static paths and filtered post lists", () => {
    expect(blogYearStaticPaths(posts)).toEqual([
      { params: { year: "2025" }, props: { year: "2025" } },
      { params: { year: "2024" }, props: { year: "2024" } },
    ]);
    expect(blogYearPosts(posts, "2024").map((post) => post.id)).toEqual([
      "2024/older/index",
    ]);

    expect(sortedTagCounts(posts)).toEqual([
      ["archive", 1],
      ["astro", 2],
      ["testing", 2],
    ]);
    expect(blogTagStaticPaths(posts)).toEqual([
      { params: { tag: "astro" }, props: { tag: "astro" } },
      { params: { tag: "testing" }, props: { tag: "testing" } },
      { params: { tag: "archive" }, props: { tag: "archive" } },
    ]);
    expect(blogTagPosts(posts, "astro").map((post) => post.id)).toEqual([
      "2025/newest/index",
      "2024/older/index",
    ]);
    expect(blogTagPosts(posts, "testing").map((post) => post.id)).toEqual([
      "2025/newest/index",
      "2022/named/index",
    ]);
  });

  test("builds archive index and named archive page data", () => {
    const index = archivesIndexData(posts);

    expect(index.archivedPosts.map((post) => post.id)).toEqual([
      "2023/archive/index",
      "2022/named/index",
    ]);
    expect(index.generalYears).toEqual(["2023"]);
    expect(index.namedArchives).toMatchObject([
      {
        label: "Zydev.info",
        slug: "zydev-info",
        url: "/blog/archives/zydev-info/",
      },
    ]);
    expect(archiveStaticPaths(posts)).toEqual([
      {
        params: { archive: "zydev-info" },
        props: { label: "Zydev.info", slug: "zydev-info" },
      },
    ]);

    const archive = archivePageData(posts, "zydev-info");

    expect(archive.posts.map((post) => post.id)).toEqual(["2022/named/index"]);
    expect(archive.years).toEqual(["2022"]);
    expect(archive.yearRange).toBe("2022");
  });

  test("builds post static paths and archive-aware post navigation", () => {
    expect(blogPostStaticPaths(posts).map((path) => path.params.slug)).toEqual([
      "2025/newest",
      "2024/older",
      "2023/archive",
      "2022/named",
    ]);

    const { prevPost, nextPost } = postPageNavigation(posts, posts[1]!);

    expect(prevPost).toBeNull();
    expect(nextPost?.id).toBe("2025/newest/index");
  });

  test("formats single-year and multi-year ranges", () => {
    expect(yearRange([posts[0]!, posts[1]!])).toBe("2024-2025");
    expect(yearRange([posts[0]!])).toBe("2025");
    expect(yearRange([])).toBe("");
  });
});
