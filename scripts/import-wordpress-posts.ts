/**
 * Import historical WordPress posts from the SQLite analysis database.
 *
 * Usage:
 *   pnpm tsx scripts/import-wordpress-posts.ts [--force]
 */

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseHTML } from "linkedom";
import TurndownService from "turndown";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const BLOG_DIR = join(ROOT_DIR, "src", "content", "blog");
const DB_PATH = join(ROOT_DIR, "tmp", "wordpress-posts.sqlite");

export interface ImportPost {
  source: string;
  old_id: number;
  post_date: string;
  post_modified: string;
  title: string;
  slug: string;
  categories: string;
  tags: string;
  content_html: string;
}

export interface PostAsset {
  old_id: number;
  upload_path: string;
  local_path: string;
}

export interface MarkdownContent {
  body: string;
  imports: Map<string, string>;
}

function sqliteJson<T>(sql: string): T[] {
  const output = execFileSync("sqlite3", ["-json", DB_PATH, sql], {
    encoding: "utf-8",
    maxBuffer: 20 * 1024 * 1024,
  });
  return JSON.parse(output) as T[];
}

function loadPosts(): ImportPost[] {
  return sqliteJson<ImportPost>(`
    SELECT source, old_id, post_date, post_modified, title, slug, categories,
           tags, content_html
    FROM canonical_import_candidates
    ORDER BY post_date, old_id
  `);
}

function loadAssets(): Map<number, PostAsset[]> {
  const rows = sqliteJson<PostAsset>(`
    SELECT old_id, upload_path, local_path
    FROM canonical_post_assets
    WHERE file_exists = 1
    ORDER BY old_id, upload_path
  `);
  const byPost = new Map<number, PostAsset[]>();

  for (const row of rows) {
    const existing = byPost.get(row.old_id) ?? [];
    if (!existing.some((asset) => asset.upload_path === row.upload_path)) {
      existing.push(row);
      byPost.set(row.old_id, existing);
    }
  }

  return byPost;
}

export function dateOnly(dateTime: string): string {
  return dateTime.slice(0, 10);
}

export function datedSlug(post: ImportPost): string {
  return `${dateOnly(post.post_date)}-${post.slug}`;
}

export function slugTag(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function postTags(post: ImportPost): string[] {
  const values = post.categories
    .split(",")
    .map((part) => slugTag(part.trim()))
    .filter(Boolean);

  return [...new Set(values)].sort();
}

export function assetNameMap(assets: PostAsset[]): Map<string, string> {
  const used = new Set<string>();
  const result = new Map<string, string>();

  for (const asset of assets) {
    let name = basename(asset.upload_path);
    if (used.has(name)) {
      name = asset.upload_path.replace(/\//g, "-");
    }
    used.add(name);
    result.set(asset.upload_path, name);
  }

  return result;
}

function copyAssets(
  postDir: string,
  assets: PostAsset[],
  names: Map<string, string>,
): void {
  mkdirSync(postDir, { recursive: true });

  for (const asset of assets) {
    const targetName = names.get(asset.upload_path);
    if (!targetName) continue;
    copyFileSync(join(ROOT_DIR, asset.local_path), join(postDir, targetName));
  }
}

export function rewriteUploadUrls(
  html: string,
  names: Map<string, string>,
): string {
  let result = html;

  for (const [uploadPath, filename] of names) {
    const escaped = uploadPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`https?://[^"')\\s<>]+/wp-content/uploads/${escaped}`, "g"),
      `./${filename}`,
    );
    result = result.replace(
      new RegExp(`/wp-content/uploads/${escaped}`, "g"),
      `./${filename}`,
    );
  }

  return result;
}

