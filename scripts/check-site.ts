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
import { siteConfig } from "../src/data/site.ts";

const siteUrl = siteConfig.url;
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
  assertIncludes("blog/index.html", 'aria-label="Latest post"');
  assertIncludes("blog/index.html", 'href="/blog/archives/"');
  assertIncludes("rss.xml", `<title>${siteConfig.title}</title>`);
  assertIncludes(
    "rss.xml",
    `<description>${siteConfig.description}</description>`,
  );
  assertIncludes("rss.xml", `<link>${checkSiteUrl}/</link>`);
  assertNotIncludes("rss.xml", "/blog/archives/");

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
    const isArchived = archive !== null && archive !== "false";

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

    if (route.path === "2006/cleaning-up-after-svn") {
      assertIncludes(canonicalPath, "SVN");
      assertIncludes(canonicalPath, `datetime="${date}"`);
      assertIncludes(canonicalPath, 'aria-label="Post navigation"');
    }

    if (isArchived) {
      assertNotIncludes("rss.xml", canonicalUrl);
    } else {
      assertIncludes("rss.xml", canonicalUrl);
    }
  }

  for (const year of years) {
    const yearPath = `blog/${year}/index.html`;
    assertFile(yearPath);
    assertIncludes(yearPath, 'href="/blog/"');
    assertIncludes(yearPath, "<article");
  }

  if (archiveCount > 0) {
    assertFile("blog/archives/index.html");
    assertFile("blog/archives/tags/index.html");
  }

  for (const archive of archives) {
    const archivePath = `blog/archives/${archive}/index.html`;
    const archiveTagsPath = `blog/archives/${archive}/tags/index.html`;
    assertIncludes(
      "blog/archives/index.html",
      `href="/blog/archives/${archive}/"`,
    );
    assertFile(archivePath);
    assertIncludes(archivePath, "<article");
    assertFile(archiveTagsPath);
  }

  for (const tag of tags) {
    const tagPath = `blog/tags/${tag}/index.html`;
    assertIncludes("blog/tags/index.html", `href="/blog/tags/${tag}/"`);
    assertFile(tagPath);
    assertIncludes(tagPath, "<article");
  }

  for (const tag of archiveTags) {
    const tagPath = `blog/archives/tags/${tag}/index.html`;
    assertIncludes(
      "blog/archives/tags/index.html",
      `href="/blog/archives/tags/${tag}/"`,
    );
    assertFile(tagPath);
    assertIncludes(tagPath, "<article");
  }

  for (const [archive, tags] of namedArchiveTags) {
    for (const tag of tags) {
      const tagPath = `blog/archives/${archive}/tags/${tag}/index.html`;
      assertIncludes(
        `blog/archives/${archive}/tags/index.html`,
        `href="/blog/archives/${archive}/tags/${tag}/"`,
      );
      assertFile(tagPath);
      assertIncludes(tagPath, "<article");
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
