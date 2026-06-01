import { describe, expect, test } from "vitest";
import { renderImageMarkdown } from "./Image.markdown";

describe("renderImageMarkdown", () => {
  test("renders a Markdown image", () => {
    expect(
      renderImageMarkdown(
        { alt: "Inventory", src: "/assets/dim.webp" },
        { children: "" },
      ),
    ).toBe("![Inventory](/assets/dim.webp)");
  });

  test("renders a caption when it differs from alt text", () => {
    expect(
      renderImageMarkdown(
        {
          alt: "Liquid Glass icon",
          caption: "Icon Composer preview",
          src: "/assets/icon.jpg",
        },
        { children: "" },
      ),
    ).toBe("![Liquid Glass icon](/assets/icon.jpg)\n\n_Icon Composer preview_");
  });
});
