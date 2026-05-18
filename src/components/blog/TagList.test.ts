import { describe, expect, test } from "vitest";

import { renderComponent } from "../test-utils";
import TagList from "./TagList.astro";

describe("TagList", () => {
  test("renders linked tags by default", async () => {
    const document = await renderComponent(TagList, {
      tags: ["astro", "testing"],
    });
    const links = [...document.querySelectorAll("a")];

    expect(document.querySelector("ul")?.getAttribute("aria-label")).toBe(
      "Tags",
    );
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/blog/tags/astro/",
      "/blog/tags/testing/",
    ]);
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "astro",
      "testing",
    ]);
  });

  test("renders plain text tags when linked is false", async () => {
    const document = await renderComponent(TagList, {
      tags: ["archive", "legacy"],
      linked: false,
    });

    expect(document.querySelectorAll("a")).toHaveLength(0);
    expect(
      [...document.querySelectorAll("span")].map((tag) =>
        tag.textContent?.trim(),
      ),
    ).toEqual(["archive", "legacy"]);
  });
});
