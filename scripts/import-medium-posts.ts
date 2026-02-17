/**
 * Import blog posts from a Medium RSS feed into Astro content
 * collection markdown files.
 *
 * Uses the RSS feed for metadata (title, dates, tags) and scrapes
 * the actual article pages for content (preserves inline code, etc).
 *
 * Usage:
 *   npx tsx scripts/import-medium-posts.ts [--force]
 *
 * Options:
 *   --force  Overwrite existing files (default: skip)
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { XMLParser } from "fast-xml-parser";
import { parseHTML } from "linkedom";
import TurndownService from "turndown";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FEED_URL = "https://jimeh.io/feed";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const BLOG_DIR = join(__dirname, "..", "src", "content", "blog");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeedItem {
  title: string;
  link: string;
  guid: { "#text": string } | string;
  category?: string | string[];
  "dc:creator": string;
  pubDate: string;
  "atom:updated": string;
  "content:encoded": string;
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

function curlFetch(url: string): string {
  try {
    return execSync(`curl -sL '${url}'`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err) {
    throw new Error(`Failed to fetch ${url}: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// RSS parsing (metadata only)
// ---------------------------------------------------------------------------

function parseItems(xml: string): FeedItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    processEntities: true,
    ignorePiTags: true,
  });
  const feed = parser.parse(xml);
  const items = feed.rss.channel.item;
  return Array.isArray(items) ? items : [items];
}

// ---------------------------------------------------------------------------
// Article page scraping
// ---------------------------------------------------------------------------

interface ScrapedContent {
  html: string;
  subtitle: string | null;
  originalDate: string | null;
}

/**
 * Scrape the actual Medium article page to extract rich content HTML
 * that preserves inline <code> tags and other formatting stripped
 * from the RSS feed.
 */
function scrapeArticle(url: string): ScrapedContent {
  // Strip RSS tracking params from the URL.
  const cleanUrl = url.replace(/\?source=.*$/, "");
  const pageHtml = curlFetch(cleanUrl);
  const { document } = parseHTML(pageHtml);

  const section = document.querySelector("article section");
  if (!section) {
    throw new Error(`No article section found at ${cleanUrl}`);
  }

  // Extract subtitle from pw-subtitle-paragraph.
  let subtitle: string | null = null;
  const subtitleEl = section.querySelector('[class*="pw-subtitle-paragraph"]');
  if (subtitleEl) {
    subtitle = (subtitleEl.textContent || "").trim();
  }

  // Detect "Originally published at ..." paragraph and extract
  // the original publication date from it.
  let originalDate: string | null = null;
  const allParagraphs = section.querySelectorAll("p[id]");
  const origPubIds = new Set<string>();
  for (const p of Array.from(allParagraphs)) {
    const text = (p.textContent || "").trim();
    if (/^Originally published at\b/i.test(text)) {
      // Extract date like "February 26, 2010" or "June 15, 2010".
      const dateMatch = text.match(/on (\w+ \d{1,2}, \d{4})/);
      if (dateMatch) {
        const parsed = new Date(dateMatch[1]);
        if (!isNaN(parsed.getTime())) {
          originalDate = formatDate(dateMatch[1]);
          console.log(`  Found original date: ${originalDate}`);
        }
      }
      // Mark this paragraph for exclusion.
      const id = p.getAttribute("id");
      if (id) origPubIds.add(id);
    }
  }

  // Collect all content elements in DOM order using a
  // comprehensive selector. Medium uses `id` on paragraphs and
  // headings, but not on pre/figure/list elements.
  const contentParts: string[] = [];
  const selector = [
    "h2[id]",
    "h3[id]",
    "h4[id]",
    "p[id]",
    "pre",
    "figure",
    "ul",
    "ol",
    "blockquote",
  ].join(", ");

  const candidates = section.querySelectorAll(selector);
  for (const el of Array.from(candidates)) {
    const tag = el.tagName.toLowerCase();
    const cls = el.className || "";

    // Skip subtitle — it goes in frontmatter.
    if (cls.includes("pw-subtitle-paragraph")) continue;

    // Skip "Originally published at ..." paragraph.
    const id = el.getAttribute("id");
    if (id && origPubIds.has(id)) continue;

    // Skip <p> elements nested inside a <blockquote> — the
    // blockquote itself is already captured.
    if (tag === "p" && el.parentElement?.closest("blockquote")) {
      continue;
    }

    if (tag === "figure") {
      const html = buildFigureHtml(el);
      if (html) contentParts.push(html);
      continue;
    }

    contentParts.push(el.outerHTML);
  }

  return {
    html: contentParts.join("\n"),
    subtitle,
    originalDate,
  };
}

