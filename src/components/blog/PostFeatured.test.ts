import { describe, expect, test } from "vitest";

import { renderComponent } from "../test-utils";
import PostFeatured from "./PostFeatured.astro";
import { blogPost, imageMetadata } from "./test-helpers";

describe("PostFeatured", () => {
  test("renders featured post details and reading time", async () => {
    const post = blogPost({
      body: Array.from({ length: 226 }, (_, index) => `word${index}`).join(" "),
    });
    const document = await renderComponent(PostFeatured, { post });
    const link = document.querySelector("a");
    const time = document.querySelector("time");

    expect(link?.getAttribute("href")).toBe("/blog/2025/example-post/");
    expect(document.querySelector("h3")?.textContent?.trim()).toBe(
      "Example Post",
    );
    expect(document.querySelector("p")?.textContent?.trim()).toBe(
      "An example post description.",
    );
    expect(time?.getAttribute("datetime")).toBe("2025-06-09");
    expect(time?.textContent).toBe("June 9, 2025");
    expect(document.toString()).toContain("2 min read");
  });

  test("renders featured thumbnail image metadata", async () => {
    const post = blogPost({
      data: {
        image: {
          src: imageMetadata("/featured.jpg", { width: 1200, height: 600 }),
          alt: "Featured image",
          size: "default",
          position: "center",
          objectPosition: "bottom",
          hidden: false,
          thumbnail: {
            fill: "fill",
            objectPosition: "top",
            frame: false,
            size: "90%",
          },
        },
      },
    });
    const document = await renderComponent(PostFeatured, { post });
    const thumbnail = document.querySelector("div.relative");
    const image = document.querySelector("img");

    expect(thumbnail?.className).toContain("aspect-[2/1]");
    expect(image?.getAttribute("alt")).toBe("Featured image");
    expect(image?.getAttribute("loading")).toBe("eager");
    expect(image?.getAttribute("fetchpriority")).toBe("high");
    expect(image?.getAttribute("style")).toBe(
      "height: 90%; object-position: top; width: 90%",
    );
  });

  test("omits thumbnail spacing when no thumbnail image is present", async () => {
    const document = await renderComponent(PostFeatured, {
      post: blogPost(),
    });

    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("a > div")?.className).toBe("");
  });
});
