import type { CollectionEntry } from "astro:content";
import {
  blogArchiveInfo,
  isGeneralArchivePost,
  isArchivedPost,
  isMainBlogPost,
  sameBlogArchiveContext,
} from "./blog-archive";
import { compareBlogPostsAsc, compareBlogPostsDesc } from "./blog-sort";
import { blogPostRoute, blogPostYear } from "./blog-url";

export type BlogPost = CollectionEntry<"blog">;

export interface BlogIndexData {
  archivePosts: BlogPost[];
  archiveSummary: string;
  eagerThumbnailIds: Set<string>;
  featuredPost: BlogPost | undefined;
  posts: BlogPost[];
  postsByYear: Map<string, BlogPost[]>;
  remainingPosts: BlogPost[];
  years: string[];
}

export interface ArchivesIndexData {
  archivedPosts: BlogPost[];
  generalPosts: BlogPost[];
  generalPostsByYear: Map<string, BlogPost[]>;
  generalYears: string[];
  namedArchives: ArchiveGroup[];
}

export interface ArchiveGroup {
  label: string;
  slug: string;
  url: string;
  posts: BlogPost[];
}

export interface ArchivePageData {
  posts: BlogPost[];
  postsByYear: Map<string, BlogPost[]>;
  yearRange: string;
  years: string[];
}

export interface NamedArchiveTagStaticPathProps {
  label: string;
  slug: string;
  tag: string;
}

export interface PostPageNavigation {
  nextPost: BlogPost | null;
  prevPost: BlogPost | null;
}

type BlogPostFilter = (post: BlogPost) => boolean;

/** Groups blog posts by their canonical year, preserving input order. */
export function groupPostsByYear(posts: BlogPost[]): Map<string, BlogPost[]> {
  const postsByYear = new Map<string, BlogPost[]>();

  for (const post of posts) {
    const year = blogPostYear(post);
    if (!postsByYear.has(year)) {
      postsByYear.set(year, []);
    }
    postsByYear.get(year)!.push(post);
  }

  return postsByYear;
}

/** Returns years newest-first for a grouped post set. */
export function sortedBlogYears(
  postsByYear: Map<string, BlogPost[]>,
): string[] {
  return [...postsByYear.keys()].sort((a, b) => b.localeCompare(a));
}

/** Returns all main blog post years for static path generation. */
export function blogYearStaticPaths(posts: BlogPost[]) {
  const years = new Set(posts.filter(isMainBlogPost).map(blogPostYear));

  return [...years].map((year) => ({
    params: { year },
    props: { year },
  }));
}

/** Returns sorted main posts for a specific canonical year. */
export function blogYearPosts(posts: BlogPost[], year: string): BlogPost[] {
  return posts
    .filter((post) => isMainBlogPost(post) && blogPostYear(post) === year)
    .sort(compareBlogPostsDesc);
}

