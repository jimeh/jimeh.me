import { describe, expect, test } from "vitest";

import Credit from "./Credit.astro";
import { renderComponent } from "./test-utils";

describe("Credit", () => {
  test("renders plain credit text with the default center alignment", async () => {
    const document = await renderComponent(Credit, {
      text: "Photo by Someone",
    });
    const credit = document.querySelector("span");

    expect(credit?.textContent?.trim()).toBe("Photo by Someone");
    expect(credit?.className).toContain("text-center");
    expect(credit?.querySelector("a")).toBeNull();
  });

  test("renders linked credit text with rel safety attributes", async () => {
    const document = await renderComponent(Credit, {
      text: "Source",
      href: "https://example.com/",
    });
    const link = document.querySelector("a");

    expect(link?.getAttribute("href")).toBe("https://example.com/");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link?.textContent?.trim()).toBe("Source");
  });

  test("supports left and right alignment variants", async () => {
    const left = await renderComponent(Credit, {
      text: "Left",
      position: "left",
    });
    const right = await renderComponent(Credit, {
      text: "Right",
      position: "right",
    });

    expect(left.querySelector("span")?.className).toContain("text-left");
    expect(right.querySelector("span")?.className).toContain("text-right");
  });

  test("preserves caller-provided classes", async () => {
    const document = await renderComponent(Credit, {
      text: "Credit",
      class: "custom-class",
    });

    expect(document.querySelector("span")?.className).toContain("custom-class");
  });
});
