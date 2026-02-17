import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { siteConfig } from "../data/site";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog");

  posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.date + "T00:00:00"),
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
  });
}
