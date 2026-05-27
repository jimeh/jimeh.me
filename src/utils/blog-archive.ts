import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

export interface BlogArchiveInfo {
  label: string;
  slug: string;
  url: string;
  isGeneral: boolean;
}

export const RESERVED_BLOG_ARCHIVE_SLUGS = new Set(["tags"]);

/** Returns true when a post belongs to any archive. */
export function isArchivedPost(post: BlogPost): boolean {
  return post.data.archive === true || typeof post.data.archive === "string";
}

/** Returns true when a post should appear in the primary blog surfaces. */
export function isMainBlogPost(post: BlogPost): boolean {
  return !isArchivedPost(post);
}

/** Returns true when a post belongs to the shared archive bucket. */
export function isGeneralArchivePost(post: BlogPost): boolean {
  return post.data.archive === true;
}

/** Converts an archive display name into its route slug. */
export function blogArchiveSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Returns true when an archive name would collide with reserved routes. */
export function isReservedBlogArchiveSlug(name: string): boolean {
  return RESERVED_BLOG_ARCHIVE_SLUGS.has(blogArchiveSlug(name));
}

/** Returns the canonical site-relative URL for a named archive. */
export function blogArchiveUrl(name: string): string {
  return `/blog/archives/${blogArchiveSlug(name)}/`;
}

/** Returns display and route details for a post archive, when present. */
export function blogArchiveInfo(post: BlogPost): BlogArchiveInfo | undefined {
  if (post.data.archive === true) {
    return {
      label: "Archives",
      slug: "",
      url: "/blog/archives/",
      isGeneral: true,
    };
  }

  if (typeof post.data.archive === "string") {
    return {
      label: post.data.archive,
      slug: blogArchiveSlug(post.data.archive),
      url: blogArchiveUrl(post.data.archive),
      isGeneral: false,
    };
  }

  return undefined;
}

/** Returns true when two posts are in the same archive/main-blog context. */
export function sameBlogArchiveContext(a: BlogPost, b: BlogPost): boolean {
  const archiveA = blogArchiveInfo(a);
  const archiveB = blogArchiveInfo(b);

  if (!archiveA && !archiveB) {
    return true;
  }

  if (!archiveA || !archiveB) {
    return false;
  }

  if (archiveA.isGeneral || archiveB.isGeneral) {
    return archiveA.isGeneral === archiveB.isGeneral;
  }

  return archiveA.slug === archiveB.slug;
}
