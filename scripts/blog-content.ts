import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  blogRoutePath,
  blogRouteSlug,
  blogRouteYear,
  blogSourceSlug,
} from "../src/utils/blog-route.ts";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const blogDir = join(repoRoot, "src", "content", "blog");

export interface BlogPostFile {
  dirPath: string;
  fileName: string;
  filePath: string;
  id: string;
  source: string;
}

export interface BlogPostRoute {
  date: string;
  path: string;
  slug: string;
  sourceSlug: string;
  year: string;
}

/** Returns the repository root resolved from the scripts directory. */
export function getRepoRoot(): string {
  return repoRoot;
}

/** Returns the source blog content directory. */
export function getBlogDir(): string {
  return blogDir;
}

/** Converts an absolute path to a stable repo-relative display path. */
export function displayPath(path: string): string {
  return relative(repoRoot, path);
}

/** Reads all Markdown and MDX blog post files. */
export function readBlogPostFiles(): BlogPostFile[] {
  return readBlogPostFilesIn(blogDir).sort((a, b) => a.id.localeCompare(b.id));
}

/** Extracts the raw frontmatter block from a markdown or MDX file. */
export function frontmatter(source: string): string | null {
  const match = source.match(/^---\r?\n(?<body>[\s\S]*?)\r?\n---/);

  return match?.groups?.body ?? null;
}

/** Reads a scalar top-level frontmatter value. */
export function frontmatterScalar(
  frontmatterBody: string,
  key: string,
): string | null {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = frontmatterBody.match(
    new RegExp(`^${escapedKey}:\\s*(?<value>.+?)\\s*$`, "m"),
  );

  if (!match?.groups?.value) {
    return null;
  }

  return stripQuotes(match.groups.value.trim());
}

/** Reads a scalar value from a top-level YAML-ish object block. */
export function frontmatterBlockScalar(
  frontmatterBody: string,
  blockKey: string,
  key: string,
): string | null {
  const lines = frontmatterBody.split(/\r?\n/);
  const blockStart = lines.findIndex((line) => line === `${blockKey}:`);

  if (blockStart === -1) {
    return null;
  }

  for (const line of lines.slice(blockStart + 1)) {
    if (/^\S/.test(line)) {
      break;
    }

    const match = line.match(new RegExp(`^\\s+${key}:\\s*(?<value>.+?)\\s*$`));
    if (match?.groups?.value) {
      return stripQuotes(match.groups.value.trim());
    }
  }

  return null;
}

/** Reads a scalar value from a nested object inside a top-level YAML-ish block. */
export function frontmatterNestedBlockScalar(
  frontmatterBody: string,
  blockKey: string,
  nestedKey: string,
  key: string,
): string | null {
  const lines = frontmatterBody.split(/\r?\n/);
  const blockStart = lines.findIndex((line) => line === `${blockKey}:`);

  if (blockStart === -1) {
    return null;
  }

  let nestedIndent: number | null = null;

  for (const line of lines.slice(blockStart + 1)) {
    if (/^\S/.test(line)) {
      break;
    }

    if (nestedIndent === null) {
      const match = line.match(
        new RegExp(`^(?<indent>\\s+)${nestedKey}:\\s*$`),
      );

      if (match?.groups?.indent) {
        nestedIndent = match.groups.indent.length;
      }

      continue;
    }

    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (indent <= nestedIndent) {
      break;
    }

    const match = line.match(new RegExp(`^\\s+${key}:\\s*(?<value>.+?)\\s*$`));
    if (match?.groups?.value) {
      return stripQuotes(match.groups.value.trim());
    }
  }

  return null;
}

/** Reads a scalar value from a nested YAML-ish frontmatter object path. */
export function frontmatterPathScalar(
  frontmatterBody: string,
  path: string[],
): string | null {
  if (path.length === 0) {
    return null;
  }

  const lines = frontmatterBody.split(/\r?\n/);
  const indents: number[] = [];

  for (const line of lines) {
    const valueMatch = line.match(
      /^(?<indent>\s*)(?<key>[A-Za-z0-9_-]+):\s*(?<value>.+?)\s*$/,
    );
    const blockMatch = line.match(/^(?<indent>\s*)(?<key>[A-Za-z0-9_-]+):\s*$/);
    const match = valueMatch ?? blockMatch;

    if (!match?.groups?.key || match.groups.indent === undefined) {
      continue;
    }

    const indent = match.groups.indent.length;
    while (indents.length > 0 && indent <= indents[indents.length - 1]!) {
      indents.pop();
    }

    if (match.groups.key !== path[indents.length]) {
      continue;
    }

    if (indents.length === path.length - 1) {
      return valueMatch?.groups?.value
        ? stripQuotes(valueMatch.groups.value.trim())
        : null;
    }

    indents.push(indent);
  }

  return null;
}

/** Reads inline string-array frontmatter like `tags: ["a", "b"]`. */
export function frontmatterStringArray(
  frontmatterBody: string,
  key: string,
): string[] {
  const raw = frontmatterScalar(frontmatterBody, key);
  if (!raw?.startsWith("[") || !raw.endsWith("]")) {
    return [];
  }

  return raw
    .slice(1, -1)
    .split(",")
    .map((item) => stripQuotes(item.trim()))
    .filter(Boolean);
}

/** Derives canonical blog route parts from a post file and frontmatter. */
export function blogPostRoute(
  post: BlogPostFile,
  date: string,
  slug: string,
): BlogPostRoute | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const routeInput = { date, slug };

  return {
    date,
    path: blogRoutePath(routeInput),
    slug: blogRouteSlug(routeInput),
    sourceSlug: blogSourceSlug(post.id),
    year: blogRouteYear(date),
  };
}

/** Returns whether a source-relative asset path resolves inside the post dir. */
export function localPostAssetExists(post: BlogPostFile, src: string): boolean {
  if (!src.startsWith("./") && !src.startsWith("../")) {
    return true;
  }

  return existsSync(join(post.dirPath, src));
}

/** Returns local static import paths from an MDX source file. */
export function localStaticImports(post: BlogPostFile): string[] {
  const imports = post.source.matchAll(
    /^import\s+\w+\s+from\s+["'](?<path>\.\/[^"']+)["'];?$/gm,
  );

  return [...imports]
    .map((match) => match.groups?.path)
    .filter((path): path is string => Boolean(path))
    .map((path) => path.split("?")[0])
    .filter((path): path is string => Boolean(path));
}

/** Returns a stable label for a blog post source file. */
export function postLabel(post: BlogPostFile): string {
  return displayPath(post.filePath);
}

function readBlogPostFilesIn(dirPath: string): BlogPostFile[] {
  return readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      return readBlogPostFilesIn(entryPath);
    }

    if (!entry.isFile() || !/^\.mdx?$/.test(extname(entry.name))) {
      return [];
    }

    const id = relative(blogDir, entryPath)
      .slice(0, -extname(entry.name).length)
      .replaceAll("\\", "/");

    return [
      {
        dirPath: dirname(entryPath),
        fileName: entry.name,
        filePath: entryPath,
        id,
        source: readFileSync(entryPath, "utf8"),
      },
    ];
  });
}

function stripQuotes(value: string): string {
  const quote = value[0];
  if ((quote === "'" || quote === '"') && value.endsWith(quote)) {
    return value.slice(1, -1);
  }

  return value;
}
