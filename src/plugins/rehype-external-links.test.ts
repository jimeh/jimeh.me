import { expect, test } from "vitest";

import { rehypeExternalLinks } from "./rehype-external-links";

interface TestNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: TestNode[];
  value?: string;
}

test("adds an Astro Icon/Iconify external link icon to external links", () => {
  const tree = root([link("https://example.com/", [text("example")])]);

  transform(tree);

  const anchor = childAt(tree, 0);
  const icon = childAt(anchor, 1);
  const path = childAt(icon, 0);
  const anchorProperties = propertiesOf(anchor);
  const iconProperties = propertiesOf(icon);

  expect(anchorProperties.dataExternalLink).toBe("");
  expect(anchorProperties.className).toEqual(["external-link"]);
  expect(anchor.children?.[0]).toEqual(text("example"));
  expect(icon.tagName).toBe("svg");
  expect(iconProperties.ariaHidden).toBe("true");
  expect(iconProperties.className).toEqual(["external-link-icon"]);
  expect(iconProperties.dataIcon).toBe("fa6-solid:up-right-from-square");
  expect(iconProperties.dataExternalLinkIcon).toBe("");
  expect(path.tagName).toBe("path");
  expect(propertiesOf(path).fill).toBe("currentColor");
});

test("preserves existing link classes", () => {
  const tree = root([
    link("https://example.com/", [text("example")], {
      className: ["text-accent"],
    }),
  ]);

  transform(tree);

  expect(propertiesOf(childAt(tree, 0)).className).toEqual([
    "text-accent",
    "external-link",
  ]);
});

test("ignores same-site absolute links", () => {
  const sameSite = link("https://jimeh.me/blog/", [text("blog")]);
  const tree = root([sameSite]);

  transform(tree);

  expect(childAt(tree, 0)).toBe(sameSite);
});

test("ignores relative, mailto, and dead links", () => {
  const relative = link("/blog/", [text("blog")]);
  const mailto = link("mailto:contact@jimeh.me", [text("email")]);
  const dead = link("dead+https://example.com/", [text("dead")]);
  const tree = root([relative, mailto, dead]);

  transform(tree);

  expect(childAt(tree, 0)).toBe(relative);
  expect(childAt(tree, 1)).toBe(mailto);
  expect(childAt(tree, 2)).toBe(dead);
});

test("ignores image links", () => {
  const imageLink = link("https://example.com/image.jpg", [
    {
      type: "element",
      tagName: "img",
      properties: { src: "/image.jpg", alt: "" },
      children: [],
    },
  ]);
  const tree = root([imageLink]);

  transform(tree);

  expect(childAt(tree, 0)).toBe(imageLink);
});

function transform(tree: TestNode) {
  rehypeExternalLinks({ site: "https://jimeh.me" })(tree);
}

function root(children: TestNode[]): TestNode {
  return {
    type: "root",
    children,
  };
}

function link(
  href: string,
  children: TestNode[],
  properties: Record<string, unknown> = {},
): TestNode {
  return {
    type: "element",
    tagName: "a",
    properties: {
      href,
      ...properties,
    },
    children,
  };
}

function text(value: string): TestNode {
  return {
    type: "text",
    value,
  };
}

function childAt(node: TestNode, index: number): TestNode {
  const child = node.children?.[index];

  expect(child).toBeDefined();

  return child as TestNode;
}

function propertiesOf(node: TestNode): Record<string, unknown> {
  expect(node.properties).toBeDefined();

  return node.properties as Record<string, unknown>;
}
