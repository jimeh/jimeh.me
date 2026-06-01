import { getCollection } from "astro:content";
import { archivesIndexData } from "@utils/blog-page-data";
import { isMainBlogPost } from "@utils/blog-archive";
import { compareBlogPostsDesc } from "@utils/blog-sort";
import {
  absoluteSiteUrl,
  blogNamedArchiveMarkdownUrl,
  blogPostMarkdownUrl,
  markdownResponse,
  publicProfileMarkdown,
} from "@utils/markdown-export";
import { siteConfig } from "../data/site";

export async function GET() {
  const posts = await getCollection("blog");
  const mainPosts = posts.filter(isMainBlogPost).sort(compareBlogPostsDesc);
  const archiveData = archivesIndexData(posts);
  const archiveLinks = archiveData.namedArchives
    .map((archive) => {
      const href = absoluteSiteUrl(blogNamedArchiveMarkdownUrl(archive.slug));

      return `- [${archive.label} archive](${href})`;
    })
    .join("\n");
  const blogLinks = mainPosts
    .map((post) => {
      const href = absoluteSiteUrl(blogPostMarkdownUrl(post));

      return `- [${post.data.title}](${href}): ${post.data.description}`;
    })
    .join("\n");

  return markdownResponse(`# ${siteConfig.title}

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
