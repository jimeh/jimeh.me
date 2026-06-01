import { describe, expect, test } from "vitest";
import { markdownLink } from "./markdown";

describe("markdownLink", () => {
  test("escapes markdown-breaking URL characters", () => {
    expect(
      markdownLink("Link", "https://example.com/a file(1)'<x>\".zip"),
    ).toBe("[Link](https://example.com/a%20file%281%29%27%3Cx%3E%22.zip)");
  });
});
