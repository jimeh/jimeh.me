import { describe, expect, test } from "vitest";

import ImageGrid from "./ImageGrid.astro";
import { renderComponent } from "../test-utils";

describe("ImageGrid", () => {
  test("renders default grid styles", async () => {
    const document = await renderComponent(
      ImageGrid,
      {},
      { default: '<img src="/one.jpg" alt="One">' },
    );
    const figure = document.querySelector("figure");
    const grid = document.querySelector(".mdx-image-grid-inner");

    expect(figure?.className).toContain("mdx-image-grid");
    expect(figure?.className).not.toContain("mx-auto");
    expect(grid?.getAttribute("style")).toBe("--grid-columns: 2; gap: 1rem");
  });

  test("renders custom grid styles and gallery metadata", async () => {
    const document = await renderComponent(
      ImageGrid,
      {
        columns: 3,
        gap: "2rem",
        gallery: "gallery-name",
      },
      { default: '<img src="/one.jpg" alt="One">' },
    );
    const grid = document.querySelector(".mdx-image-grid-inner");

    expect(grid?.getAttribute("style")).toBe("--grid-columns: 3; gap: 2rem");
    expect(grid?.getAttribute("data-gallery")).toBe("gallery-name");
  });

  test("centers percentage-sized grids", async () => {
    const document = await renderComponent(
      ImageGrid,
      { size: "80%" },
      { default: '<img src="/one.jpg" alt="One">' },
    );

    expect(document.querySelector("figure")?.className).toContain("mx-auto");
  });

  test("centers decimal percentage-sized grids", async () => {
    const document = await renderComponent(
      ImageGrid,
      { size: "80.5%" },
      { default: '<img src="/one.jpg" alt="One">' },
    );

    expect(document.querySelector("figure")?.className).toContain("mx-auto");
  });

  test("renders caption prop and caption slot variants", async () => {
    const withProp = await renderComponent(
      ImageGrid,
      { caption: "Prop caption" },
      { default: '<img src="/one.jpg" alt="One">' },
    );
    const withSlot = await renderComponent(
      ImageGrid,
      {},
      {
        default: '<img src="/one.jpg" alt="One">',
        caption: "<strong>Slot caption</strong>",
      },
    );

    expect(withProp.querySelector("figcaption")?.textContent).toContain(
      "Prop caption",
    );
    expect(withSlot.querySelector("figcaption")?.innerHTML).toContain(
      "<strong>Slot caption</strong>",
    );
  });
});
