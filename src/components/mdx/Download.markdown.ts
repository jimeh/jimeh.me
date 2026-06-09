import { type MarkdownRenderer, markdownLink, propString } from "./markdown";

export const renderDownloadMarkdown: MarkdownRenderer = (props, context) => {
  const href = propString(props, "href");
  if (!href) {
    throw new Error("Download markdown renderer requires a string href.");
  }

  const label =
    context.children.trim() ||
    propString(props, "filename") ||
    propString(props, "title") ||
    href;

  return markdownLink(`Download: ${label}`, href);
};
