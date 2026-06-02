import type { CollectionEntry } from "astro:content";
import prettier from "prettier";
import { stringify as stringifyYaml } from "yaml";
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

const prettierConfigFile = "generated.md";

/** Returns a Markdown response suitable for static text endpoints. */
export function markdownResponse(markdown: string): Response {
  return new Response(markdown, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}

/** Formats generated Markdown with the same Prettier config as project files. */
export async function formatMarkdown(markdown: string): Promise<string> {
  const config = await prettier.resolveConfig(prettierConfigFile);

  return prettier.format(markdown, {
    ...config,
    parser: "markdown",
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
export async function llmsDirectoryMarkdown(
  mainPosts: BlogPost[],
  namedArchives: NamedArchiveMarkdownLink[],
): Promise<string> {
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

  return formatMarkdown(`
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
export async function blogIndexMarkdown(posts: BlogPost[]): Promise<string> {
  const mainPosts = posts.filter(isMainBlogPost).sort(compareBlogPostsDesc);

  return formatMarkdown(`
# Blog

Current blog posts by Jim Myhrberg.

${postListMarkdown(mainPosts)}

## Archives

- [Archives](${absoluteSiteUrl("/blog/archives/index.md")})
`);
}

/** Returns Markdown for the archive index and general archived posts. */
export async function archiveIndexMarkdown(
  generalPosts: BlogPost[],
  namedArchives: NamedArchiveMarkdownLink[],
): Promise<string> {
  const archiveLinks = namedArchives
    .map((archive) => {
      const href = blogNamedArchiveMarkdownUrl(archive.slug);

      return `- [${archive.label}](${absoluteSiteUrl(href)})`;
    })
    .join("\n");

  return formatMarkdown(`
# Blog Archives

Historical and imported blog posts.

## Archive Lists

${archiveLinks || "No named archive lists."}

## Older jimeh.me Posts

${postListMarkdown(generalPosts)}
`);
}

/** Returns Markdown for a named archive list. */
export async function namedArchiveMarkdown(
  label: string,
  posts: BlogPost[],
): Promise<string> {
  return formatMarkdown(`
# ${label} Archive

Archived blog posts imported from ${label}.

${postListMarkdown(posts)}
`);
}

/** Returns Markdown for a full blog post. */
export async function blogPostMarkdown(
  post: BlogPost,
  options: BlogPostMarkdownOptions = {},
): Promise<string> {
  const archive = blogArchiveInfo(post);
  const body = renderMarkdownMdx(post.body ?? "", {
    resolveAsset: (src) => {
      return options.resolveAsset?.(post, src) ?? src;
    },
  });
  const frontmatter = postFrontmatterMarkdown(post, archive);
  const featuredImage = featuredImageMarkdown(post, options);
  const description = post.data.description
    ? `${post.data.description}\n\n`
    : "";

  return formatMarkdown(`
${frontmatter}

# ${post.data.title}

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

function postFrontmatterMarkdown(
  post: BlogPost,
  archive: ReturnType<typeof blogArchiveInfo>,
): string {
  const metadata: Record<string, string | string[]> = {
    source: absoluteSiteUrl(blogPostUrl(post)),
    date: post.data.date,
  };

  if (post.data.updatedDate) {
    metadata.updatedDate = post.data.updatedDate;
  }
  if (archive) {
    metadata.archive = archive.isGeneral ? "jimeh.me" : archive.label;
  }
  if (post.data.tags?.length) {
    metadata.tags = post.data.tags;
  }

  return `---\n${stringifyYaml(metadata).trimEnd()}\n---`;
}

function featuredImageMarkdown(
  post: BlogPost,
  options: BlogPostMarkdownOptions,
): string {
  const image = post.data.image;
  if (!image || image.hidden) {
    return "";
  }

  const src = lightImage(image.src).src;
  const href =
    options.resolveAsset && isResolvableMarkdownAsset(src)
      ? options.resolveAsset(post, src)
      : src;
  const alt = image.alt || image.caption || post.data.title;

  return `![${alt}](${absoluteSiteUrl(href)})`;
}

function isResolvableMarkdownAsset(source: string): boolean {
  return (
    source.startsWith("./") ||
    source.startsWith("../") ||
    source.startsWith("/@fs/") ||
    source.startsWith("/src/content/")
  );
}

function normalizeMarkdown(markdown: string): string {
  return `${markdown.trim().replace(/\n{3,}/g, "\n\n")}\n`;
}
