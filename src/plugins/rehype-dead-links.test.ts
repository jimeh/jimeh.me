import assert from "node:assert/strict";
import test from "node:test";

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

  assert.equal(wrapper.tagName, "span");
  assert.deepEqual(wrapperProperties.className, [
    "group",
    "relative",
    "inline-block",
  ]);
  assert.equal(deadLink.tagName, "span");
  assert.equal(deadLinkProperties.role, "link");
  assert.equal(deadLinkProperties.ariaDisabled, "true");
  assert.equal(deadLinkProperties.tabIndex, 0);
  assert.equal(
    deadLinkProperties.dataDeadLinkHref,
    "https://example.com/old-page",
  );
  assert.deepEqual(deadLink.children, [text("old page")]);
  assert.equal(tooltip.tagName, "span");
  assert.equal(tooltipProperties.role, "tooltip");
  assert.equal(deadLinkProperties.ariaDescribedBy, tooltipProperties.id);
  assert.deepEqual(tooltip.children, [text("Archived elsewhere.")]);
});

test("strips dead+ from autolink text that falls back to href", () => {
  const href = "dead+http://zhuoqe.org/svn/adiumlogs/trunk/";
  const tree = root([link(href, [text(href)])]);

  transform(tree);

  const deadLink = childAt(childAt(tree, 0), 0);
  const deadLinkProperties = propertiesOf(deadLink);

  assert.equal(
    deadLinkProperties.dataDeadLinkHref,
    "http://zhuoqe.org/svn/adiumlogs/trunk/",
  );
  assert.deepEqual(deadLink.children, [
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

  assert.deepEqual(deadLink.children, [text("Adium logs repository")]);
});

test("uses the default tooltip reason when no title is present", () => {
  const tree = root([
    link("dead+custom://example/resource", [text("resource")]),
  ]);

  transform(tree);

  const tooltip = childAt(childAt(tree, 0), 1);

  assert.deepEqual(tooltip.children, [text(DEFAULT_REASON)]);
});

test("ignores non-dead links and dead+ values without a URL scheme", () => {
  const regular = link("https://example.com/", [text("live")]);
  const invalidDead = link("dead+/not-a-url", [text("invalid")]);
  const tree = root([regular, invalidDead]);

  transform(tree);

  assert.equal(childAt(tree, 0), regular);
  assert.equal(childAt(tree, 1), invalidDead);
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

  assert.ok(child);

  return child;
}

function propertiesOf(node: TestNode): Record<string, unknown> {
  assert.ok(node.properties);

  return node.properties;
}
