export type MarkdownPropValue = boolean | number | string | undefined;

export type MarkdownProps = Record<string, MarkdownPropValue>;

export interface MarkdownRenderContext {
  children: string;
}

export type MarkdownRenderer = (
  props: MarkdownProps,
  context: MarkdownRenderContext,
) => string;

export function propString(
  props: MarkdownProps,
  name: string,
): string | undefined {
  const value = props[name];

  return typeof value === "string" ? value : undefined;
}

export function markdownLink(label: string, href: string): string {
  return `[${escapeMarkdownLinkLabel(label)}](${escapeMarkdownUrl(href)})`;
}

export function markdownImage(alt: string, src: string): string {
  return `![${escapeMarkdownLinkLabel(alt)}](${escapeMarkdownUrl(src)})`;
}

function escapeMarkdownLinkLabel(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("]", "\\]");
}

function escapeMarkdownUrl(value: string): string {
  let encoded: string;

  try {
    encoded = encodeURI(value);
  } catch {
    encoded = value.replaceAll(" ", "%20");
  }

  return encoded
    .replaceAll("(", "%28")
    .replaceAll(")", "%29")
    .replaceAll('"', "%22")
    .replaceAll("'", "%27")
    .replaceAll("<", "%3C")
    .replaceAll(">", "%3E");
}
