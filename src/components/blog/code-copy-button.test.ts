import { parseHTML } from "linkedom";
import { describe, expect, test, vi } from "vitest";

import { renderComponent } from "../test-utils";
import CodeCopyButton from "./CodeCopyButton.astro";
import { initCodeCopyButtons } from "./code-copy-button";

describe("CodeCopyButton", () => {
  test("renders the copy button template", async () => {
    const document = await renderComponent(CodeCopyButton);
    const template = document.querySelector(
      "template#code-copy-btn-tpl",
    ) as HTMLTemplateElement | null;
    const button = template?.content.querySelector("button");

    expect(button?.getAttribute("type")).toBe("button");
    expect(button?.getAttribute("aria-label")).toBe("Copy code");
    expect(button?.querySelector('[data-icon="copy"]')).not.toBeNull();
    expect(
      button?.querySelector('[data-icon="check"]')?.getAttribute("class"),
    ).toContain("hidden");
  });
});

describe("initCodeCopyButtons", () => {
  test("adds copy buttons to pretty-code figures", async () => {
    const { document, window } = parseHTML(`
      <template id="code-copy-btn-tpl">
        <button type="button" aria-label="Copy code">
          <span data-icon="copy"></span>
          <span data-icon="check" class="hidden"></span>
        </button>
      </template>
      <figure data-rehype-pretty-code-figure>
        <pre><code>pnpm test</code></pre>
      </figure>
    `);
    const writeText = vi.fn(async () => undefined);
    let reset: (() => void) | undefined;

    initCodeCopyButtons(document, { writeText }, (callback: () => void) => {
      reset = callback;
      return 1;
    });

    const figure = document.querySelector("figure")!;
    const button = figure.querySelector("button")!;
    const copyIcon = button.querySelector('[data-icon="copy"]')!;
    const checkIcon = button.querySelector('[data-icon="check"]')!;

    expect(figure.style.position).toBe("relative");
    expect(button.style.top).toBe("10px");

    button.dispatchEvent(new window.Event("click"));
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("pnpm test");
    expect(copyIcon.classList.contains("hidden")).toBe(true);
    expect(checkIcon.classList.contains("hidden")).toBe(false);

    reset?.();

    expect(copyIcon.classList.contains("hidden")).toBe(false);
    expect(checkIcon.classList.contains("hidden")).toBe(true);
  });

  test("skips figures without pre elements", () => {
    const { document } = parseHTML(`
      <template id="code-copy-btn-tpl">
        <button type="button">
          <span data-icon="copy"></span>
          <span data-icon="check"></span>
        </button>
      </template>
      <figure data-rehype-pretty-code-figure></figure>
    `);

    initCodeCopyButtons(document, { writeText: vi.fn() });

    expect(
      document.querySelector("figure")?.querySelector("button"),
    ).toBeNull();
  });

  test("throws when the template is missing", () => {
    const { document } = parseHTML("<main></main>");

    expect(() => initCodeCopyButtons(document, { writeText: vi.fn() })).toThrow(
      "Missing #code-copy-btn-tpl template",
    );
  });
});
