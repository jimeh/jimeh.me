import { getCollection } from "astro:content";
import {
  type BlogPost,
  blogPostMarkdown,
  markdownResponse,
} from "@utils/markdown-export";
import { resolveBlogMarkdownAsset } from "@utils/markdown-assets";
import { blogPostStaticPaths } from "@utils/blog-page-data";

export async function getStaticPaths() {
  return blogPostStaticPaths(await getCollection("blog"));
}

export function GET({ props }: { props: { post: BlogPost } }) {
  return markdownResponse(
    blogPostMarkdown(props.post, { resolveAsset: resolveBlogMarkdownAsset }),
  );
}
