import { expect, test } from "vitest";

import { readingTime } from "./reading-time";

test("returns a one minute minimum for empty content", () => {
  expect(readingTime("")).toBe(1);
  expect(readingTime("   \n\t  ")).toBe(1);
});

test("rounds reading time up at 225 words per minute", () => {
  const words = Array.from({ length: 226 }, (_, index) => `word${index}`);

  expect(readingTime(words.join(" "))).toBe(2);
});

test("strips markdown, html, and code block artifacts before counting", () => {
  const text = [
    "# Heading",
    "Visible words stay.",
    "```ts",
    "const hidden = 'code words should not count';",
    "```",
    "[linked words](https://example.com/) ![image alt](./image.png)",
    "<strong>html words</strong>",
    "> quoted *formatting* `inline` words",
  ].join("\n");

  expect(readingTime(text)).toBe(1);
});

test("keeps linked text while stripping markdown link syntax", () => {
  const linkedWords = Array.from(
    { length: 226 },
    (_, index) => `[word${index}](https://example.com/)`,
  ).join(" ");

  expect(readingTime(linkedWords)).toBe(2);
});
