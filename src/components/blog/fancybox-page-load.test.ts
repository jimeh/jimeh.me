import { parseHTML } from "linkedom";
import { describe, expect, test, vi } from "vitest";

import { setupBlogFancybox } from "./fancybox-page-load";

describe("setupBlogFancybox", () => {
  test("binds immediately when the document has already loaded", () => {
    const { document } = parseHTML("<main></main>");
    const fancybox = { bind: vi.fn() };
    const init = vi.fn();

    setupBlogFancybox(document, fancybox, init);

    expect(init).toHaveBeenCalledOnce();
    expect(init).toHaveBeenCalledWith(document, fancybox);
  });

  test("binds again on each Astro page-load event", () => {
    const { document } = parseHTML("<main></main>");
    const fancybox = { bind: vi.fn() };
    const init = vi.fn();
    const PageLoadEvent = document.defaultView?.Event;

    if (!PageLoadEvent) {
      throw new Error("Expected test document to provide Event.");
    }

    setupBlogFancybox(document, fancybox, init);
    document.dispatchEvent(new PageLoadEvent("astro:page-load"));
    document.dispatchEvent(new PageLoadEvent("astro:page-load"));

    expect(init).toHaveBeenCalledTimes(3);
  });
});
