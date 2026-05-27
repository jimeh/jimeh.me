import type { ImageMetadata } from "astro";
import { afterEach, describe, expect, test, vi } from "vitest";

import { renderComponent } from "../test-utils";
import AssetImage from "./AssetImage.astro";

const onePixelPng = Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
  0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120,
  156, 99, 248, 15, 4, 0, 9, 251, 3, 253, 167, 117, 129, 223, 0, 0, 0, 0, 73,
  69, 78, 68, 174, 66, 96, 130,
]);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AssetImage", () => {
  test("renders string image sources with explicit dimensions", async () => {
    const document = await renderComponent(AssetImage, {
      src: "/image.jpg",
      alt: "Alt text",
      classList: "custom-class",
      style: "object-position: top",
      width: 800,
      height: 400,
      sizes: "100vw",
      loading: "eager",
      fetchpriority: "high",
    });
    const image = document.querySelector("img");

    expect(image?.getAttribute("src")).toBe("/image.jpg");
    expect(image?.getAttribute("alt")).toBe("Alt text");
    expect(image?.getAttribute("class")).toContain("custom-class");
    expect(image?.getAttribute("style")).toBe("object-position: top");
    expect(image?.getAttribute("width")).toBe("800");
    expect(image?.getAttribute("height")).toBe("400");
    expect(image?.getAttribute("sizes")).toBe("100vw");
    expect(image?.getAttribute("loading")).toBe("eager");
    expect(image?.getAttribute("fetchpriority")).toBe("high");
  });

  test("uses an empty alt string by default", async () => {
    const document = await renderComponent(AssetImage, {
      src: "/image.jpg",
      width: 800,
      height: 400,
    });

    expect(document.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  test("renders classList objects through Astro class:list", async () => {
    const document = await renderComponent(AssetImage, {
      src: "/image.jpg",
      width: 800,
      height: 400,
      classList: {
        active: true,
        inactive: false,
      },
    });
    const image = document.querySelector("img");

    expect(image?.className).toContain("active");
    expect(image?.className).not.toContain("inactive");
  });

  test("renders imported image metadata sources", async () => {
    const source = {
      src: "/_astro/image.hash.jpg",
      width: 800,
      height: 400,
      format: "jpg",
    } as ImageMetadata;
    const document = await renderComponent(AssetImage, {
      src: source,
      alt: "Metadata image",
      widths: [400, 800],
      sizes: "(min-width: 800px) 800px, 100vw",
    });
    const image = document.querySelector("img");

    expect(image?.getAttribute("src")).toContain(
      "href=%2F_astro%2Fimage.hash.jpg",
    );
    expect(image?.getAttribute("alt")).toBe("Metadata image");
    expect(image?.getAttribute("width")).toBe("800");
    expect(image?.getAttribute("height")).toBe("400");
    expect(image?.getAttribute("sizes")).toBe(
      "(min-width: 800px) 800px, 100vw",
    );
  });

  test("passes inferSize through for remote image sources", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const response = new Response(onePixelPng);
        Object.defineProperty(response, "url", {
          value: "https://example.com/image.png",
        });

        return response;
      }),
    );

    const document = await renderComponent(AssetImage, {
      src: "https://example.com/image.png",
      alt: "Remote image",
      inferSize: true,
      widths: [400, 800],
      sizes: "100vw",
    });
    const image = document.querySelector("img");

    expect(image?.getAttribute("src")).toContain(
      "href=https%3A%2F%2Fexample.com%2Fimage.png",
    );
    expect(image?.getAttribute("alt")).toBe("Remote image");
    expect(image?.getAttribute("sizes")).toBe("100vw");
  });
});
