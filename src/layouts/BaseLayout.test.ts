import { describe, expect, test } from "vitest";

import { renderComponent } from "../components/test-utils";
import BaseLayout from "./BaseLayout.astro";

describe("BaseLayout", () => {
  test("renders document metadata, hashed public assets, and body slot", async () => {
    const document = await renderComponent(
      BaseLayout,
      { title: "Custom page", description: "Custom description" },
      { default: "<main>Body content</main>" },
      { request: new Request("https://jimeh.me/custom/") },
    );

    expect(document.querySelector("title")?.textContent).toBe("Custom page");
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toBe("Custom description");
    expect(
      document.querySelector('link[rel="icon"]')?.getAttribute("href"),
    ).toMatch(/^\/favicon\.ico\?v=[a-f0-9]{8}$/);
    expect(
      document
        .querySelector('link[rel="apple-touch-icon"]')
        ?.getAttribute("href"),
    ).toMatch(/^\/apple-touch-icon\.png\?v=[a-f0-9]{8}$/);
    expect(
      document
        .querySelector('link[type="application/rss+xml"]')
        ?.getAttribute("href"),
    ).toBe("/rss.xml");
    expect(document.querySelector("main")?.textContent).toBe("Body content");
  });

  test("wires header navigation slot state and initial theme script", async () => {
    const document = await renderComponent(
      BaseLayout,
      {},
      {
        default: "<main>Body content</main>",
        "header-nav": '<a href="/blog/">Blog</a>',
      },
    );
    const nav = document.querySelector("nav");
    const scripts = [...document.querySelectorAll("script")].map((script) => {
      return script.textContent ?? "";
    });

    expect(nav?.getAttribute("aria-hidden")).toBe("false");
    expect(nav?.querySelector("a")?.getAttribute("href")).toBe("/blog/");
    expect(scripts.some((source) => source.includes("localStorage"))).toBe(
      true,
    );
    expect(scripts.some((source) => source.includes("matchMedia"))).toBe(true);
  });
});
