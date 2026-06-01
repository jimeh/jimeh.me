import { type MarkdownRenderer, markdownLink, propString } from "./markdown";

export const renderYouTubeMarkdown: MarkdownRenderer = (props) => {
  const src = propString(props, "src");
  if (!src) {
    throw new Error("YouTube markdown renderer requires a string src.");
  }

  const title = propString(props, "title") ?? "YouTube video";
  const href = canonicalYouTubeUrl(src);

  return markdownLink(`Video: ${title}`, href);
};

function canonicalYouTubeUrl(src: string): string {
  const id = extractVideoId(src);

  return id ? `https://www.youtube.com/watch?v=${id}` : src;
}

function extractVideoId(src: string): string {
  try {
    const url = new URL(src);
    if (url.hostname === "youtu.be") return url.pathname.slice(1);

    const v = url.searchParams.get("v");
    if (v) return v;

    const match = url.pathname.match(/^\/(?:embed|shorts|v)\/([^/?&]+)/);
    if (match?.[1]) return match[1];
  } catch {
    // Treat non-URL values as bare YouTube video IDs.
  }

  return src;
}
