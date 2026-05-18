import { describe, expect, test } from "vitest";

import DeadLink from "./DeadLink.astro";
import { renderComponent } from "../test-utils";

describe("DeadLink", () => {
  test("renders markdown text as inert link content", async () => {
    const document = await renderComponent(DeadLink, {
      href: "https://dead.example/",
      text: "[Dead **site**](https://dead.example/)",
      reason: "Gone.",
      class: "extra-class",
    });
    const link = document.querySelector('[role="link"]');
    const tooltip = document.querySelector('[role="tooltip"]');

    expect(link?.getAttribute("aria-disabled")).toBe("true");
    expect(link?.getAttribute("tabindex")).toBe("0");
    expect(link?.getAttribute("data-dead-link-href")).toBe(
      "https://dead.example/",
    );
    expect(link?.getAttribute("aria-describedby")).toBe(
      tooltip?.getAttribute("id"),
    );
    expect(link?.className).toContain("extra-class");
    expect(link?.innerHTML.trim()).toBe("Dead <strong>site</strong>");
    expect(tooltip?.textContent?.trim()).toBe("Gone.");
  });

  test("renders slot content when text is omitted", async () => {
    const document = await renderComponent(
      DeadLink,
      {
        href: "https://dead.example/",
      },
      {
        default: "<em>Slotted label</em>",
      },
    );

    expect(document.querySelector('[role="link"]')?.innerHTML.trim()).toBe(
      "<em>Slotted label</em>",
    );
  });

  test("falls back to rendering the href when no text or slot is provided", async () => {
    const document = await renderComponent(DeadLink, {
      href: "https://dead.example/",
    });

    expect(document.querySelector('[role="link"]')?.textContent?.trim()).toBe(
      "https://dead.example/",
    );
  });

  test("uses the default tooltip reason", async () => {
    const document = await renderComponent(DeadLink, {
      href: "https://dead.example/",
      text: "Dead site",
    });

    expect(
      document.querySelector('[role="tooltip"]')?.textContent?.trim(),
    ).toBe("This link is dead and no longer works.");
  });

  test("removes nested anchors from rendered markdown labels", async () => {
    const document = await renderComponent(DeadLink, {
      text: "[linked label](https://example.com/)",
    });
    const link = document.querySelector('[role="link"]');

    expect(link?.textContent?.trim()).toBe("linked label");
    expect(link?.querySelector("a")).toBeNull();
  });
});
