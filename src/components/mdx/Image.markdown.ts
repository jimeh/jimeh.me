import { type MarkdownRenderer, markdownImage, propString } from "./markdown";

export const renderImageMarkdown: MarkdownRenderer = (props) => {
  const src = propString(props, "src");
  if (!src) {
    throw new Error("Image markdown renderer requires a string src.");
  }

  const caption = propString(props, "caption");
  const alt = propString(props, "alt") ?? caption ?? "";
  const lines = [markdownImage(alt, src)];

  if (caption && caption !== alt) {
    lines.push(`_${caption}_`);
  }

  return lines.join("\n\n");
};
