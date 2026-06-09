import { getCollection } from "astro:content";
import { archivePageData, archiveStaticPaths } from "@utils/blog-page-data";
import { markdownResponse, namedArchiveMarkdown } from "@utils/markdown-export";

export async function getStaticPaths() {
  return archiveStaticPaths(await getCollection("blog"));
}

export async function GET({
  props,
}: {
  props: { label: string; slug: string };
}) {
  const data = archivePageData(await getCollection("blog"), props.slug);

  return markdownResponse(await namedArchiveMarkdown(props.label, data.posts));
}
