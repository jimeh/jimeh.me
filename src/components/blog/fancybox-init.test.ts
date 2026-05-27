import { parseHTML } from "linkedom";
import { describe, expect, test, vi } from "vitest";

import { renderComponent } from "../test-utils";
import FancyboxInit from "./FancyboxInit.astro";
import { initBlogFancybox } from "./fancybox-init";

describe("FancyboxInit", () => {
  test("renders a client script", async () => {
    const document = await renderComponent(FancyboxInit);

    expect(document.querySelector("script")).not.toBeNull();
  });
});

describe("initBlogFancybox", () => {
  test("cascades gallery names to default gallery items", () => {
    const { document } = parseHTML(`
      <div data-gallery="post-gallery">
        <a data-fancybox="gallery" href="/one.jpg"></a>
        <a data-fancybox="custom" href="/two.jpg"></a>
      </div>
    `);
    const fancybox = { bind: vi.fn() };

    initBlogFancybox(document, fancybox);

    const links = [...document.querySelectorAll("a")];

    expect(links[0]?.getAttribute("data-fancybox")).toBe("post-gallery");
    expect(links[1]?.getAttribute("data-fancybox")).toBe("custom");
  });

  test("skips containers without gallery names", () => {
    const { document } = parseHTML(`
      <div data-gallery="">
        <a data-fancybox="gallery" href="/one.jpg"></a>
      </div>
    `);
    const fancybox = { bind: vi.fn() };

    initBlogFancybox(document, fancybox);

    expect(document.querySelector("a")?.getAttribute("data-fancybox")).toBe(
      "gallery",
    );
  });

  test("binds Fancybox with the expected options", () => {
    const { document } = parseHTML("<main></main>");
    const fancybox = { bind: vi.fn(), unbind: vi.fn() };

    initBlogFancybox(document, fancybox);

    expect(fancybox.unbind).toHaveBeenCalledWith("[data-fancybox]");
    expect(fancybox.bind).toHaveBeenCalledWith("[data-fancybox]", {
      closeExisting: true,
      Hash: false,
      Carousel: {
        transition: "crossfade",
        Thumbs: {
          type: "classic",
        },
      },
    });
  });

  test("rebinds cleanly for repeated page-load initialization", () => {
    const { document } = parseHTML(`
      <main>
        <a data-fancybox="gallery" href="/one.jpg"></a>
      </main>
    `);
    const fancybox = { bind: vi.fn(), unbind: vi.fn() };

    initBlogFancybox(document, fancybox);
    initBlogFancybox(document, fancybox);

    expect(fancybox.unbind).toHaveBeenCalledTimes(2);
    expect(fancybox.bind).toHaveBeenCalledTimes(2);
  });
});
