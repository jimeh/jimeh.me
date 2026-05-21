import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import {
  type BlogPostFile,
  blogPostRoute,
  displayPath,
  frontmatter,
  frontmatterScalar,
  frontmatterStringArray,
  getRepoRoot,
  readBlogPostFiles,
} from "./blog-content.ts";

const siteUrl = "https://jimeh.me";
const repoRoot = getRepoRoot();
const distDir = join(repoRoot, "dist");

interface BuiltSiteFailureOptions {
  distDir?: string;
  posts?: BlogPostFile[];
  siteUrl?: string;
}

/** Slugifies archive labels the same way archive route pages do. */
export function archiveSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Returns built-site smoke check failures. */
export function builtSiteFailures(
  options: BuiltSiteFailureOptions = {},
): string[] {
  const checkDistDir = options.distDir ?? distDir;
  const checkSiteUrl = options.siteUrl ?? siteUrl;
  const posts = options.posts ?? readBlogPostFiles();
  const failures: string[] = [];

  function assertFile(path: string): void {
    const fullPath = join(checkDistDir, path);
    if (!existsSync(fullPath)) {
      failures.push(`${path}: expected built file to exist.`);
    }
  }

  function assertNoFile(path: string): void {
    const fullPath = join(checkDistDir, path);
    if (existsSync(fullPath)) {
      failures.push(`${path}: expected built file to be absent.`);
    }
  }

  function assertIncludes(path: string, value: string): void {
    const fullPath = join(checkDistDir, path);
    if (!existsSync(fullPath)) {
      failures.push(`${path}: cannot inspect missing file.`);
      return;
    }

    const source = readFileSync(fullPath, "utf8");
    if (!source.includes(value)) {
      failures.push(`${path}: expected to include ${value}.`);
    }
  }

  function assertNotIncludes(path: string, value: string): void {
    const fullPath = join(checkDistDir, path);
    if (!existsSync(fullPath)) {
      failures.push(`${path}: cannot inspect missing file.`);
      return;
    }

    const source = readFileSync(fullPath, "utf8");
    if (source.includes(value)) {
      failures.push(`${path}: expected to omit ${value}.`);
    }
  }

  assertFile("index.html");
  assertFile("blog/index.html");
  assertFile("blog/tags/index.html");
  assertFile("rss.xml");
  assertFile("sitemap-index.xml");
  assertFile("sitemap-0.xml");
  assertFile("favicon.ico");
  assertFile("apple-touch-icon.png");
  assertFile("img/jimeh-4.2.0.jpg");

  const years = new Set<string>();
  const tags = new Set<string>();
  const archiveTags = new Set<string>();
  const archives = new Set<string>();
  const namedArchiveTags = new Map<string, Set<string>>();
  let archiveCount = 0;

  for (const post of posts) {
    const frontmatterBody = frontmatter(post.source);
    const date = frontmatterBody
      ? frontmatterScalar(frontmatterBody, "date")
      : null;
    const slug = frontmatterBody
      ? frontmatterScalar(frontmatterBody, "slug")
      : null;
    const route = date && slug ? blogPostRoute(post, date, slug) : null;
    if (!frontmatterBody || !route) {
      continue;
    }

    const archive = frontmatterBody
      ? frontmatterScalar(frontmatterBody, "archive")
      : null;
    const isArchived = archive !== null;

    if (isArchived) {
      archiveCount += 1;
      const postTags = frontmatterStringArray(frontmatterBody, "tags");
      if (archive !== "true") {
        const slug = archiveSlug(archive);
        archives.add(slug);
        const tags = namedArchiveTags.get(slug) ?? new Set<string>();
        for (const tag of postTags) {
          tags.add(tag);
        }
        namedArchiveTags.set(slug, tags);
      } else {
        for (const tag of postTags) {
          archiveTags.add(tag);
        }
      }
    } else {
      years.add(route.year);
      for (const tag of frontmatterStringArray(frontmatterBody, "tags")) {
        tags.add(tag);
      }
    }

    const canonicalPath = `blog/${route.path}/index.html`;
    const sourcePath = `blog/${route.sourceSlug}/index.html`;
    const canonicalUrl = `${checkSiteUrl}/blog/${route.path}/`;

    assertFile(canonicalPath);
    if (sourcePath !== canonicalPath) {
      assertNoFile(sourcePath);
    }
    assertIncludes("sitemap-0.xml", canonicalUrl);

    if (isArchived) {
      assertNotIncludes("rss.xml", canonicalUrl);
    } else {
      assertIncludes("rss.xml", canonicalUrl);
    }
  }

  for (const year of years) {
    assertFile(`blog/${year}/index.html`);
  }

  if (archiveCount > 0) {
    assertFile("blog/archives/index.html");
    assertFile("blog/archives/tags/index.html");
  }

  for (const archive of archives) {
    assertFile(`blog/archives/${archive}/index.html`);
    assertFile(`blog/archives/${archive}/tags/index.html`);
  }

  for (const tag of tags) {
    assertFile(`blog/tags/${tag}/index.html`);
  }

  for (const tag of archiveTags) {
    assertFile(`blog/archives/tags/${tag}/index.html`);
  }

  for (const [archive, tags] of namedArchiveTags) {
    for (const tag of tags) {
      assertFile(`blog/archives/${archive}/tags/${tag}/index.html`);
    }
  }

  return failures;
}

/** Runs built-site smoke checks and sets a failing process exit code. */
export function runBuiltSiteCheck(): void {
  const failures = builtSiteFailures();

  if (failures.length > 0) {
    console.error("Built site smoke checks failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    console.error(
      `Checked build output in ${displayPath(distDir)}. ` +
        "Run `mise run build` before `mise run smoke`.",
    );
    process.exitCode = 1;
  } else {
    console.log("Built site smoke checks passed.");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  runBuiltSiteCheck();
}
