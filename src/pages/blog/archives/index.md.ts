import { getCollection } from "astro:content";
import { archivesIndexData } from "@utils/blog-page-data";
import { archiveIndexMarkdown, markdownResponse } from "@utils/markdown-export";

export async function GET() {
  const data = archivesIndexData(await getCollection("blog"));

  return markdownResponse(
    archiveIndexMarkdown(data.generalPosts, data.namedArchives),
  );
}
