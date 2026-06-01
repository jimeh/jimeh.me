import { getCollection } from "astro:content";
import { blogIndexMarkdown, markdownResponse } from "@utils/markdown-export";

export async function GET() {
  return markdownResponse(blogIndexMarkdown(await getCollection("blog")));
}
