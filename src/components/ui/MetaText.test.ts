import { describe, expect, test } from "vitest";

import { renderComponent } from "../test-utils";
import MetaText from "./MetaText.astro";

describe("MetaText", () => {
  test("renders muted meta text with slot content", async () => {
    const document = await renderComponent(
      MetaText,
      {},
      { default: "12 posts" },
    );
    const paragraph = document.querySelector("p");

    expect(paragraph?.textContent?.trim()).toBe("12 posts");
    expect(paragraph?.className).toContain("text-muted");
    expect(paragraph?.className).toContain("mt-2");
    expect(paragraph?.className).toContain("text-sm");
  });

  test("preserves caller-provided classes", async () => {
    const document = await renderComponent(
      MetaText,
      { class: "custom-class" },
      { default: "Tagged posts" },
    );

    expect(document.querySelector("p")?.className).toContain("custom-class");
  });
});
