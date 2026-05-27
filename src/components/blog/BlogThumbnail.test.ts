import { describe, expect, test } from "vitest";

import { renderComponent } from "../test-utils";
import BlogThumbnail from "./BlogThumbnail.astro";
import { imageMetadata } from "./test-helpers";

describe("BlogThumbnail", () => {
  test("renders card thumbnails as inert links with accessible labels", async () => {
    const document = await renderComponent(BlogThumbnail, {
      href: "/blog/2025/example-post/",
      label: "Read post",
      source: imageMetadata("/thumbnail.jpg"),
      alt: "Thumbnail",
      loading: "eager",
    });
    const link = document.querySelector("a");
    const image = document.querySelector("img");

    expect(link?.getAttribute("href")).toBe("/blog/2025/example-post/");
    expect(link?.getAttribute("aria-label")).toBe("Read post");
    expect(link?.getAttribute("tabindex")).toBe("-1");
    expect(link?.className).toContain("sm:block");
    expect(image?.getAttribute("alt")).toBe("Thumbnail");
    expect(image?.getAttribute("loading")).toBe("eager");
    expect(image?.getAttribute("sizes")).toBe("160px");
    expect(image?.getAttribute("style")).toBe(
      "height: 100%; object-position: center; width: 100%",
    );
  });

  test("renders the placeholder icon when a card thumbnail has no image", async () => {
    const document = await renderComponent(BlogThumbnail, {
      href: "/blog/2025/example-post/",
      label: "Read post",
    });
    const link = document.querySelector("a");

    expect(link?.className).toContain("place-items-center");
    expect(link?.className).toContain("bg-surface-subtle");
    expect(document.querySelector("svg")).not.toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });

  test("applies fit, size, object-position, and frame variants", async () => {
    const document = await renderComponent(BlogThumbnail, {
      href: "/blog/2025/example-post/",
      label: "Read post",
      source: imageMetadata("/thumbnail.jpg"),
      objectPosition: "top",
      thumbnail: {
        fill: "fit",
        frame: { dark: true },
        size: "75%",
      },
    });
    const link = document.querySelector("a");
    const image = document.querySelector("img");

    expect(link?.className).toContain("dark:bg-surface-subtle");
    expect(link?.className).toContain("place-items-center");
    expect(image?.className).toContain("object-contain");
    expect(image?.getAttribute("style")).toBe(
      "height: 75%; object-position: top; width: 75%",
    );
    expect(image?.getAttribute("sizes")).toBe("120px");
  });

  test("renders dark image variants", async () => {
    const document = await renderComponent(BlogThumbnail, {
      href: "/blog/2025/example-post/",
      label: "Read post",
      source: {
        light: imageMetadata("/light.jpg"),
        dark: imageMetadata("/dark.jpg"),
      },
    });
    const images = [...document.querySelectorAll("img")];

    expect(images).toHaveLength(2);
    expect(images[0]?.className).toContain("dark:hidden");
    expect(images[1]?.className).toContain("hidden");
    expect(images[1]?.className).toContain("dark:block");
  });

  test("renders featured thumbnails as non-link image containers", async () => {
    const document = await renderComponent(BlogThumbnail, {
      href: "/blog/2025/example-post/",
      label: "Read post",
      source: imageMetadata("/featured.jpg", { width: 1200, height: 600 }),
      variant: "featured",
    });
    const container = document.querySelector("div");
    const image = document.querySelector("img");

    expect(document.querySelector("a")).toBeNull();
    expect(container?.className).toContain("aspect-[2/1]");
    expect(container?.className).toContain("rounded-lg");
    expect(image?.getAttribute("fetchpriority")).toBe("high");
    expect(image?.getAttribute("sizes")).toContain("(min-width: 1008px) 960px");
  });

  test("renders nothing for featured thumbnails without an image", async () => {
    const document = await renderComponent(BlogThumbnail, {
      href: "/blog/2025/example-post/",
      label: "Read post",
      variant: "featured",
    });

    expect(document.toString().trim()).toBe("");
  });
});
