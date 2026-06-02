import type { CollectionEntry } from "astro:content";
import { blogRoutePath, blogRouteYear } from "./blog-route";

type BlogPost = CollectionEntry<"blog">;

const sourceRepositoryUrl = "https://github.com/jimeh/jimeh.me";
const sourceRepositoryRef = "main";

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

/** Returns the public Markdown URL for a blog post. */
export function blogPostMarkdownUrl(post: BlogPost): string {
  return `/blog/${blogPostRoute(post)}.md`;
}

/** Returns the GitHub source URL for a blog post content file. */
export function blogPostSourceUrl(post: BlogPost): string {
  const filePath = (post as BlogPost & { filePath?: string }).filePath;
  const sourcePath = filePath ?? `src/content/blog/${post.id}`;

  const url = [
    sourceRepositoryUrl,
    "blob",
    sourceRepositoryRef,
    sourcePath
      .replace(/^\/+/, "")
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/"),
  ].join("/");

  return `${url}?plain=1`;
}

/** Returns the blog index URL. */
export function blogIndexUrl(): string {
  return "/blog/";
}

/** Returns the URL for a blog year listing. */
export function blogYearUrl(year: string): string {
  return `/blog/${year}/`;
}

/** Returns the URL for the top-level blog tag index. */
export function blogTagsUrl(): string {
  return `${blogIndexUrl()}tags/`;
}

/** Returns the URL for a top-level blog tag page. */
export function blogTagUrl(tag: string): string {
  return `${blogTagsUrl()}${tag}/`;
}

/** Returns the URL for the blog archive index. */
export function blogArchivesUrl(): string {
  return `${blogIndexUrl()}archives/`;
}

/** Returns the URL for a named blog archive. */
export function blogArchiveUrl(archive: string): string {
  return `${blogArchivesUrl()}${archive}/`;
}

/** Returns the public Markdown URL for a named blog archive list. */
export function blogNamedArchiveMarkdownUrl(archive: string): string {
  return `${blogArchivesUrl()}${archive}.md`;
}

/** Returns the URL for the general archive tag index. */
export function blogArchiveTagsUrl(): string {
  return `${blogArchivesUrl()}tags/`;
}

/** Returns the URL for a general archive tag page. */
export function blogArchiveTagUrl(tag: string): string {
  return `${blogArchiveTagsUrl()}${tag}/`;
}

/** Returns the URL for a named archive tag index. */
export function blogNamedArchiveTagsUrl(archive: string): string {
  return `${blogArchiveUrl(archive)}tags/`;
}

/** Returns the URL for a named archive tag page. */
export function blogNamedArchiveTagUrl(archive: string, tag: string): string {
  return `${blogNamedArchiveTagsUrl(archive)}${tag}/`;
}
