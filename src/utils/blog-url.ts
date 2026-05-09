import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

const DATED_BLOG_ID_RE = /^(?<year>\d{4})-\d{2}-\d{2}-(?<slug>.+)$/;

interface BlogPostPathParts {
  year: string;
  slug: string;
}

function postPathParts(post: BlogPost): BlogPostPathParts {
  const match = post.id.match(DATED_BLOG_ID_RE);

  return {
    year: match?.groups?.year ?? post.data.date.slice(0, 4),
    slug: match?.groups?.slug ?? post.id,
  };
}

/** Returns the year segment for a blog post URL. */
export function blogPostYear(post: BlogPost): string {
  return postPathParts(post).year;
}

/** Returns the route parameter for a blog post page. */
export function blogPostRoute(post: BlogPost): string {
  const { year, slug } = postPathParts(post);

  return `${year}/${slug}`;
}

/** Returns the canonical site-relative URL for a blog post. */
export function blogPostUrl(post: BlogPost): string {
  return `/blog/${blogPostRoute(post)}/`;
}
