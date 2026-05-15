import type { CollectionEntry } from "astro:content";
import { blogRoutePath, blogRouteYear } from "./blog-route";

type BlogPost = CollectionEntry<"blog">;

/** Returns the year segment for a blog post URL. */
export function blogPostYear(post: BlogPost): string {
  return blogRouteYear(post.data.date);
}

/** Returns the route parameter for a blog post page. */
export function blogPostRoute(post: BlogPost): string {
  return blogRoutePath({
    date: post.data.date,
    slug: post.data.slug,
  });
}

/** Returns the canonical site-relative URL for a blog post. */
export function blogPostUrl(post: BlogPost): string {
  return `/blog/${blogPostRoute(post)}/`;
}
