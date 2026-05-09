import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  blogPostRoute,
  displayPath,
  frontmatter,
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

for (const post of readBlogPostFiles()) {
  const route = blogPostRoute(post.dirName);
  if (!route) {
    continue;
  }

  years.add(route.year);

  const frontmatterBody = frontmatter(post.source);
  if (frontmatterBody) {
    for (const tag of frontmatterStringArray(frontmatterBody, "tags")) {
      tags.add(tag);
    }
  }

  const canonicalPath = `blog/${route.year}/${route.slug}/index.html`;
  const legacyPath = `blog/${route.dirName}/index.html`;
  const canonicalUrl = `${siteUrl}/blog/${route.year}/${route.slug}/`;

  assertFile(canonicalPath);
  assertFile(legacyPath);
  assertIncludes("rss.xml", canonicalUrl);
  assertIncludes("sitemap-0.xml", canonicalUrl);
}

for (const year of years) {
  assertFile(`blog/${year}/index.html`);
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