/**
 * Build clean figure HTML from Medium's complex figure markup.
 * Medium uses <picture><source srcSet="..."> with responsive URLs
 * and lazy-loaded images. We extract the best image URL and the
 * figcaption text.
 */
function buildFigureHtml(figure: Element): string {
  // Try to get image URL from <source srcSet> or <img src>.
  let imgSrc = "";
  const source = figure.querySelector("source");
  if (source) {
    const srcSet =
      source.getAttribute("srcSet") || source.getAttribute("srcset") || "";
    // Pick the largest image from srcSet (last entry).
    const entries = srcSet
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (entries.length > 0) {
      const last = entries[entries.length - 1];
      imgSrc = last.split(/\s+/)[0];
    }
  }

  if (!imgSrc) {
    const img = figure.querySelector("img[src]");
    if (img) {
      imgSrc = img.getAttribute("src") || "";
    }
  }

  if (!imgSrc) return "";

  const figcaption = figure.querySelector("figcaption");
  const captionHtml = figcaption ? figcaption.innerHTML : "";

  if (captionHtml) {
    return `<figure><img src="${imgSrc}" alt="" /><figcaption>${captionHtml}</figcaption></figure>`;
  }
  return `<figure><img src="${imgSrc}" alt="" /></figure>`;
}

// ---------------------------------------------------------------------------
// Slug derivation
// ---------------------------------------------------------------------------

function deriveSlug(link: string, guid: string): string {
  const url = new URL(link);
  let slug = url.pathname.replace(/^\//, "");

  const guidUrl = new URL(guid);
  const hash = guidUrl.pathname.split("/").pop();
  if (hash && slug.endsWith(`-${hash}`)) {
    slug = slug.slice(0, -(hash.length + 1));
  }

  return slug;
}

// ---------------------------------------------------------------------------
// HTML entity decoding (for <pre> blocks)
// ---------------------------------------------------------------------------

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

// ---------------------------------------------------------------------------
// Code block dedenting
// ---------------------------------------------------------------------------

/**
 * Remove common leading whitespace from all lines of a code block.
 */
function dedentCode(code: string): string {
  const lines = code.split("\n");
  // Find minimum indentation of non-empty lines.
  let minIndent = Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
    if (indent < minIndent) minIndent = indent;
  }
  if (minIndent === 0 || minIndent === Infinity) return code;
  return lines.map((l) => (l.trim() ? l.slice(minIndent) : l)).join("\n");
}

// ---------------------------------------------------------------------------
// Code language detection
// ---------------------------------------------------------------------------

