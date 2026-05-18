import { describe, expect, test } from "vitest";

import Figure from "./Figure.astro";
import { renderComponent } from "./test-utils";

describe("Figure", () => {
  test("renders default content, caption, and credit", async () => {
    const document = await renderComponent(
      Figure,
      {
        caption: "Caption text",
        credit: {
          text: "Credit",
          href: "https://example.com/",
          position: "left",
        },
      },
      { default: '<img src="/image.jpg" alt="">' },
    );
    const figure = document.querySelector("figure");
    const caption = document.querySelector("figcaption");
    const credit = caption?.querySelector("span");

    expect(figure?.querySelector("img")?.getAttribute("src")).toBe(
      "/image.jpg",
    );
    expect(caption?.textContent).toContain("Caption text");
    expect(credit?.textContent).toContain("Credit");
    expect(credit?.className).toContain("text-left");
  });

  test("renders named caption slot instead of caption prop", async () => {
    const document = await renderComponent(
      Figure,
      { caption: "Prop caption" },
      {
        default: "<p>Body</p>",
        caption: "<strong>Slot caption</strong>",
      },
    );
    const caption = document.querySelector("figcaption");

    expect(caption?.innerHTML).toContain("<strong>Slot caption</strong>");
    expect(caption?.textContent).not.toContain("Prop caption");
  });

  test("omits figcaption when caption, caption slot, and credit are absent", async () => {
    const document = await renderComponent(
      Figure,
      {},
      { default: "<p>Body</p>" },
    );

    expect(document.querySelector("figcaption")).toBeNull();
  });

  test("applies wide and full size classes", async () => {
    const wide = await renderComponent(
      Figure,
      { size: "wide" },
      { default: "<p>Body</p>" },
    );
    const full = await renderComponent(
      Figure,
      { size: "full" },
      { default: "<p>Body</p>" },
    );

    expect(wide.querySelector("figure")?.className).toContain(
      "mdx-figure-wide",
    );
    expect(full.querySelector("figure")?.className).toContain(
      "mdx-figure-full",
    );
  });

  test("defaults left and right figures to flush floated layouts", async () => {
    const left = await renderComponent(
      Figure,
      { position: "left" },
      { default: "<p>Body</p>" },
    );
    const right = await renderComponent(
      Figure,
      { position: "right" },
      { default: "<p>Body</p>" },
    );

    expect(left.querySelector("figure")?.className).toContain(
      "mdx-figure-float-left",
    );
    expect(left.querySelector("figure")?.className).toContain(
      "mdx-figure-flush",
    );
    expect(right.querySelector("figure")?.className).toContain(
      "mdx-figure-float-right",
    );
    expect(right.querySelector("figure")?.className).toContain(
      "mdx-figure-flush",
    );
  });

  test("allows flush to be disabled explicitly", async () => {
    const document = await renderComponent(
      Figure,
      { position: "left", flush: false },
      { default: "<p>Body</p>" },
    );

    expect(document.querySelector("figure")?.className).not.toContain(
      "mdx-figure-flush",
    );
  });

  test("applies percentage, float, and overhang styles", async () => {
    const document = await renderComponent(
      Figure,
      {
        size: "50%",
        position: "left",
        overhang: "outside",
      },
      { default: "<p>Body</p>" },
    );
    const figure = document.querySelector("figure");

    expect(figure?.className).toContain("mdx-figure-float-left");
    expect(figure?.getAttribute("style")).toContain("width: 50%");
    expect(figure?.getAttribute("style")).toContain(
      "--mdx-figure-overhang: calc(-50% - var(--mdx-figure-float-gutter))",
    );
  });

  test("applies partial overhang styles", async () => {
    const document = await renderComponent(
      Figure,
      {
        size: "60%",
        position: "right",
        overhang: "25%",
      },
      { default: "<p>Body</p>" },
    );

    expect(document.querySelector("figure")?.getAttribute("style")).toContain(
      "--mdx-figure-overhang: calc(-15%)",
    );
  });

  test("applies oversize centered styles", async () => {
    const document = await renderComponent(
      Figure,
      { size: "125%", position: "center" },
      { default: "<p>Body</p>" },
    );
    const figure = document.querySelector("figure");

    expect(figure?.className).toContain("mdx-figure-oversize");
    expect(figure?.getAttribute("style")).toContain(
      "--mdx-figure-width: min(125%, calc(100vw - 3rem))",
    );
  });

  test("centers non-oversize percentage figures", async () => {
    const document = await renderComponent(
      Figure,
      { size: "80%", position: "center" },
      { default: "<p>Body</p>" },
    );
    const figure = document.querySelector("figure");

    expect(figure?.className).toContain("mx-auto");
    expect(figure?.getAttribute("style")).toContain("width: 80%");
  });
});
