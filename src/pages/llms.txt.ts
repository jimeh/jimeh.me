import { getCollection } from "astro:content";
import { archivesIndexData } from "@utils/blog-page-data";
import { isMainBlogPost } from "@utils/blog-archive";
import {
  llmsDirectoryMarkdown,
  markdownResponse,
} from "@utils/markdown-export";

export async function GET() {
  const posts = await getCollection("blog");
  const mainPosts = posts.filter(isMainBlogPost);
  const archiveData = archivesIndexData(posts);

  return markdownResponse(
    llmsDirectoryMarkdown(mainPosts, archiveData.namedArchives),
  );
}
