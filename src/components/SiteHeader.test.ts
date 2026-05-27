import { describe, expect, test } from "vitest";

import SiteHeader from "./SiteHeader.astro";
import { renderComponent } from "./test-utils";

describe("SiteHeader", () => {
  test("renders hidden navigation placeholder without nav content", async () => {
    const document = await renderComponent(SiteHeader);
    const header = document.querySelector("header");
    const nav = document.querySelector("nav");

    expect(header?.className).not.toContain("bg-surface/80");
    expect(nav?.getAttribute("aria-label")).toBe("Site navigation");
    expect(nav?.getAttribute("aria-hidden")).toBe("true");
    expect(nav?.querySelector(".invisible")).not.toBeNull();
    expect(document.querySelector("[data-theme-toggle]")).not.toBeNull();
  });

  test("renders visible slotted navigation with glass background", async () => {
    const document = await renderComponent(
      SiteHeader,
      { hasNav: true },
      { default: '<a href="/blog/">Blog</a>' },
    );
    const header = document.querySelector("header");
    const nav = document.querySelector("nav");

    expect(header?.className).toContain("bg-surface/80");
    expect(header?.className).toContain("backdrop-blur-sm");
    expect(nav?.getAttribute("aria-hidden")).toBe("false");
    expect(nav?.querySelector("a")?.getAttribute("href")).toBe("/blog/");
  });
});
