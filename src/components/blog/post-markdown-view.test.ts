import { parseHTML } from "linkedom";
import { describe, expect, test, vi } from "vitest";

import { initPostMarkdownView } from "./post-markdown-view";

type TestWindow = Window & {
  location: URL;
};

function postViewDocument(): Document {
  return parseHTML(`
    <main>
      <button
        data-post-markdown-toggle
        aria-label="Markdown view"
        aria-pressed="false"
      >
        <span></span>
      </button>
      <span>Markdown view</span>
      <section data-post-html-view>Rendered post</section>
      <nav data-post-html-view>Post navigation</nav>
      <section data-post-markdown-view class="hidden">
        <button data-post-markdown-copy>
          <span data-post-markdown-copy-icon="copy"></span>
          <span data-post-markdown-copy-icon="copied" class="hidden"></span>
          <span data-post-markdown-copy-label="copy">Copy</span>
          <span data-post-markdown-copy-label="copied" class="hidden">
            Copied
          </span>
        </button>
        <div data-post-markdown-code>
          <pre><code># Post</code></pre>
        </div>
      </section>
    </main>
  `).document;
}

function setupBrowserState(document: Document, href: string): TestWindow {
  const win = document.defaultView! as unknown as TestWindow;
  const location = new URL(href);

  Object.defineProperty(win, "location", {
    configurable: true,
    value: location,
  });
  Object.defineProperty(win, "history", {
    configurable: true,
    value: {
      pushState: vi.fn(
        (_data: unknown, _unused: string, nextUrl: string | URL) => {
          const url = new URL(String(nextUrl), location.href);
          location.href = url.href;
        },
      ),
    },
  });

  return win;
}

describe("initPostMarkdownView", () => {
  test("toggles Markdown source view as a pressed Markdown button", () => {
    const document = postViewDocument();
    const toggle = document.querySelector("[data-post-markdown-toggle]")!;
    const markdownView = document.querySelector("[data-post-markdown-view]")!;
    const htmlViews = document.querySelectorAll("[data-post-html-view]");

    initPostMarkdownView(document, { writeText: vi.fn() });

    expect(markdownView.classList.contains("hidden")).toBe(true);
    expect(toggle.getAttribute("aria-label")).toBe("Markdown view");

    toggle.dispatchEvent(new document.defaultView!.Event("click"));

    expect(markdownView.classList.contains("hidden")).toBe(false);
    expect(toggle.getAttribute("aria-label")).toBe("Markdown view");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    for (const view of htmlViews) {
      expect(view.classList.contains("hidden")).toBe(true);
      expect(view.hasAttribute("aria-hidden")).toBe(true);
    }

    toggle.dispatchEvent(new document.defaultView!.Event("click"));

    expect(markdownView.classList.contains("hidden")).toBe(true);
    expect(toggle.getAttribute("aria-label")).toBe("Markdown view");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  test("copies Markdown source and resets copied state", async () => {
    const document = postViewDocument();
    const writeText = vi.fn(async () => undefined);
    let reset: (() => void) | undefined;

    initPostMarkdownView(document, { writeText }, (callback: () => void) => {
      reset = callback;
      return 1;
    });

    document
      .querySelector("[data-post-markdown-copy]")!
      .dispatchEvent(new document.defaultView!.Event("click"));
    await Promise.resolve();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("# Post");
    expect(
      document
        .querySelector('[data-post-markdown-copy-icon="copied"]')
        ?.classList.contains("hidden"),
    ).toBe(false);
    expect(
      document
        .querySelector('[data-post-markdown-copy-label="copied"]')
        ?.classList.contains("hidden"),
    ).toBe(false);

    reset?.();

    expect(
      document
        .querySelector('[data-post-markdown-copy-icon="copy"]')
        ?.classList.contains("hidden"),
    ).toBe(false);
  });

  test("falls back when async clipboard is unavailable", async () => {
    const document = postViewDocument();
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    initPostMarkdownView(document);

    document
      .querySelector("[data-post-markdown-copy]")!
      .dispatchEvent(new document.defaultView!.Event("click"));
    await Promise.resolve();
    await Promise.resolve();

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(
      document
        .querySelector('[data-post-markdown-copy-label="copied"]')
        ?.classList.contains("hidden"),
    ).toBe(false);
  });

  test("does not attach duplicate listeners when initialized again", () => {
    const document = postViewDocument();
    const toggle = document.querySelector("[data-post-markdown-toggle]")!;

    initPostMarkdownView(document, { writeText: vi.fn() });
    initPostMarkdownView(document, { writeText: vi.fn() });

    toggle.dispatchEvent(new document.defaultView!.Event("click"));

    expect(toggle.getAttribute("aria-pressed")).toBe("true");
  });

  test("syncs Markdown view with the URL fragment and history", () => {
    const document = postViewDocument();
    const win = setupBrowserState(document, "https://example.com/post/");
    const toggle = document.querySelector("[data-post-markdown-toggle]")!;
    const markdownView = document.querySelector("[data-post-markdown-view]")!;

    initPostMarkdownView(document, { writeText: vi.fn() });

    toggle.dispatchEvent(new document.defaultView!.Event("click"));

    expect(win.location.hash).toBe("#markdown");
    expect(markdownView.classList.contains("hidden")).toBe(false);
    expect(win.history.pushState).toHaveBeenCalledWith(
      { postMarkdownView: true },
      "",
      "https://example.com/post/#markdown",
    );

    win.location.hash = "";
    win.dispatchEvent(new document.defaultView!.Event("popstate"));

    expect(markdownView.classList.contains("hidden")).toBe(true);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  test("opens Markdown view from the URL fragment", () => {
    const document = postViewDocument();
    setupBrowserState(document, "https://example.com/post/#markdown");
    const toggle = document.querySelector("[data-post-markdown-toggle]")!;
    const markdownView = document.querySelector("[data-post-markdown-view]")!;

    initPostMarkdownView(document, { writeText: vi.fn() });

    expect(markdownView.classList.contains("hidden")).toBe(false);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
  });
});
