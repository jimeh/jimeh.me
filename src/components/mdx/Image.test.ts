import { describe, expect, test } from "vitest";

import Image from "./Image.astro";
import { renderComponent } from "../test-utils";

describe("Image", () => {
  test("requires width and height together for string sources", async () => {
    await expect(
      renderComponent(Image, {
        src: "/image.jpg",
        width: 100,
      }),
    ).rejects.toThrow("Image width and height must be provided together.");
  });

  test("requires dimensions for non-remote string sources", async () => {
    await expect(
      renderComponent(Image, {
        src: "/image.jpg",
      }),
    ).rejects.toThrow("String image sources must provide width and height.");
  });

  test("requires dimensions for non-remote dark string sources", async () => {
    await expect(
      renderComponent(Image, {
        src: "https://example.com/light.jpg",
        darkSrc: "/dark.jpg",
      }),
    ).rejects.toThrow("String image sources must provide width and height.");
  });

  test("renders non-lightboxed images with captions and sizing", async () => {
    const document = await renderComponent(Image, {
      src: "/image.jpg",
      width: 800,
      height: 400,
      alt: "Alt text",
      caption: "Caption",
      size: "wide",
      position: "right",
      aspect: "16/9",
      objectPosition: "top",
      noLightbox: true,
      loading: "eager",
    });
    const figure = document.querySelector("figure");
    const image = document.querySelector("img");

    expect(figure?.className).toContain("mdx-figure-wide");
    expect(document.querySelector("a[data-fancybox]")).toBeNull();
    expect(image?.getAttribute("src")).toBe("/image.jpg");
    expect(image?.getAttribute("alt")).toBe("Alt text");
    expect(image?.getAttribute("loading")).toBe("eager");
    expect(image?.getAttribute("style")).toBe(
      "aspect-ratio: 16/9; object-position: top",
    );
    expect(image?.className).toContain("ml-auto");
    expect(image?.className).toContain("object-cover");
    expect(document.querySelector("figcaption")?.textContent).toContain(
      "Caption",
    );
  });

  test("uses caption as fallback alt text", async () => {
    const document = await renderComponent(Image, {
      src: "/image.jpg",
      width: 800,
      height: 400,
      caption: "Caption alt",
      noLightbox: true,
    });

    expect(document.querySelector("img")?.getAttribute("alt")).toBe(
      "Caption alt",
    );
  });

  test("renders default empty alt text when no alt or caption is provided", async () => {
    const document = await renderComponent(Image, {
      src: "/image.jpg",
      width: 800,
      height: 400,
      noLightbox: true,
    });

    expect(document.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  test("wraps lightboxed images with gallery metadata", async () => {
    const document = await renderComponent(Image, {
      src: "/image.jpg",
      width: 800,
      height: 400,
      caption: "Caption",
      gallery: "post-gallery",
    });
    const link = document.querySelector("a[data-fancybox]");

    expect(link?.getAttribute("href")).toBe("/image.jpg");
    expect(link?.getAttribute("data-fancybox")).toBe("post-gallery");
    expect(link?.getAttribute("data-caption")).toBe("Caption");
    expect(link?.className).toContain("mdx-fancybox-link");
  });

  test("uses the default gallery name for lightboxed images", async () => {
    const document = await renderComponent(Image, {
      src: "/image.jpg",
      width: 800,
      height: 400,
    });

    expect(
      document.querySelector("a[data-fancybox]")?.getAttribute("data-fancybox"),
    ).toBe("gallery");
  });

  test("renders dark image variants with visibility classes", async () => {
    const document = await renderComponent(Image, {
      src: "/light.jpg",
      darkSrc: "/dark.jpg",
      width: 800,
      height: 400,
      noLightbox: true,
    });
    const images = [...document.querySelectorAll("img")];

    expect(images).toHaveLength(2);
    expect(images[0]?.getAttribute("src")).toBe("/light.jpg");
    expect(images[0]?.className).toContain("dark:hidden");
    expect(images[1]?.getAttribute("src")).toBe("/dark.jpg");
    expect(images[1]?.className).toContain("hidden");
    expect(images[1]?.className).toContain("dark:block");
  });

  test("renders caption slot content", async () => {
    const document = await renderComponent(
      Image,
      {
        src: "/image.jpg",
        width: 800,
        height: 400,
        caption: "Prop caption",
        noLightbox: true,
      },
      { default: "<strong>Slot caption</strong>" },
    );
    const caption = document.querySelector("figcaption");

    expect(caption?.innerHTML).toContain("<strong>Slot caption</strong>");
    expect(caption?.textContent).not.toContain("Prop caption");
  });

  test("applies percentage sizing and left alignment classes", async () => {
    const document = await renderComponent(Image, {
      src: "/image.jpg",
      width: 800,
      height: 400,
      size: "50%",
      position: "left",
      noLightbox: true,
    });
    const figure = document.querySelector("figure");
    const image = document.querySelector("img");

    expect(figure?.className).toContain("mdx-figure-float-left");
    expect(figure?.getAttribute("style")).toContain("width: 50%");
    expect(image?.className).toContain("block");
    expect(image?.className).not.toContain("mx-auto");
  });

  test("applies full-size image sizes", async () => {
    const document = await renderComponent(Image, {
      src: "/image.jpg",
      width: 800,
      height: 400,
      size: "full",
      noLightbox: true,
    });

    expect(document.querySelector("figure")?.className).toContain(
      "mdx-figure-full",
    );
    expect(document.querySelector("img")?.getAttribute("sizes")).toBe("100vw");
  });
});
