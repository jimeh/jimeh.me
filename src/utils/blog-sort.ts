import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

/**
 * Sort blog posts by date descending, then id descending.
 */
export function compareBlogPostsDesc(a: BlogPost, b: BlogPost): number {
  if (a.data.date > b.data.date) {
    return -1;
  }
  if (a.data.date < b.data.date) {
    return 1;
  }

  if (a.id > b.id) {
    return -1;
  }
  if (a.id < b.id) {
    return 1;
  }

  return 0;
}

/**
 * Sort blog posts by date ascending, then id ascending.
 */
export function compareBlogPostsAsc(a: BlogPost, b: BlogPost): number {
  return -compareBlogPostsDesc(a, b);
}
