import { describe, expect, test } from "vitest";

import Tooltip from "./Tooltip.astro";
import { tooltipClass, tooltipClassList, tooltipTriggerClass } from "./tooltip";
import { renderComponent } from "../test-utils";

describe("tooltip classes", () => {
  test("returns hover-only tooltip classes by default", () => {
    const className = tooltipClass();

    expect(className).toContain("group-hover:opacity-100");
    expect(className).not.toContain("group-focus-within:opacity-100");
    expect(className).toContain("top-full");
    expect(className).toContain("whitespace-nowrap");
  });

  test("supports focus-visible content tooltips", () => {
    expect(
      tooltipClassList({
        layer: "content",
        placement: "bottom",
        visibility: "hover-focus",
        wrap: "normal",
      }),
    ).toEqual(
      expect.arrayContaining([
        "z-20",
        "bottom-full",
        "group-focus-within:opacity-100",
        "group-hover:opacity-100",
        "whitespace-normal",
      ]),
    );
  });

  test("returns wrapper group classes", () => {
    expect(tooltipTriggerClass("extra")).toBe(
      "group relative inline-block extra",
    );
  });
});

describe("Tooltip", () => {
  test("renders trigger and hover-only tooltip by default", async () => {
    const document = await renderComponent(
      Tooltip,
      { id: "tip" },
      {
        default: "Label",
        trigger: '<button aria-describedby="tip">Action</button>',
      },
    );
    const tooltip = document.querySelector('[role="tooltip"]');

    expect(document.querySelector("button")?.textContent).toBe("Action");
    expect(tooltip?.id).toBe("tip");
    expect(tooltip?.textContent?.trim()).toBe("Label");
    expect(tooltip?.classList.contains("group-hover:opacity-100")).toBe(true);
    expect(tooltip?.classList.contains("group-focus-within:opacity-100")).toBe(
      false,
    );
  });

  test("supports focus-visible wrapped content tooltips", async () => {
    const document = await renderComponent(
      Tooltip,
      {
        id: "tip",
        layer: "content",
        placement: "bottom",
        visibility: "hover-focus",
        wrap: "normal",
      },
      { default: "Label" },
    );
    const tooltip = document.querySelector('[role="tooltip"]');

    expect(tooltip?.classList.contains("bottom-full")).toBe(true);
    expect(tooltip?.classList.contains("z-20")).toBe(true);
    expect(tooltip?.classList.contains("whitespace-normal")).toBe(true);
    expect(tooltip?.classList.contains("group-focus-within:opacity-100")).toBe(
      true,
    );
  });
});
