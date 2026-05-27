import { icons as fa6SolidIcons } from "@iconify-json/fa6-solid";

const EXTERNAL_LINK_ICON = "up-right-from-square";

interface HastNode {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
}

export interface RehypeExternalLinksOptions {
  site?: string;
}

/**
 * Adds a small Astro Icon/Iconify marker to external Markdown links.
 */
export function rehypeExternalLinks(options: RehypeExternalLinksOptions = {}) {
  const siteHost = hostFor(options.site);

  return (tree: HastNode) => {
    visitElements(tree, (node) => {
      if (node.tagName !== "a") return;

      const href = String(node.properties?.href ?? "");
      if (!isExternalHref(href, siteHost)) return;
      if (hasDescendantTag(node, "img")) return;
      if (hasExternalLinkIcon(node)) return;

      node.properties = {
        ...node.properties,
        className: appendClassName(node.properties?.className, "external-link"),
        dataExternalLink: "",
      };
      node.children = [...(node.children ?? []), externalLinkIcon()];
    });
  };
}

function isExternalHref(href: string, siteHost: string | undefined) {
  if (href === "") return false;

  let url: URL;

  try {
    url = new URL(href);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  return siteHost === undefined || url.host !== siteHost;
}

function hostFor(site: string | undefined) {
  if (!site) return undefined;

  try {
    return new URL(site).host;
  } catch {
    return undefined;
  }
}

function appendClassName(value: unknown, className: string) {
  if (Array.isArray(value)) return [...value, className];
  if (typeof value === "string" && value.length > 0) {
    return [...value.split(/\s+/), className];
  }

  return [className];
}

function externalLinkIcon(): HastNode {
  const icon = fa6SolidIcons.icons[EXTERNAL_LINK_ICON];

  if (!icon) {
    throw new Error(`Unable to locate fa6-solid:${EXTERNAL_LINK_ICON}`);
  }

  const width = icon.width ?? 512;
  const height = icon.height ?? 512;

  return {
    type: "element",
    tagName: "svg",
    properties: {
      ariaHidden: "true",
      className: ["external-link-icon"],
      dataExternalLinkIcon: "",
      dataIcon: `fa6-solid:${EXTERNAL_LINK_ICON}`,
      focusable: "false",
      height,
      viewBox: `0 0 ${width} ${height}`,
      width,
    },
    children: iconBodyChildren(icon.body),
  };
}

function iconBodyChildren(body: string): HastNode[] {
  const children: HastNode[] = [];

  for (const match of body.matchAll(/<path\b([^>]*)\/?>/g)) {
    children.push({
      type: "element",
      tagName: "path",
      properties: iconAttributes(match[1] ?? ""),
      children: [],
    });
  }

  return children;
}

function iconAttributes(attributes: string): Record<string, string> {
  const properties: Record<string, string> = {};

  for (const match of attributes.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    const [, name, value] = match;
    if (!name || value === undefined) continue;

    properties[name] = value;
  }

  return properties;
}

function hasExternalLinkIcon(node: HastNode) {
  return (node.children ?? []).some(
    (child) =>
      child.type === "element" &&
      child.properties?.dataExternalLinkIcon !== undefined,
  );
}

function hasDescendantTag(node: HastNode, tagName: string): boolean {
  if (node.type === "element" && node.tagName === tagName) return true;

  return (node.children ?? []).some((child) =>
    hasDescendantTag(child, tagName),
  );
}

function visitElements(
  node: HastNode | undefined,
  callback: (node: HastNode) => void,
) {
  if (node?.type === "element") {
    callback(node);
  }

  if (!Array.isArray(node?.children)) return;

  for (const child of node.children) {
    visitElements(child, callback);
  }
}
