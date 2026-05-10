import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const blogDir = join(repoRoot, "src", "content", "blog");
const datedBlogDirRe =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<slug>.+)$/;

export interface BlogPostFile {
  dirName: string;
  dirPath: string;
  fileName: string;
  filePath: string;
  source: string;
}

export interface BlogPostRoute {
  date: string;
  dirName: string;
  slug: string;
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

/** Reads all blog post index files from dated post directories. */
export function readBlogPostFiles(): BlogPostFile[] {
  return readdirSync(blogDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dirPath = join(blogDir, entry.name);
      const indexFiles = readdirSync(dirPath).filter((file) =>
        /^index\.mdx?$/.test(file),
      );

      if (indexFiles.length !== 1) {
        return null;
      }

      const fileName = indexFiles[0];
      if (!fileName) {
        return null;
      }

      const filePath = join(dirPath, fileName);

      return {
        dirName: entry.name,
        dirPath,
        fileName,
        filePath,
        source: readFileSync(filePath, "utf8"),
      };
    })
    .filter((post): post is BlogPostFile => post !== null)
    .sort((a, b) => a.dirName.localeCompare(b.dirName));
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

/** Derives canonical blog route parts from the dated directory name. */
export function blogPostRoute(dirName: string): BlogPostRoute | null {
  const match = dirName.match(datedBlogDirRe);
  if (!match?.groups) {
    return null;
  }

  const { year, month, day, slug } = match.groups;
  if (!year || !month || !day || !slug) {
    return null;
  }

  return {
    date: `${year}-${month}-${day}`,
    dirName,
    slug,
    year,
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
    .filter((path): path is string => Boolean(path));
}

/** Returns a stable label for a blog post source file. */
export function postLabel(post: BlogPostFile): string {
  return join(basename(dirname(post.filePath)), post.fileName);
}

function stripQuotes(value: string): string {
  const quote = value[0];
  if ((quote === "'" || quote === '"') && value.endsWith(quote)) {
    return value.slice(1, -1);
  }

  return value;
}
