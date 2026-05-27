import { describe, expect, test } from "vitest";

import { renderComponent } from "../test-utils";
import PageHeading from "./PageHeading.astro";

describe("PageHeading", () => {
  test("renders h1 page headings by default", async () => {
    const document = await renderComponent(
      PageHeading,
      {},
      { default: "Blog" },
    );
    const heading = document.querySelector("h1");

    expect(heading?.textContent?.trim()).toBe("Blog");
    expect(heading?.className).toContain("text-heading");
    expect(heading?.className).toContain("text-4xl");
    expect(heading?.className).toContain("sm:text-5xl");
  });

  test("defaults h2 headings to section sizing", async () => {
    const document = await renderComponent(
      PageHeading,
      { as: "h2" },
      { default: "2025" },
    );
    const heading = document.querySelector("h2");

    expect(heading?.textContent?.trim()).toBe("2025");
    expect(heading?.className).toContain("text-2xl");
  });

  test("supports explicit page, section, and post size variants", async () => {
    const page = await renderComponent(
      PageHeading,
      { size: "page" },
      { default: "Page" },
    );
    const section = await renderComponent(
      PageHeading,
      { size: "section" },
      { default: "Section" },
    );
    const post = await renderComponent(
      PageHeading,
      { size: "post" },
      { default: "Post" },
    );

    expect(page.querySelector("h1")?.className).toContain("text-4xl");
    expect(section.querySelector("h1")?.className).toContain("text-2xl");
    expect(post.querySelector("h1")?.className).toContain("text-3xl");
    expect(post.querySelector("h1")?.className).toContain("leading-tight");
  });

  test("supports uppercase and caller-provided classes", async () => {
    const document = await renderComponent(
      PageHeading,
      {
        uppercase: true,
        class: "custom-class",
      },
      { default: "Title" },
    );
    const heading = document.querySelector("h1");

    expect(heading?.className).toContain("uppercase");
    expect(heading?.className).toContain("custom-class");
  });
});