function detectCodeLanguage(code: string): string {
  const trimmed = code.trim();

  // JSON: starts with { or [ and looks like valid JSON structure.
  if (/^\s*[[{]/.test(trimmed) && /"[\w]+"\s*:/.test(trimmed)) {
    return "json";
  }

  // XML/HTML: starts with < and contains tag-like patterns.
  if (/^\s*<[\w!?/]/.test(trimmed)) {
    return "xml";
  }

  // Shell: common shell command patterns.
  if (
    /^\s*(\$\s|#\s|sudo\s)/.test(trimmed) ||
    /^\s*(npm|pnpm|yarn|brew|apt|pip|cargo|go|xcrun|curl|wget|git|cd|mkdir|chmod|make)\s/.test(
      trimmed,
    )
  ) {
    return "sh";
  }

  return "";
}

// ---------------------------------------------------------------------------
// Turndown setup
// ---------------------------------------------------------------------------

function createTurndown(): TurndownService {
  const td = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "```",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });

  // Medium pages use h2 for main section headings, and h3/h4 for
  // sub-headings in some older posts. Map them all to ## / ###.
  td.addRule("headings", {
    filter: ["h2", "h3", "h4"],
    replacement(_content, node) {
      const level = Number(node.nodeName.charAt(1));
      const hashes = "#".repeat(level);
      const text = (node.textContent || "").trim();
      return `\n\n${hashes} ${text}\n\n`;
    },
  });

  // Convert <figure> to markdown image.
  td.addRule("figure", {
    filter: "figure",
    replacement(_content, node) {
      const img = (node as HTMLElement).querySelector("img");
      if (!img) return "";

      const src = img.getAttribute("src") || "";
      const figcaption = (node as HTMLElement).querySelector("figcaption");

      if (figcaption) {
        const captionMd = td.turndown(figcaption.innerHTML).trim();
        const hasLinks = captionMd.includes("](");
        if (hasLinks) {
          const alt = img.getAttribute("alt") || "";
          return `\n\n![${alt}](${src})\n\n*${captionMd}*\n\n`;
        }
        return `\n\n![${captionMd}](${src})\n\n`;
      }

      const alt = img.getAttribute("alt") || "";
      return `\n\n![${alt}](${src})\n\n`;
    },
  });

  // Convert <pre> blocks. Medium uses <br> for newlines inside them,
  // and may inject a CTA widget div before the code <span>.
  td.addRule("preformatted", {
    filter: "pre",
    replacement(_content, node) {
      const el = node as HTMLElement;
      // Medium puts actual code in a <span> with an id. Use that
      // if available, otherwise fall back to full innerHTML.
      const codeSpan = el.querySelector("span[id]");
      let code = (codeSpan || el).innerHTML || "";
      code = code.replace(/<br\s*\/?>/gi, "\n");
      code = code.replace(/<[^>]+>/g, "");
      code = decodeHtmlEntities(code);
      code = dedentCode(code);
      const lang = detectCodeLanguage(code);
      return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    },
  });

  // Filter out 1x1 tracking pixels.
  td.addRule("removeTrackingPixel", {
    filter(node) {
      return (
        node.nodeName === "IMG" &&
        (node.getAttribute("width") === "1" ||
          node.getAttribute("height") === "1")
      );
    },
    replacement() {
      return "";
    },
  });

  // Strip URL scheme from link text when it matches the href.
  // Medium renders bare URLs as <a href="https://...">https://...</a>,
  // but the display text should omit the scheme.
  td.addRule("cleanUrlLinks", {
    filter(node) {
      if (node.nodeName !== "A") return false;
      const href = node.getAttribute("href") || "";
      const text = (node.textContent || "").trim();
      return /^https?:\/\//.test(text) && text === href;
    },
    replacement(_content, node) {
      const href = node.getAttribute("href") || "";
      const text = (node.textContent || "").trim().replace(/^https?:\/\//, "");
      return `[${text}](${href})`;
    },
  });

  // Strip Medium's class-heavy anchor wrappers — keep only
  // semantically meaningful links (those with href).
  td.addRule("cleanLinks", {
    filter(node) {
      return node.nodeName === "A" && !node.getAttribute("href");
    },
    replacement(content) {
      return content;
    },
  });

  return td;
}

// ---------------------------------------------------------------------------
// Post-process markdown
// ---------------------------------------------------------------------------

/**
 * Clean up common artifacts from the conversion.
 */
/**
 * Replace smart/curly quotes with straight ASCII equivalents.
 */
function normalizeQuotes(text: string): string {
  return text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
}

function postProcessMarkdown(md: string): string {
  let result = md;

  result = normalizeQuotes(result);

  // Collapse triple+ blank lines to double.
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
}

// ---------------------------------------------------------------------------
// Fallback description extraction
// ---------------------------------------------------------------------------

function extractFallbackDescription(markdown: string, title: string): string {
  const lines = markdown.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("![") ||
      trimmed.startsWith("---") ||
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ") ||
      trimmed.startsWith("> ")
    ) {
      continue;
    }

    const plain = trimmed
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "");

    const sentenceEnd = plain.search(/[.!?]\s/);
    if (sentenceEnd > 0 && sentenceEnd < 160) {
      return plain.slice(0, sentenceEnd + 1);
    }
    if (plain.length > 160) {
      return plain.slice(0, 157) + "...";
    }
    return plain;
  }

  return title;
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getUpdatedDate(pubDate: string, atomUpdated: string): string | null {
  const pub = formatDate(pubDate);
  const updated = formatDate(atomUpdated);
  return updated !== pub ? updated : null;
}

