import { getCollection } from "astro:content";
import { blogIndexMarkdown, markdownResponse } from "@utils/markdown-export";

export async function GET() {
  return markdownResponse(await blogIndexMarkdown(await getCollection("blog")));
}
