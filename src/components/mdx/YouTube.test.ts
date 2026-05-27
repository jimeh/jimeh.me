import { describe, expect, test } from "vitest";

import YouTube from "./YouTube.astro";
import { renderComponent } from "../test-utils";

describe("YouTube", () => {
  test("renders privacy-enhanced embeds from standard watch URLs", async () => {
    const document = await renderComponent(YouTube, {
      src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Video title",
      caption: "Video caption",
      size: "wide",
    });
    const iframe = document.querySelector("iframe");

    expect(document.querySelector("figure")?.className).toContain(
      "mdx-figure-wide",
    );
    expect(iframe?.getAttribute("src")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(iframe?.getAttribute("title")).toBe("Video title");
    expect(iframe?.getAttribute("loading")).toBe("lazy");
    expect(iframe?.hasAttribute("allowfullscreen")).toBe(true);
    expect(document.querySelector("figcaption")?.textContent).toContain(
      "Video caption",
    );
  });

  test("supports youtu.be, shorts, embed, /v/, and bare IDs", async () => {
    const inputs = [
      "https://youtu.be/abc123",
      "https://www.youtube.com/shorts/abc123",
      "https://www.youtube.com/embed/abc123",
      "https://www.youtube.com/v/abc123",
      "abc123",
    ];

    for (const src of inputs) {
      const document = await renderComponent(YouTube, { src });
      expect(document.querySelector("iframe")?.getAttribute("src")).toBe(
        "https://www.youtube-nocookie.com/embed/abc123",
      );
    }
  });

  test("uses a default iframe title", async () => {
    const document = await renderComponent(YouTube, { src: "abc123" });

    expect(document.querySelector("iframe")?.getAttribute("title")).toBe(
      "YouTube video",
    );
  });

  test("renders caption slot content", async () => {
    const document = await renderComponent(
      YouTube,
      {
        src: "abc123",
        caption: "Prop caption",
      },
      { default: "<strong>Slot caption</strong>" },
    );
    const caption = document.querySelector("figcaption");

    expect(caption?.innerHTML).toContain("<strong>Slot caption</strong>");
    expect(caption?.textContent).not.toContain("Prop caption");
  });

  test("passes figure sizing and positioning props through", async () => {
    const document = await renderComponent(YouTube, {
      src: "abc123",
      size: "50%",
      position: "right",
      overhang: "outside",
    });
    const figure = document.querySelector("figure");

    expect(figure?.className).toContain("mdx-figure-float-right");
    expect(figure?.getAttribute("style")).toContain("width: 50%");
    expect(figure?.getAttribute("style")).toContain(
      "--mdx-figure-overhang: calc(-50% - var(--mdx-figure-float-gutter))",
    );
  });

  test("throws when the video ID is empty", async () => {
    await expect(renderComponent(YouTube, { src: "" })).rejects.toThrow(
      'YouTube: could not extract video ID from ""',
    );
  });
});
