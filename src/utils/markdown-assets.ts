import { posix } from "node:path";
import type { CollectionEntry } from "astro:content";
import { absoluteSiteUrl } from "./markdown-export";

type BlogPost = CollectionEntry<"blog">;

const blogAssetUrls = import.meta.glob<string>(
  "/src/content/blog/**/*.{avif,gif,jpeg,jpg,png,svg,webp,zip}",
  { eager: true, import: "default", query: "?url" },
);

/** Resolves a source-relative blog asset reference to its public URL. */
export function resolveBlogMarkdownAsset(
  post: BlogPost,
  source: string,
): string {
  const path = source.split("?", 1)[0] ?? source;
  const key = assetKey(post, path);
  const url = blogAssetUrls[key];

  if (!url) {
    throw new Error(
      `${post.id}: could not resolve Markdown asset reference ${source}.`,
    );
  }

  return absoluteSiteUrl(url);
}

function assetKey(post: BlogPost, source: string): string {
  if (source.startsWith("/src/content/")) {
    return source;
  }

  const filePath = (post as BlogPost & { filePath?: string }).filePath;
  const postDir = filePath
    ? posix.dirname(`/${filePath}`)
    : posix.dirname(`/src/content/blog/${post.id}`);

  return posix.normalize(posix.join(postDir, source));
}