export function sanitizeHtml(html: string): string {
  const { document } = parseHTML(`<main>${html}</main>`);
  const root = document.querySelector("main");
  if (!root) return html;

  for (const el of Array.from(
    root.querySelectorAll(
      [
        "base",
        "button",
        "embed",
        "form",
        "iframe",
        "input",
        "link",
        "meta",
        "object",
        "script",
        "style",
        "textarea",
      ].join(", "),
    ),
  )) {
    el.remove();
  }

  for (const el of Array.from(root.querySelectorAll("[style]"))) {
    const style = el.getAttribute("style") ?? "";
    if (/height\s*:\s*0|width\s*:\s*0|overflow\s*:\s*hidden/i.test(style)) {
      el.remove();
      continue;
    }
    el.removeAttribute("style");
  }

  for (const el of Array.from(root.querySelectorAll("*"))) {
    el.removeAttribute("class");
    el.removeAttribute("align");
    el.removeAttribute("rel");

    for (const attr of Array.from(el.attributes)) {
      if (/^on/i.test(attr.name)) {
        el.removeAttribute(attr.name);
      }
    }

    for (const attrName of ["href", "src"]) {
      const value = el.getAttribute(attrName);
      if (value && /^(?:javascript|vbscript|data):/i.test(value.trim())) {
        el.removeAttribute(attrName);
      }
    }
  }

  return root.innerHTML;
}

