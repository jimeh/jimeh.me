import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
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
const failures: string[] = [];

function assertFile(path: string): void {
  const fullPath = join(distDir, path);
  if (!existsSync(fullPath)) {
    failures.push(`${path}: expected built file to exist.`);
  }
}

function assertNoFile(path: string): void {
  const fullPath = join(distDir, path);
  if (existsSync(fullPath)) {
    failures.push(`${path}: expected built file to be absent.`);
  }
}

function assertIncludes(path: string, value: string): void {
  const fullPath = join(distDir, path);
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
  const fullPath = join(distDir, path);
  if (!existsSync(fullPath)) {
    failures.push(`${path}: cannot inspect missing file.`);
    return;
  }

  const source = readFileSync(fullPath, "utf8");
  if (source.includes(value)) {
    failures.push(`${path}: expected to omit ${value}.`);
  }
}

function archiveSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
const archives = new Set<string>();
let archiveCount = 0;

for (const post of readBlogPostFiles()) {
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
    if (archive !== "true") {
      archives.add(archiveSlug(archive));
    }
  } else {
    years.add(route.year);
    if (frontmatterBody) {
      for (const tag of frontmatterStringArray(frontmatterBody, "tags")) {
        tags.add(tag);
      }
    }
  }

  const canonicalPath = `blog/${route.path}/index.html`;
  const sourcePath = `blog/${route.sourceSlug}/index.html`;
  const canonicalUrl = `${siteUrl}/blog/${route.path}/`;

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
}

for (const archive of archives) {
  assertFile(`blog/archives/${archive}/index.html`);
}

for (const tag of tags) {
  assertFile(`blog/tags/${tag}/index.html`);
}

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
