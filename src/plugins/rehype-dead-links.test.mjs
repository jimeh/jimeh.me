import assert from "node:assert/strict";
import test from "node:test";

import { rehypeDeadLinks } from "./rehype-dead-links.mjs";

const DEFAULT_REASON = "This link is dead and no longer works.";

test("converts dead+ links into inert dead-link markup", () => {
  const tree = root([
    link("dead+https://example.com/old-page", [text("old page")], {
      title: "Archived elsewhere.",
    }),
  ]);

  transform(tree);

  const wrapper = tree.children[0];
  const deadLink = wrapper.children[0];
  const tooltip = wrapper.children[1];

  assert.equal(wrapper.tagName, "span");
  assert.deepEqual(wrapper.properties.className, [
    "group",
    "relative",
    "inline-block",
  ]);
  assert.equal(deadLink.tagName, "span");
  assert.equal(deadLink.properties.role, "link");
  assert.equal(deadLink.properties.ariaDisabled, "true");
  assert.equal(deadLink.properties.tabIndex, 0);
  assert.equal(
    deadLink.properties.dataDeadLinkHref,
    "https://example.com/old-page",
  );
  assert.deepEqual(deadLink.children, [text("old page")]);
  assert.equal(tooltip.tagName, "span");
  assert.equal(tooltip.properties.role, "tooltip");
  assert.equal(deadLink.properties.ariaDescribedBy, tooltip.properties.id);
  assert.deepEqual(tooltip.children, [text("Archived elsewhere.")]);
});

test("strips dead+ from autolink text that falls back to href", () => {
  const href = "dead+http://zhuoqe.org/svn/adiumlogs/trunk/";
  const tree = root([link(href, [text(href)])]);

  transform(tree);

  const deadLink = tree.children[0].children[0];

  assert.equal(
    deadLink.properties.dataDeadLinkHref,
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

  const deadLink = tree.children[0].children[0];

  assert.deepEqual(deadLink.children, [text("Adium logs repository")]);
});

test("uses the default tooltip reason when no title is present", () => {
  const tree = root([
    link("dead+custom://example/resource", [text("resource")]),
  ]);

  transform(tree);

  const tooltip = tree.children[0].children[1];

  assert.deepEqual(tooltip.children, [text(DEFAULT_REASON)]);
});

test("ignores non-dead links and dead+ values without a URL scheme", () => {
  const regular = link("https://example.com/", [text("live")]);
  const invalidDead = link("dead+/not-a-url", [text("invalid")]);
  const tree = root([regular, invalidDead]);

  transform(tree);

  assert.equal(tree.children[0], regular);
  assert.equal(tree.children[1], invalidDead);
});

function transform(tree) {
  rehypeDeadLinks()(tree, { path: "/content/post.mdx" });
}

function root(children) {
  return {
    type: "root",
    children,
  };
}

function link(href, children, properties = {}) {
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

function text(value) {
  return {
    type: "text",
    value,
  };
}
