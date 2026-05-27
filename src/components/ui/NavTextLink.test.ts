import { describe, expect, test } from "vitest";

import { renderComponent } from "../test-utils";
import NavTextLink from "./NavTextLink.astro";

describe("NavTextLink", () => {
  test("renders a navigation link with default typography classes", async () => {
    const document = await renderComponent(
      NavTextLink,
      { href: "/blog/" },
      { default: "Blog" },
    );
    const link = document.querySelector("a");

    expect(link?.getAttribute("href")).toBe("/blog/");
    expect(link?.textContent?.trim()).toBe("Blog");
    expect(link?.className).toContain("text-heading");
    expect(link?.className).toContain("hover:text-accent");
    expect(link?.className).toContain("uppercase");
    expect(link?.className).toContain("[font-stretch:75%]");
  });

  test("preserves caller-provided classes", async () => {
    const document = await renderComponent(
      NavTextLink,
      { href: "/", class: "custom-class" },
      { default: "Home" },
    );

    expect(document.querySelector("a")?.className).toContain("custom-class");
  });
});
