import type { APIContext } from "astro";
import { describe, expect, test } from "vitest";

import { siteConfig } from "../data/site";
import { GET } from "./rss.xml";

describe("RSS feed", () => {
  test("returns feed metadata and main blog posts only", async () => {
    const response = await GET({
      site: new URL(siteConfig.url),
    } as APIContext);
    const source = await response.text();

    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(source).toContain(`<title>${siteConfig.title}</title>`);
    expect(source).toContain(
      `<description>${siteConfig.description}</description>`,
    );
    expect(source).toContain("<link>https://jimeh.me/blog/");
    expect(source).not.toContain("/blog/archives/");
  });
});
