import { describe, expect, test } from "vitest";

import { renderComponent } from "../components/test-utils";
import BlogLayout from "./BlogLayout.astro";

describe("BlogLayout", () => {
  test("renders default blog breadcrumbs and content width", async () => {
    const document = await renderComponent(
      BlogLayout,
      { title: "Blog page" },
      { default: "<p>Blog content</p>" },
    );
    const links = [...document.querySelectorAll("nav a")];
    const content = document.querySelector("body > div");

    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/blog/",
    ]);
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "jimeh",
      "Blog",
    ]);
    expect(content?.className).toContain("max-w-3xl");
    expect(document.querySelector("main")?.textContent?.trim()).toBe(
      "Blog content",
    );
  });

  test("renders custom breadcrumbs and narrow width variant", async () => {
    const document = await renderComponent(
      BlogLayout,
      {
        breadcrumbs: [
          { href: "/", label: "Home" },
          { href: "/blog/archives/", label: "Archives" },
        ],
        width: "2xl",
      },
      { default: "<p>Archive content</p>" },
    );
    const links = [...document.querySelectorAll("nav a")];
    const content = document.querySelector("body > div");

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "Home",
      "Archives",
    ]);
    expect(content?.className).toContain("max-w-2xl");
  });
});
