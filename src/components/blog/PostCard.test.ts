import { describe, expect, test } from "vitest";

import { renderComponent } from "../test-utils";
import PostCard from "./PostCard.astro";
import { blogPost, imageMetadata } from "./test-helpers";

describe("PostCard", () => {
  test("renders post title, description, date, and canonical link", async () => {
    const post = blogPost();
    const document = await renderComponent(PostCard, { post });
    const links = [...document.querySelectorAll("a")];
    const time = document.querySelector("time");

    expect(document.querySelector("h3")?.textContent?.trim()).toBe(
      "Example Post",
    );
    expect(document.querySelector("p")?.textContent?.trim()).toBe(
      "An example post description.",
    );
    expect(time?.getAttribute("datetime")).toBe("2025-06-09");
    expect(time?.textContent).toBe("June 9, 2025");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/blog/2025/example-post/",
      "/blog/2025/example-post/",
    ]);
  });

  test("passes image loading and thumbnail metadata through", async () => {
    const post = blogPost({
      data: {
        image: {
          src: imageMetadata("/image.jpg"),
          alt: "Post image",
          size: "default",
          position: "center",
          objectPosition: "bottom",
          hidden: false,
          thumbnail: {
            src: imageMetadata("/thumbnail.jpg"),
            fill: "fit",
            objectPosition: "top",
            frame: true,
            size: "80%",
          },
        },
      },
    });
    const document = await renderComponent(PostCard, {
      post,
      imageLoading: "eager",
    });
    const thumbnail = document.querySelector(
      'a[aria-label="Read \\"Example Post\\""]',
    );
    const image = document.querySelector("img");

    expect(thumbnail?.className).toContain("place-items-center");
    expect(image?.getAttribute("loading")).toBe("eager");
    expect(image?.className).toContain("object-contain");
    expect(image?.getAttribute("style")).toBe(
      "height: 80%; object-position: top; width: 80%",
    );
  });
});
