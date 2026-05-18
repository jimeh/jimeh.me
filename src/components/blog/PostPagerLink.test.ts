import { describe, expect, test } from "vitest";

import { renderComponent } from "../test-utils";
import PostPagerLink from "./PostPagerLink.astro";

describe("PostPagerLink", () => {
  test("renders previous links with default left alignment", async () => {
    const document = await renderComponent(PostPagerLink, {
      href: "/blog/2025/previous/",
      label: "Previous",
      title: "Previous post",
    });
    const link = document.querySelector("a");

    expect(link?.getAttribute("href")).toBe("/blog/2025/previous/");
    expect(link?.className).not.toContain("text-right");
    expect(link?.textContent).toContain("Previous");
    expect(link?.textContent).toContain("Previous post");
  });

  test("renders next links with right alignment", async () => {
    const document = await renderComponent(PostPagerLink, {
      href: "/blog/2025/next/",
      label: "Next",
      title: "Next post",
      align: "right",
    });
    const link = document.querySelector("a");

    expect(link?.className).toContain("text-right");
    expect(link?.textContent).toContain("Next");
    expect(link?.textContent).toContain("Next post");
  });
});
