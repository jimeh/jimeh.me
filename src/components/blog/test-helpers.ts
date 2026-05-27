import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;
type BlogPostOverrides = Omit<Partial<BlogPost>, "data"> & {
  data?: Partial<BlogPost["data"]>;
};

export function imageMetadata(
  src: string,
  overrides: Partial<ImageMetadata> = {},
): ImageMetadata {
  return {
    src,
    width: 800,
    height: 400,
    format: "jpg",
    ...overrides,
  } as ImageMetadata;
}

export function blogPost(overrides: BlogPostOverrides = {}): BlogPost {
  const { data, ...entryOverrides } = overrides;

  return {
    id: "2025/example-post/index",
    collection: "blog",
    body: "One two three four five.",
    data: {
      title: "Example Post",
      description: "An example post description.",
      date: "2025-06-09",
      slug: "example-post",
      ...data,
    },
    ...entryOverrides,
  } as BlogPost;
}
