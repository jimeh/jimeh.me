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

  return id ? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}` : src;
}

function extractVideoId(src: string): string | null {
  try {
    const url = new URL(src);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (hostname !== "youtube.com" && !hostname.endsWith(".youtube.com")) {
      return null;
    }

    const v = url.searchParams.get("v");
    if (v) return v;

    const match = url.pathname.match(/^\/(?:embed|shorts|v)\/([^/?&]+)/);
    if (match?.[1]) return match[1];

    return null;
  } catch {
    // Treat non-URL values as bare YouTube video IDs.
    return src;
  }
}
