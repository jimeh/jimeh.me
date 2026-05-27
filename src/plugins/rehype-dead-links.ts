import { icons as fa6SolidIcons } from "@iconify-json/fa6-solid";

const DEAD_LINK_PATTERN = /^dead\+([a-z][a-z0-9+.-]*:\/\/.+)$/i;
const DEFAULT_REASON = "This link is dead and no longer works.";
const DEAD_LINK_ICON = "link-slash";

const DEAD_LINK_CLASS =
  "text-accent hover:decoration-accent focus-visible:decoration-accent " +
  "focus-visible:outline-accent cursor-help underline decoration-transparent " +
  "underline-offset-2 transition-colors focus-visible:rounded-sm " +
  "focus-visible:outline-2 focus-visible:outline-offset-2";
const TOOLTIP_CLASS =
  "bg-on-surface text-surface pointer-events-none absolute bottom-full " +
  "left-1/2 z-20 mb-2 w-max max-w-[min(22rem,calc(100vw-2rem))] " +
  "-translate-x-1/2 rounded-md px-2 py-1 text-center text-xs leading-snug " +
  "font-medium whitespace-normal opacity-0 shadow-sm transition-opacity " +
  "duration-200 group-focus-within:opacity-100 group-hover:opacity-100";

interface HastNode {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
}

interface VFileLike {
  path?: string;
  history?: string[];
}

/**
 * Converts Markdown links with a dead+ URL scheme into inert dead-link markup.
 *
 * Example: [old site](dead+https://example.com/ "Gone")
 */
export function rehypeDeadLinks() {
  return (tree: HastNode, file: VFileLike) => {
    let count = 0;
    const fileId = deadLinkFileId(file);

    visitElements(tree, (node) => {
      if (node.tagName !== "a") return;

      const href = String(node.properties?.href ?? "");
      const match = href.match(DEAD_LINK_PATTERN);
      if (!match) return;

      const originalHref = match[1] ?? "";
      const reason =
        typeof node.properties?.title === "string" && node.properties.title
          ? node.properties.title
          : DEFAULT_REASON;
      const descriptionId = `dead-link-${fileId}-${++count}`;
      const children =
        textContent(node.children) === href
          ? [{ type: "text", value: originalHref }]
          : node.children;
      const linkChildren = [...(children ?? []), deadLinkIcon()];

      node.tagName = "span";
      node.properties = {
        className: ["group", "relative", "inline-block"],
      };
      node.children = [
        {
          type: "element",
          tagName: "span",
          properties: {
            role: "link",
            ariaDisabled: "true",
            ariaDescribedBy: descriptionId,
            tabIndex: 0,
            className: DEAD_LINK_CLASS.split(" "),
            dataDeadLinkHref: originalHref,
          },
          children: linkChildren,
        },
        {
          type: "element",
          tagName: "span",
          properties: {
            id: descriptionId,
            role: "tooltip",
            className: TOOLTIP_CLASS.split(" "),
          },
          children: [{ type: "text", value: reason }],
        },
      ];
    });
  };
}

function deadLinkIcon(): HastNode {
  const icon = fa6SolidIcons.icons[DEAD_LINK_ICON];

  if (!icon) {
    throw new Error(`Unable to locate fa6-solid:${DEAD_LINK_ICON}`);
  }

  const width = icon.width ?? 640;
  const height = icon.height ?? 512;

  return {
    type: "element",
    tagName: "svg",
    properties: {
      ariaHidden: "true",
      className: ["dead-link-icon"],
      dataDeadLinkIcon: "",
      dataIcon: `fa6-solid:${DEAD_LINK_ICON}`,
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

function deadLinkFileId(file: VFileLike) {
  const value = file.path || file.history?.[0] || "content";

  return hashString(value).toString(36);
}

function hashString(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index++) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return hash >>> 0;
}

function textContent(children: HastNode[] | undefined): string {
  if (!Array.isArray(children)) return "";

  return children.map((child) => childTextContent(child)).join("");
}

function childTextContent(node: HastNode | undefined): string {
  if (node?.type === "text") return node.value ?? "";

  return textContent(node?.children);
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