// ---------------------------------------------------------------------------
// Tags extraction
// ---------------------------------------------------------------------------

function extractTags(category: string | string[] | undefined): string[] {
  if (!category) return [];
  if (Array.isArray(category)) return category;
  return [category];
}

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

function buildFrontmatter(meta: {
  title: string;
  description: string;
  date: string;
  updatedDate: string | null;
  tags: string[];
}): string {
  const lines = ["---"];
  lines.push(`title: ${JSON.stringify(meta.title)}`);
  lines.push(`description: ${JSON.stringify(meta.description)}`);
  lines.push(`date: ${meta.date}`);
  if (meta.updatedDate) {
    lines.push(`updatedDate: ${meta.updatedDate}`);
  }
  if (meta.tags.length > 0) {
    const tagList = meta.tags.map((t) => JSON.stringify(t)).join(", ");
    lines.push(`tags: [${tagList}]`);
  }
  lines.push("---");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// File writing
// ---------------------------------------------------------------------------

function writePost(slug: string, content: string, force: boolean): boolean {
  const filePath = join(BLOG_DIR, `${slug}.md`);

  if (existsSync(filePath) && !force) {
    console.log(`  Skipping (exists): ${slug}.md`);
    return false;
  }

  mkdirSync(BLOG_DIR, { recursive: true });
  writeFileSync(filePath, content, "utf-8");
  console.log(`  Written: ${slug}.md`);
  return true;
}

// ---------------------------------------------------------------------------
// Guid extraction helper
// ---------------------------------------------------------------------------

function getGuidText(guid: { "#text": string } | string): string {
  if (typeof guid === "string") return guid;
  return guid["#text"];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const force = process.argv.includes("--force");

  console.log("Fetching RSS feed from jimeh.io...");
  const xml = curlFetch(FEED_URL);

  console.log("Parsing feed...");
  const items = parseItems(xml);
  console.log(`Found ${items.length} posts.\n`);

  const td = createTurndown();
  let written = 0;
  let skipped = 0;

  for (const item of items) {
    let title = String(item.title);
    console.log(`Processing: ${title}`);

    const guidText = getGuidText(item.guid);
    let slug = deriveSlug(item.link, guidText);

    const tags = extractTags(item.category);

    // Scrape the actual article page for rich content.
    console.log("  Fetching article page...");
    const {
      html: contentHtml,
      subtitle,
      originalDate,
    } = scrapeArticle(item.link);

    // Prefer original publication date from "Originally published
    // at ..." over the Medium repost date from the RSS feed.
    const date = originalDate || formatDate(item.pubDate);
    const updatedDate = originalDate
      ? null
      : getUpdatedDate(item.pubDate, item["atom:updated"]);

    // Strip year suffix from title and slug for re-posted articles
    // where we extracted the original date. E.g. "How Are You?
    // (2010)" → "How Are You?" and "how-are-you-2010" →
    // "how-are-you".
    if (originalDate) {
      const year = originalDate.slice(0, 4);
      title = title.replace(new RegExp(`\\s*\\(${year}\\)\\s*$`), "");
      slug = slug.replace(new RegExp(`-${year}$`), "");
    }

    // Prefix filename with date for chronological sorting.
    const filename = `${date}-${slug}`;

    // Skip early if file exists and not forcing.
    if (existsSync(join(BLOG_DIR, `${filename}.md`)) && !force) {
      console.log(`  Skipping (exists): ${filename}.md`);
      skipped++;
      continue;
    }

    const markdown = postProcessMarkdown(td.turndown(contentHtml));
    title = normalizeQuotes(title);
    const description = normalizeQuotes(
      subtitle || extractFallbackDescription(markdown, title),
    );

    const frontmatter = buildFrontmatter({
      title,
      description,
      date,
      updatedDate,
      tags,
    });

    const fullContent = `${frontmatter}\n\n${markdown}\n`;

    if (writePost(filename, fullContent, force)) {
      written++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone! Wrote ${written} posts, skipped ${skipped}.`);
  if (written > 0) {
    console.log("\nTip: Run `pnpm format` to apply Prettier formatting.");
  }
}

main();
