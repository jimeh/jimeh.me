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
    const status = template?.content.querySelector("[data-code-copy-status]");

    expect(button?.getAttribute("type")).toBe("button");
    expect(button?.getAttribute("aria-label")).toBe("Copy code");
    expect(button?.querySelector('[data-icon="copy"]')).not.toBeNull();
    expect(
      button?.querySelector('[data-icon="check"]')?.getAttribute("class"),
    ).toContain("hidden");
    expect(status?.textContent?.trim()).toBe("Copied!");
    expect(status?.getAttribute("class")).toContain("opacity-0");
  });
});

describe("initCodeCopyButtons", () => {
  test("adds copy buttons to pretty-code figures", async () => {
    const { document, window } = parseHTML(`
      <template id="code-copy-btn-tpl">
        <div>
          <span data-code-copy-status class="opacity-0">Copied!</span>
          <button type="button" aria-label="Copy code">
            <span data-icon="copy"></span>
            <span data-icon="check" class="hidden"></span>
          </button>
        </div>
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
    const control = figure.querySelector("[data-code-copy-control]")!;
    const status = figure.querySelector("[data-code-copy-status]")!;
    const copyIcon = button.querySelector('[data-icon="copy"]')!;
    const checkIcon = button.querySelector('[data-icon="check"]')!;

    expect(figure.style.position).toBe("relative");
    expect(control.getAttribute("style")).toContain("top:10px");

    button.dispatchEvent(new window.Event("click"));
    await Promise.resolve();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("pnpm test");
    expect(copyIcon.classList.contains("hidden")).toBe(true);
    expect(checkIcon.classList.contains("hidden")).toBe(false);
    expect(status.classList.contains("opacity-0")).toBe(false);
    expect(status.classList.contains("opacity-100")).toBe(true);

    reset?.();

    expect(copyIcon.classList.contains("hidden")).toBe(false);
    expect(checkIcon.classList.contains("hidden")).toBe(true);
    expect(status.classList.contains("opacity-0")).toBe(true);
    expect(status.classList.contains("opacity-100")).toBe(false);
  });

  test("falls back when async clipboard is unavailable", async () => {
    const { document, window } = parseHTML(`
      <template id="code-copy-btn-tpl">
        <div>
          <span data-code-copy-status class="opacity-0">Copied!</span>
          <button type="button" aria-label="Copy code">
            <span data-icon="copy"></span>
            <span data-icon="check" class="hidden"></span>
          </button>
        </div>
      </template>
      <figure data-rehype-pretty-code-figure>
        <pre><code>pnpm test</code></pre>
      </figure>
    `);
    const writeText = vi.fn(async () => {
      throw new Error("Clipboard denied");
    });
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    initCodeCopyButtons(document, { writeText });

    document
      .querySelector("[data-code-copy-button]")!
      .dispatchEvent(new window.Event("click"));
    await Promise.resolve();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("pnpm test");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(
      document
        .querySelector('[data-icon="check"]')
        ?.classList.contains("hidden"),
    ).toBe(false);
    expect(
      document
        .querySelector("[data-code-copy-status]")
        ?.classList.contains("opacity-100"),
    ).toBe(true);
  });

  test("skips figures without pre elements", () => {
    const { document } = parseHTML(`
      <template id="code-copy-btn-tpl">
        <div>
          <span data-code-copy-status></span>
          <button type="button">
            <span data-icon="copy"></span>
            <span data-icon="check"></span>
          </button>
        </div>
      </template>
      <figure data-rehype-pretty-code-figure></figure>
    `);

    initCodeCopyButtons(document, { writeText: vi.fn() });

    expect(
      document.querySelector("figure")?.querySelector("button"),
    ).toBeNull();
  });

  test("does not add duplicate buttons when initialized again", () => {
    const { document } = parseHTML(`
      <template id="code-copy-btn-tpl">
        <div>
          <span data-code-copy-status></span>
          <button type="button">
            <span data-icon="copy"></span>
            <span data-icon="check"></span>
          </button>
        </div>
      </template>
      <figure data-rehype-pretty-code-figure>
        <pre><code>pnpm test</code></pre>
      </figure>
    `);

    initCodeCopyButtons(document, { writeText: vi.fn() });
    initCodeCopyButtons(document, { writeText: vi.fn() });

    expect(document.querySelectorAll("[data-code-copy-button]")).toHaveLength(
      1,
    );
  });

  test("throws when the template is missing", () => {
    const { document } = parseHTML("<main></main>");

    expect(() => initCodeCopyButtons(document, { writeText: vi.fn() })).toThrow(
      "Missing #code-copy-btn-tpl template",
    );
  });
});
