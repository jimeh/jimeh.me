import { describe, expect, test } from "vitest";
import { siteConfig } from "../data/site";
import { publicProfileMarkdown } from "./markdown-export";

describe("publicProfileMarkdown", () => {
  test("omits email address details", () => {
    const markdown = publicProfileMarkdown();

    expect(markdown).not.toContain("mailto:");
    expect(markdown).not.toContain(siteConfig.email.rot13Href);
    expect(markdown).not.toContain(siteConfig.email.rot13Text);
  });
});
