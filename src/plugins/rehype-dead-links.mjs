const DEAD_LINK_PATTERN = /^dead\+([a-z][a-z0-9+.-]*:\/\/.+)$/i;
const DEFAULT_REASON = "This link is dead and no longer works.";

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

/**
 * Converts Markdown links with a dead+ URL scheme into inert dead-link markup.
 *
 * Example: [old site](dead+https://example.com/ "Gone")
 */
export function rehypeDeadLinks() {
  return (tree, file) => {
    let count = 0;
    const fileId = deadLinkFileId(file);

    visitElements(tree, (node) => {
      if (node.tagName !== "a") return;

      const href = String(node.properties?.href ?? "");
      const match = href.match(DEAD_LINK_PATTERN);
      if (!match) return;

      const originalHref = match[1];
      const reason =
        typeof node.properties?.title === "string" && node.properties.title
          ? node.properties.title
          : DEFAULT_REASON;
      const descriptionId = `dead-link-${fileId}-${++count}`;
      const children =
        textContent(node.children) === href
          ? [{ type: "text", value: originalHref }]
          : node.children;

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
          children,
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

function deadLinkFileId(file) {
  const value = file.path || file.history?.[0] || "content";

  return hashString(value).toString(36);
}

function hashString(value) {
  let hash = 5381;

  for (let index = 0; index < value.length; index++) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return hash >>> 0;
}

function textContent(children) {
  if (!Array.isArray(children)) return "";

  return children.map((child) => childTextContent(child)).join("");
}

function childTextContent(node) {
  if (node?.type === "text") return node.value;

  return textContent(node?.children);
}

function visitElements(node, callback) {
  if (node?.type === "element") {
    callback(node);
  }

  if (!Array.isArray(node?.children)) return;

  for (const child of node.children) {
    visitElements(child, callback);
  }
}