/** Counts tags across filtered blog posts. */
export function tagCounts(
  posts: BlogPost[],
  filter: BlogPostFilter = isMainBlogPost,
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const post of posts.filter(filter)) {
    for (const tag of post.data.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return counts;
}

/** Returns tag counts sorted alphabetically by tag. */
export function sortedTagCounts(
  posts: BlogPost[],
  filter: BlogPostFilter = isMainBlogPost,
): Array<[string, number]> {
  return [...tagCounts(posts, filter).entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
}

/** Returns general archive tag counts sorted alphabetically by tag. */
export function sortedArchiveTagCounts(
  posts: BlogPost[],
): Array<[string, number]> {
  return sortedTagCounts(posts, isGeneralArchivePost);
}

/** Returns named archive tag counts sorted alphabetically by tag. */
export function sortedNamedArchiveTagCounts(
  posts: BlogPost[],
  archiveSlug: string,
): Array<[string, number]> {
  return sortedTagCounts(posts, namedArchivePostFilter(archiveSlug));
}

/** Returns main blog tags for static path generation. */
export function blogTagStaticPaths(posts: BlogPost[]) {
  return tagStaticPaths(posts, isMainBlogPost);
}

/** Returns general archive tags for static path generation. */
export function archiveTagStaticPaths(posts: BlogPost[]) {
  return tagStaticPaths(posts, isGeneralArchivePost);
}

/** Returns named archive tag paths for static path generation. */
export function namedArchiveTagStaticPaths(posts: BlogPost[]) {
  const paths: Array<{
    params: { archive: string; tag: string };
    props: NamedArchiveTagStaticPathProps;
  }> = [];

  for (const archive of namedArchiveGroups(posts.filter(isArchivedPost))) {
    for (const tag of tagCounts(
      archive.posts,
      namedArchivePostFilter(archive.slug),
    ).keys()) {
      paths.push({
        params: { archive: archive.slug, tag },
        props: { label: archive.label, slug: archive.slug, tag },
      });
    }
  }

  return paths;
}

/** Returns named archive paths for tag index static path generation. */
export function namedArchiveTagIndexStaticPaths(posts: BlogPost[]) {
  return namedArchiveGroups(posts.filter(isArchivedPost)).map(
    ({ label, slug }) => ({
      params: { archive: slug },
      props: { label, slug },
    }),
  );
}

/** Returns sorted main blog posts for a specific tag. */
export function blogTagPosts(posts: BlogPost[], tag: string): BlogPost[] {
  return tagPosts(posts, tag, isMainBlogPost);
}

/** Returns sorted general archive posts for a specific tag. */
export function archiveTagPosts(posts: BlogPost[], tag: string): BlogPost[] {
  return tagPosts(posts, tag, isGeneralArchivePost);
}

/** Returns sorted named archive posts for a specific tag. */
export function namedArchiveTagPosts(
  posts: BlogPost[],
  archiveSlug: string,
  tag: string,
): BlogPost[] {
  return tagPosts(posts, tag, namedArchivePostFilter(archiveSlug));
}

function tagStaticPaths(posts: BlogPost[], filter: BlogPostFilter) {
  return [...tagCounts(posts, filter).keys()].map((tag) => ({
    params: { tag },
    props: { tag },
  }));
}

function tagPosts(
  posts: BlogPost[],
  tag: string,
  filter: BlogPostFilter,
): BlogPost[] {
  return posts
    .filter((post) => filter(post) && post.data.tags?.includes(tag))
    .sort(compareBlogPostsDesc);
}

function namedArchivePostFilter(archiveSlug: string): BlogPostFilter {
  return (post) => {
    const archive = blogArchiveInfo(post);

    return !!archive && !archive.isGeneral && archive.slug === archiveSlug;
  };
}

/** Builds the blog index data model. */
export function blogIndexData(
  allPosts: BlogPost[],
  siteHost: string,
  eagerThumbnailCount = 6,
): BlogIndexData {
  const posts = allPosts.filter(isMainBlogPost).sort(compareBlogPostsDesc);
  const archivePosts = allPosts
    .filter(isArchivedPost)
    .sort(compareBlogPostsDesc);
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);
  const eagerThumbnailIds = new Set(
    remainingPosts.slice(0, eagerThumbnailCount).map((post) => post.id),
  );
  const postsByYear = groupPostsByYear(remainingPosts);
  const years = sortedBlogYears(postsByYear);
  const archiveSummary = blogArchiveSummary(archivePosts, siteHost);

  return {
    archivePosts,
    archiveSummary,
    eagerThumbnailIds,
    featuredPost,
    posts,
    postsByYear,
    remainingPosts,
    years,
  };
}

/** Builds the archive index data model. */
export function archivesIndexData(allPosts: BlogPost[]): ArchivesIndexData {
  const archivedPosts = allPosts
    .filter(isArchivedPost)
    .sort(compareBlogPostsDesc);
  const generalPosts = archivedPosts.filter(
    (post) => post.data.archive === true,
  );
  const generalPostsByYear = groupPostsByYear(generalPosts);
  const generalYears = sortedBlogYears(generalPostsByYear);

  return {
    archivedPosts,
    generalPosts,
    generalPostsByYear,
    generalYears,
    namedArchives: namedArchiveGroups(archivedPosts),
  };
}

/** Returns named archive static paths. */
export function archiveStaticPaths(posts: BlogPost[]) {
  const archives = new Map<string, string>();

  for (const post of posts) {
    const archive = blogArchiveInfo(post);
    if (archive && !archive.isGeneral) {
      archives.set(archive.slug, archive.label);
    }
  }

  return [...archives.entries()].map(([slug, label]) => ({
    params: { archive: slug },
    props: { label, slug },
  }));
}

/** Builds the named archive page data model. */
export function archivePageData(
  allPosts: BlogPost[],
  slug: string,
): ArchivePageData {
  const posts = allPosts
    .filter((post) => {
      const archive = blogArchiveInfo(post);

      return archive && !archive.isGeneral && archive.slug === slug;
    })
    .sort(compareBlogPostsDesc);
  const postsByYear = groupPostsByYear(posts);

  return {
    posts,
    postsByYear,
    yearRange: yearRange(posts),
    years: sortedBlogYears(postsByYear),
  };
}

/** Returns post routes for the dynamic post page. */
export function blogPostStaticPaths(posts: BlogPost[]) {
  return posts.map((post) => ({
    params: { slug: blogPostRoute(post) },
    props: { post },
  }));
}

/** Returns previous and next posts inside the current archive context. */
export function postPageNavigation(
  allPosts: BlogPost[],
  post: BlogPost,
): PostPageNavigation {
  const contextPosts = allPosts
    .filter((candidate) => sameBlogArchiveContext(candidate, post))
    .sort(compareBlogPostsAsc);
  const currentIndex = contextPosts.findIndex((candidate) => {
    return candidate.id === post.id;
  });
  if (currentIndex === -1) {
    return {
      prevPost: null,
      nextPost: null,
    };
  }

  return {
    prevPost: currentIndex > 0 ? contextPosts[currentIndex - 1]! : null,
    nextPost:
      currentIndex < contextPosts.length - 1
        ? contextPosts[currentIndex + 1]!
        : null,
  };
}

/** Returns the oldest-newest year span for a post set. */
export function yearRange(posts: BlogPost[]): string {
  const dates = posts.map((post) => post.data.date).sort();
  const first = dates[0]?.slice(0, 4) ?? "";
  const last = dates[dates.length - 1]?.slice(0, 4) ?? "";

  return first === last ? first : `${first}-${last}`;
}

function blogArchiveSummary(
  archivePosts: BlogPost[],
  siteHost: string,
): string {
  const archiveNames = [];
  if (archivePosts.some((post) => blogArchiveInfo(post)?.isGeneral)) {
    archiveNames.push(siteHost);
  }
  archiveNames.push(
    ...new Set(
      archivePosts
        .map((post) => blogArchiveInfo(post))
        .filter((archive) => archive && !archive.isGeneral)
        .map((archive) => archive!.label),
    ),
  );

  return archiveNames.length > 0
    ? `${archivePosts.length} older posts from ${archiveNames.join(", ")}`
    : `${archivePosts.length} older posts`;
}

function namedArchiveGroups(archivedPosts: BlogPost[]): ArchiveGroup[] {
  const archiveGroups = new Map<string, ArchiveGroup>();

  for (const post of archivedPosts) {
    const archive = blogArchiveInfo(post);
    if (!archive || archive.isGeneral) {
      continue;
    }

    const group = archiveGroups.get(archive.slug) ?? {
      label: archive.label,
      slug: archive.slug,
      url: archive.url,
      posts: [],
    };
    group.posts.push(post);
    archiveGroups.set(archive.slug, group);
  }

  return [...archiveGroups.values()].sort(
    (a, b) =>
      latestPostDate(b.posts).localeCompare(latestPostDate(a.posts)) ||
      a.label.localeCompare(b.label),
  );
}

function latestPostDate(posts: BlogPost[]): string {
  return posts[0]?.data.date ?? "";
}
