import { renderDownloadMarkdown } from "./Download.markdown";
import { renderImageMarkdown } from "./Image.markdown";
import type { MarkdownRenderer } from "./markdown";
import { renderYouTubeMarkdown } from "./YouTube.markdown";

export const mdxMarkdownRenderers: Record<string, MarkdownRenderer> = {
  Download: renderDownloadMarkdown,
  Image: renderImageMarkdown,
  YouTube: renderYouTubeMarkdown,
};

export const mdxMarkdownTransparentComponents = new Set(["ImageGrid"]);
