import { expect, test } from "vitest";

import { rehypeDeadLinks } from "./rehype-dead-links";

const DEFAULT_REASON = "This link is dead and no longer works.";

interface TestNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: TestNode[];
  value?: string;
}

test("converts dead+ links into inert dead-link markup", () => {
  const tree = root([
    link("dead+https://example.com/old-page", [text("old page")], {
      title: "Archived elsewhere.",
    }),
  ]);

  transform(tree);

  const wrapper = childAt(tree, 0);
  const deadLink = childAt(wrapper, 0);
  const tooltip = childAt(wrapper, 1);
  const wrapperProperties = propertiesOf(wrapper);
  const deadLinkProperties = propertiesOf(deadLink);
  const tooltipProperties = propertiesOf(tooltip);

  expect(wrapper.tagName).toBe("span");
  expect(wrapperProperties.className).toEqual([
    "group",
    "relative",
    "inline-block",
  ]);
  expect(deadLink.tagName).toBe("span");
  expect(deadLinkProperties.role).toBe("link");
  expect(deadLinkProperties.ariaDisabled).toBe("true");
  expect(deadLinkProperties.tabIndex).toBe(0);
  expect(deadLinkProperties.dataDeadLinkHref).toBe(
    "https://example.com/old-page",
  );
  expect(deadLink.children).toEqual([text("old page")]);
  expect(tooltip.tagName).toBe("span");
  expect(tooltipProperties.role).toBe("tooltip");
  expect(deadLinkProperties.ariaDescribedBy).toBe(tooltipProperties.id);
  expect(tooltip.children).toEqual([text("Archived elsewhere.")]);
});

test("strips dead+ from autolink text that falls back to href", () => {
  const href = "dead+http://zhuoqe.org/svn/adiumlogs/trunk/";
  const tree = root([link(href, [text(href)])]);

  transform(tree);

  const deadLink = childAt(childAt(tree, 0), 0);
  const deadLinkProperties = propertiesOf(deadLink);

  expect(deadLinkProperties.dataDeadLinkHref).toBe(
    "http://zhuoqe.org/svn/adiumlogs/trunk/",
  );
  expect(deadLink.children).toEqual([
    text("http://zhuoqe.org/svn/adiumlogs/trunk/"),
  ]);
});

test("keeps explicit link text for dead+ links", () => {
  const tree = root([
    link("dead+http://zhuoqe.org/svn/adiumlogs/trunk/", [
      text("Adium logs repository"),
    ]),
  ]);

  transform(tree);

  const deadLink = childAt(childAt(tree, 0), 0);

  expect(deadLink.children).toEqual([text("Adium logs repository")]);
});

test("uses the default tooltip reason when no title is present", () => {
  const tree = root([
    link("dead+custom://example/resource", [text("resource")]),
  ]);

  transform(tree);

  const tooltip = childAt(childAt(tree, 0), 1);

  expect(tooltip.children).toEqual([text(DEFAULT_REASON)]);
});

test("ignores non-dead links and dead+ values without a URL scheme", () => {
  const regular = link("https://example.com/", [text("live")]);
  const invalidDead = link("dead+/not-a-url", [text("invalid")]);
  const tree = root([regular, invalidDead]);

  transform(tree);

  expect(childAt(tree, 0)).toBe(regular);
  expect(childAt(tree, 1)).toBe(invalidDead);
});

function transform(tree: TestNode) {
  rehypeDeadLinks()(tree, { path: "/content/post.mdx" });
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
