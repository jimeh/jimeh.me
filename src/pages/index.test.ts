import { describe, expect, test } from "vitest";

import { renderComponent } from "../components/test-utils";
import { siteConfig, siteLinks } from "../data/site";
import HomePage from "./index.astro";

describe("home page", () => {
  test("renders profile identity and configured links", async () => {
    const document = await renderComponent(HomePage);
    const links = [...document.querySelectorAll("#site-links a")];

    expect(document.querySelector("img")?.getAttribute("alt")).toBe(
      siteConfig.author.name,
    );
    expect(document.querySelector(".text-heading")?.textContent?.trim()).toBe(
      siteConfig.author.name,
    );
    expect(
      document.querySelector(".text-heading-muted")?.textContent?.trim(),
    ).toBe(`(${siteConfig.author.nickname})`);
    expect(document.querySelector(".text-accent")?.textContent?.trim()).toBe(
      siteConfig.description,
    );
    expect(links).toHaveLength(siteLinks.length + 1);
    expect(links[0]?.getAttribute("data-rot13-href")).toBe(
      siteConfig.email.rot13Href,
    );
    expect(links.slice(1).map((link) => link.getAttribute("href"))).toEqual(
      siteLinks.map((link) => link.url),
    );
  });
});
