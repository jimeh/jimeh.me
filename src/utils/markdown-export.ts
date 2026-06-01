import type { CollectionEntry } from "astro:content";
import { siteConfig, siteLinks } from "../data/site";
import { blogArchiveInfo, isMainBlogPost } from "./blog-archive";
import { compareBlogPostsDesc } from "./blog-sort";
import {
  blogNamedArchiveMarkdownUrl,
  blogPostMarkdownUrl,
  blogPostUrl,
} from "./blog-url";
import { lightImage } from "./image-source";
import { renderMarkdownMdx } from "./markdown-mdx";

export type BlogPost = CollectionEntry<"blog">;

export interface BlogPostMarkdownOptions {
  resolveAsset?: (post: BlogPost, src: string) => string;
}

export interface NamedArchiveMarkdownLink {
  label: string;
  slug: string;
}

/** Returns a Markdown response suitable for static text endpoints. */
export function markdownResponse(markdown: string): Response {
  return new Response(markdown, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}

/** Returns an absolute site URL for a site-relative path. */
export function absoluteSiteUrl(path: string): string {
  return new URL(path, siteConfig.url).href;
}

/** Returns public profile details suitable for llms.txt. */
export function publicProfileMarkdown(): string {
  return normalizeMarkdown(`
## Profile

Jim Myhrberg, also known as jimeh, is a software engineer. This is his personal
website with profile links and blog posts.

## Links

${siteLinks
  .filter((link) => !/^mailto:/i.test(link.url))
  .map((link) => `- [${link.name}](${absoluteSiteUrl(link.url)})`)
  .join("\n")}
`);
}

/** Returns the llms.txt directory for public Markdown entry points. */
export function llmsDirectoryMarkdown(
  mainPosts: BlogPost[],
  namedArchives: NamedArchiveMarkdownLink[],
): string {
  const archiveLinks = namedArchives
    .map((archive) => {
      const href = absoluteSiteUrl(blogNamedArchiveMarkdownUrl(archive.slug));

      return `- [${archive.label} archive](${href})`;
    })
    .join("\n");
  const blogLinks = mainPosts
    .slice()
    .sort(compareBlogPostsDesc)
    .map((post) => {
      const href = absoluteSiteUrl(blogPostMarkdownUrl(post));
      const description = post.data.description
        ? `: ${post.data.description}`
        : "";

      return `- [${post.data.title}](${href})${description}`;
    })
    .join("\n");

  return normalizeMarkdown(`
# ${siteConfig.title}

> ${siteConfig.description}

Personal site and blog for Jim Myhrberg, also known as jimeh.

${publicProfileMarkdown()}

## Core

- [Blog](${absoluteSiteUrl("/blog/index.md")}): Current blog posts.

## Blog Posts

${blogLinks}

## Optional

- [Blog archives](${absoluteSiteUrl("/blog/archives/index.md")}): Historical
  and imported posts.
${archiveLinks}
`);
}

/** Returns Markdown for the main blog index. */
export function blogIndexMarkdown(posts: BlogPost[]): string {
  const mainPosts = posts.filter(isMainBlogPost).sort(compareBlogPostsDesc);

  return normalizeMarkdown(`
# Blog

Current blog posts by Jim Myhrberg.

${postListMarkdown(mainPosts)}

## Archives

- [Archives](${absoluteSiteUrl("/blog/archives/index.md")})
`);
}

/** Returns Markdown for the archive index and general archived posts. */
export function archiveIndexMarkdown(
  generalPosts: BlogPost[],
  namedArchives: NamedArchiveMarkdownLink[],
): string {
  const archiveLinks = namedArchives
    .map((archive) => {
      const href = blogNamedArchiveMarkdownUrl(archive.slug);

      return `- [${archive.label}](${absoluteSiteUrl(href)})`;
    })
    .join("\n");

  return normalizeMarkdown(`
# Blog Archives

Historical and imported blog posts.

## Archive Lists

${archiveLinks || "No named archive lists."}

## Older jimeh.me Posts

${postListMarkdown(generalPosts)}
`);
}

/** Returns Markdown for a named archive list. */
export function namedArchiveMarkdown(label: string, posts: BlogPost[]): string {
  return normalizeMarkdown(`
# ${label} Archive

Archived blog posts imported from ${label}.

${postListMarkdown(posts)}
`);
}

/** Returns Markdown for a full blog post. */
export function blogPostMarkdown(
  post: BlogPost,
  options: BlogPostMarkdownOptions = {},
): string {
  const archive = blogArchiveInfo(post);
  const body = renderMarkdownMdx(post.body ?? "", {
    resolveAsset: (src) => {
      return options.resolveAsset?.(post, src) ?? src;
    },
  });
  const featuredImage = featuredImageMarkdown(post);
  const tags = post.data.tags?.length
    ? `\nTags: ${post.data.tags.join(", ")}`
    : "";
  const archiveLine = archive ? `\nArchive: ${archive.label}` : "";
  const description = post.data.description
    ? `\n${post.data.description}\n`
    : "";

  return normalizeMarkdown(`
# ${post.data.title}

Source: ${absoluteSiteUrl(blogPostUrl(post))}
Date: ${post.data.date}${post.data.updatedDate ? `\nUpdated: ${post.data.updatedDate}` : ""}${archiveLine}${tags}
${description}

${featuredImage}

${body}
`);
}

/** Returns Markdown link list items for blog posts. */
export function postListMarkdown(posts: BlogPost[]): string {
  if (posts.length === 0) {
    return "No posts.";
  }

  return posts
    .slice()
    .sort(compareBlogPostsDesc)
    .map((post) => {
      const href = absoluteSiteUrl(blogPostMarkdownUrl(post));
      const description = post.data.description
        ? `: ${post.data.description}`
        : "";

      return `- [${post.data.title}](${href}) (${post.data.date})${description}`;
    })
    .join("\n");
}

function featuredImageMarkdown(post: BlogPost): string {
  const image = post.data.image;
  if (!image || image.hidden) {
    return "";
  }

  const src = lightImage(image.src).src;
  const alt = image.alt || image.caption || post.data.title;

  return `![${alt}](${absoluteSiteUrl(src)})`;
}

function normalizeMarkdown(markdown: string): string {
  return `${markdown.trim().replace(/\n{3,}/g, "\n\n")}\n`;
}
