import { initBlogFancybox, type FancyboxLike } from "./fancybox-init";

type InitBlogFancybox = (root: ParentNode, fancybox: FancyboxLike) => void;

/**
 * Binds Fancybox on initial load and each Astro ClientRouter page load.
 */
export function setupBlogFancybox(
  document: Document,
  fancybox: FancyboxLike,
  initFancybox: InitBlogFancybox = initBlogFancybox,
): void {
  function init() {
    initFancybox(document, fancybox);
  }

  document.addEventListener("astro:page-load", init);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}