export function wpAutop(html: string): string {
  const blockTags = [
    "address",
    "blockquote",
    "div",
    "dl",
    "fieldset",
    "figure",
    "form",
    "h[1-6]",
    "hr",
    "li",
    "ol",
    "p",
    "pre",
    "table",
    "ul",
  ].join("|");
  const blockRe = new RegExp(`</?(${blockTags})[^>]*>`, "gi");

  let text = html.replace(/\r\n?/g, "\n").trim();
  if (!text) return "";

  text = text.replace(blockRe, "\n\n$&\n\n");
  text = text.replace(/\n{3,}/g, "\n\n");

  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (new RegExp(`^</?(${blockTags})(?:\\s|>|/)`, "i").test(part)) {
        return part;
      }
      return `<p>${part.replace(/\n/g, "<br />\n")}</p>`;
    });

  return paragraphs.join("\n\n");
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export function detectCodeLanguage(code: string): string {
  const trimmed = code.trim();
  if (/^(AddType|DocumentRoot|Include|Listen|<VirtualHost)\s/i.test(trimmed)) {
    return "apache";
  }
  if (/^<\?php|mysql_|function\s+\w+\s*\(|\$\w+/.test(trimmed)) {
    return "php";
  }
  if (/^\s*(find|cd|sudo|rm|tar|chmod|ssh)\s/.test(trimmed)) {
    return "sh";
  }
  if (/^\s*<[a-z!/]/i.test(trimmed)) {
    return "html";
  }
  return "";
}

export function elementTextWithBreaks(node: HTMLElement): string {
  return (node.innerHTML ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(?:div|h[1-6]|p)(?:\s[^>]*)?>/gi, "\n")
    .replace(/<\/(?:div|h[1-6]|p)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => decodeHtmlEntities(line).trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isCodeLikeBlockquote(text: string): boolean {
  return /^(?:sudo|Include|DocumentRoot|Listen|127\.0\.0\.1\b|<VirtualHost\b)/m.test(
    text,
  );
}

export function createTurndown(): TurndownService {
  const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "```",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });

  td.addRule("preformatted", {
    filter: "pre",
    replacement(_content, node) {
      let code = (node as HTMLElement).innerHTML ?? "";
      code = code.replace(/<br\s*\/?>/gi, "\n");
      code = code.replace(/<\/?(tt|code|font)[^>]*>/gi, "");
      code = code.replace(/<[^>]+>/g, "");
      code = decodeHtmlEntities(code).trim();
      const lang = detectCodeLanguage(code);
      return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    },
  });

  td.addRule("blockquotes", {
    filter: "blockquote",
    replacement(content, node) {
      const text = elementTextWithBreaks(node as HTMLElement);
      if (!text) return "";

      if (isCodeLikeBlockquote(text)) {
        const lang = detectCodeLanguage(text) || "text";
        return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
      }

      const markdown = content
        .trim()
        .replace(/^\\?##\s*\n+\s*(\[Download\b[^\n]+)$/i, "## $1");
      if (/^##\s+\[Download\b/i.test(markdown)) {
        return `\n\n${markdown}\n\n`;
      }

      return `\n\n${markdown
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n")}\n\n`;
    },
  });

  td.addRule("paragraphImages", {
    filter(node) {
      return (
        node.nodeName === "P" &&
        node.childNodes.length === 1 &&
        node.firstChild?.nodeName === "IMG"
      );
    },
    replacement(_content, node) {
      const img = (node as HTMLElement).querySelector("img");
      if (!img) return "";
      const src = img.getAttribute("src") ?? "";
      const title = img.getAttribute("title") ?? "";
      const fallback = basename(src).replace(/\.[^.]+$/, "");
      const alt = img.getAttribute("alt") || title || fallback;
      return `\n\n![${alt}](${src})\n\n`;
    },
  });

  td.addRule("imagesWithAltFallback", {
    filter: "img",
    replacement(_content, node) {
      const img = node as HTMLElement;
      const src = img.getAttribute("src") ?? "";
      const title = img.getAttribute("title") ?? "";
      const fallback = basename(src).replace(/\.[^.]+$/, "");
      const alt = img.getAttribute("alt") || title || fallback;
      const titlePart = title ? ` "${title.replace(/"/g, '\\"')}"` : "";
      return src ? `![${alt}](${src}${titlePart})` : "";
    },
  });

  return td;
}

export function isLocalImagePath(value: string): boolean {
  return (
    value.startsWith("./") && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(value)
  );
}

export function importNameFor(
  filename: string,
  usedNames: Set<string>,
): string {
  const base = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .replace(/\s+([A-Za-z0-9])/g, (_match, letter: string) =>
      letter.toUpperCase(),
    )
    .replace(/^[A-Z]/, (letter) => letter.toLowerCase());
  const prefix = /^[A-Za-z_]/.test(base) ? base : `image${base}`;
  let name = prefix || "image";
  let i = 2;

  while (usedNames.has(name)) {
    name = `${prefix}${i}`;
    i += 1;
  }

  usedNames.add(name);
  return name;
}

export function imageImport(
  imports: Map<string, string>,
  usedNames: Set<string>,
  imagePath: string,
): string {
  const filename = imagePath.replace(/^\.\//, "");
  const existing = imports.get(filename);
  if (existing) return existing;

  const name = importNameFor(filename, usedNames);
  imports.set(filename, name);
  return name;
}

export function imageComponent(name: string, alt: string): string {
  return `<Image src={${name}} alt=${JSON.stringify(alt)} />`;
}

export function convertLocalImages(markdown: string): MarkdownContent {
  const imports = new Map<string, string>();
  const usedNames = new Set<string>();
  const placeholders = new Map<string, string>();
  let placeholderIndex = 0;

  const linkedImageRe =
    /\[!\[([^\]]*)\]\((\.\/[^\s)]+)(?:\s+"[^"]*")?\)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
  let body = markdown.replace(
    linkedImageRe,
    (
      match,
      alt: string,
      imagePath: string,
      linkPath: string,
      title: string,
    ) => {
      if (!isLocalImagePath(imagePath)) {
        const token = `@@WP_LINKED_IMAGE_${placeholderIndex}@@`;
        placeholderIndex += 1;
        placeholders.set(token, match);
        return token;
      }

      if (isLocalImagePath(linkPath)) {
        const name = imageImport(imports, usedNames, linkPath);
        return imageComponent(name, title || alt);
      }

      if (extname(linkPath).toLowerCase() === ".zip") {
        const token = `@@WP_LINKED_IMAGE_${placeholderIndex}@@`;
        placeholderIndex += 1;
        placeholders.set(token, match);
        return token;
      }

      const name = imageImport(imports, usedNames, imagePath);
      return imageComponent(name, alt);
    },
  );

  const imageRe = /!\[([^\]]*)\]\((\.\/[^\s)]+)(?:\s+"[^"]*")?\)/g;
  body = body.replace(imageRe, (match, alt: string, imagePath: string) => {
    if (!isLocalImagePath(imagePath)) return match;
    const name = imageImport(imports, usedNames, imagePath);
    return imageComponent(name, alt);
  });

  for (const [token, original] of placeholders) {
    body = body.replaceAll(token, original);
  }

  return { body, imports };
}

export function mdxImportBlock(imports: Map<string, string>): string {
  if (imports.size === 0) return "";

  const lines = ['import { Image } from "@mdx/index";'];
  for (const [filename, name] of imports) {
    lines.push(`import ${name} from "./${filename}";`);
  }

  return `${lines.join("\n")}\n\n`;
}

export function normalizeOrderedLists(markdown: string): string {
  const lines = markdown.split("\n");
  let counter = 1;
  let inList = false;

  return lines
    .map((line) => {
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      if (match) {
        const result = `${counter}. ${match[2]}`;
        counter += 1;
        inList = true;
        return result;
      }

      if (!line.trim()) {
        counter = 1;
        inList = false;
        return line;
      }

      if (!line.startsWith(" ") && !line.startsWith("\t")) {
        counter = 1;
        inList = false;
      } else if (!inList) {
        counter = 1;
      }

      return line;
    })
    .join("\n");
}

export function wrapWords(text: string, width = 80): string[] {
  const lines: string[] = [];
  let current = "";

  for (const word of text.trim().split(/\s+/)) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length > width) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

export function listMarker(line: string): string | undefined {
  return line.match(/^(\s*(?:[-*+]|\d+\.)\s+)\S/)?.[1];
}

export function isStandaloneBlockLine(line: string): boolean {
  const trimmed = line.trim();

  return (
    !trimmed ||
    trimmed.startsWith("<") ||
    trimmed.startsWith("|") ||
    trimmed.startsWith("![") ||
    trimmed.startsWith("[![") ||
    /^-{3,}$/.test(trimmed) ||
    /^import\s/.test(trimmed)
  );
}

export function wrapListItem(line: string, marker: string): string[] {
  const content = line.slice(marker.length).trim();
  const firstWidth = 80 - marker.length;
  const wrapped = wrapWords(content, Math.max(firstWidth, 20));
  const continuation = " ".repeat(marker.length);

  return wrapped.map((part, index) =>
    index === 0 ? `${marker}${part}` : `${continuation}${part}`,
  );
}

export function wrapHeading(line: string): string[] {
  const match = line.match(/^(#{1,6})\s+(.+)$/);
  if (!match || line.length <= 80) return [line];

  const [, hashes, text] = match;
  const step = text.match(/^(Step \d+):\s+(.+)$/);
  if (step) {
    return [`${hashes} ${step[1]}`, "", ...wrapWords(step[2])];
  }

  return wrapWords(text, 80 - hashes.length - 1).map((part, index) =>
    index === 0 ? `${hashes} ${part}` : part,
  );
}

export function wrapMarkdownProse(markdown: string): string {
  const lines = markdown.split("\n");
  const result: string[] = [];
  let paragraph: string[] = [];
  let inCode = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    result.push(...wrapWords(paragraph.join(" ")));
    paragraph = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      result.push(line);
      inCode = !inCode;
      continue;
    }

    if (inCode) {
      result.push(line);
      continue;
    }

    if (line.startsWith("#")) {
      flushParagraph();
      result.push(...wrapHeading(line));
      continue;
    }

    const marker = listMarker(line);
    if (marker) {
      flushParagraph();
      result.push(...wrapListItem(line, marker));
      continue;
    }

    if (isStandaloneBlockLine(line)) {
      flushParagraph();
      result.push(line);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  return result.join("\n");
}

export function normalizeListSpacing(markdown: string): string {
  return markdown.replace(
    /^(\s*(?:[-*+]|\d+\.)\s+.+)\n\n(?=\s*(?:[-*+]|\d+\.)\s+)/gm,
    "$1\n",
  );
}

export function normalizeMarkdown(markdown: string): string {
  const result = normalizeOrderedLists(markdown)
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/(^|\n)#(?=\S)/g, "$1\\#")
    .replace(/(^|[\s(])#([A-Za-z][\w-]*)/g, "$1\\#$2")
    .replace(
      /^\s*\*\*((?:Overview\.?|Step \d+: .+|Download:?))\*\*\s*$/gm,
      (_match, heading: string) => `## ${heading.replace(/[.:]+$/, "")}`,
    )
    .replace(/^\s*\*\*((?:The Fix|The Cause))\*\*\s+/gm, "## $1\n\n")
    .replace(/^\\##\s*\n\n(\[Download\b[^\n]+)$/gim, "## $1")
    .replace(/^\\##\s+(\[Download\b[^\n]+)$/gim, "## $1")
    .replace(/\[here\]\(/g, "[the linked page](")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalizeListSpacing(wrapMarkdownProse(result)).replace(
    /^\\##\s*\n\n(\[Download\b[^\n]+)$/gim,
    "## $1",
  );
}

export function summarizeDescription(text: string): string {
  const plain = text
    .replace(/\[!\[[^\]]*]\([^)]+\)]\([^)]+\)/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= 160) return plain;
  return `${plain.slice(0, 157).trim()}...`;
}

export function plainDescription(markdown: string, title: string): string {
  let inCode = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return "";
    const result = summarizeDescription(paragraph.join(" "));
    paragraph = [];
    return result;
  };

  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      const result = flushParagraph();
      if (result) return result;
      inCode = !inCode;
      continue;
    }

    if (
      inCode ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("![") ||
      trimmed.startsWith("- ") ||
      /^\d+\.\s/.test(trimmed)
    ) {
      const result = flushParagraph();
      if (result) return result;
      continue;
    }

    if (!trimmed) {
      const result = flushParagraph();
      if (result) return result;
      continue;
    }

    paragraph.push(trimmed);
  }

  return flushParagraph() || title;
}

export function frontmatter(post: ImportPost, description: string): string {
  const tags = postTags(post);
  const lines = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `description: ${JSON.stringify(description)}`,
    `date: ${dateOnly(post.post_date)}`,
  ];

  const modified = dateOnly(post.post_modified);
  if (modified !== dateOnly(post.post_date)) {
    lines.push(`updatedDate: ${modified}`);
  }

  if (tags.length > 0) {
    lines.push(`tags: [${tags.map((tag) => JSON.stringify(tag)).join(", ")}]`);
  }

  lines.push("---");
  return lines.join("\n");
}

function existingBlogDirs(): Set<string> {
  return new Set(
    readdirSync(BLOG_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name),
  );
}

function main(): void {
  const force = process.argv.includes("--force");
  const posts = loadPosts();
  const assets = loadAssets();
  const td = createTurndown();
  const existingDirs = existingBlogDirs();
  let written = 0;
  let skipped = 0;

  for (const post of posts) {
    const dirName = datedSlug(post);
    const postDir = join(BLOG_DIR, dirName);
    const markdownPath = join(postDir, "index.md");
    const mdxPath = join(postDir, "index.mdx");

    if (
      !force &&
      (existingDirs.has(dirName) ||
        existsSync(markdownPath) ||
        existsSync(mdxPath))
    ) {
      console.log(`Skipping existing post: ${dirName}`);
      skipped += 1;
      continue;
    }

    const postAssets = assets.get(post.old_id) ?? [];
    const names = assetNameMap(postAssets);
    const html = sanitizeHtml(
      wpAutop(rewriteUploadUrls(post.content_html, names)),
    );
    const markdown = normalizeMarkdown(td.turndown(html));
    const description = plainDescription(markdown, post.title);
    const converted = convertLocalImages(markdown);
    const extension = converted.imports.size > 0 ? "mdx" : "md";
    const filePath = join(postDir, `index.${extension}`);
    const oldFilePath = join(
      postDir,
      extension === "mdx" ? "index.md" : "index.mdx",
    );
    const content =
      `${frontmatter(post, description)}\n\n` +
      mdxImportBlock(converted.imports) +
      `${converted.body}\n`;

    mkdirSync(postDir, { recursive: true });
    if (existsSync(oldFilePath)) {
      unlinkSync(oldFilePath);
    }
    copyAssets(postDir, postAssets, names);
    writeFileSync(filePath, content, "utf-8");
    written += 1;
    console.log(`Wrote ${dirName}`);
  }

  const maliciousPath = join(ROOT_DIR, "tmp", "uploads", "2009", "09");
  if (existsSync(join(maliciousPath, "827051.php"))) {
    const preview = readFileSync(join(maliciousPath, "827051.php"), "utf-8")
      .slice(0, 80)
      .replace(/\s+/g, " ");
    console.log(`Skipped dangerous upload 2009/09/827051.php: ${preview}`);
  }

  console.log(`Done. Wrote ${written} posts, skipped ${skipped}.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
