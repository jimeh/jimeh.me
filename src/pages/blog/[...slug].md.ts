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

export async function GET({ props }: { props: { post: BlogPost } }) {
  return markdownResponse(
    await blogPostMarkdown(props.post, {
      resolveAsset: resolveBlogMarkdownAsset,
    }),
  );
}
