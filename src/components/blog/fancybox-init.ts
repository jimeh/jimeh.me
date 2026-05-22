interface FancyboxLike {
  bind(selector: string, options: unknown): void;
  unbind?(selector: string): void;
}

/** Applies blog image gallery grouping and binds Fancybox. */
export function initBlogFancybox(
  root: ParentNode,
  fancybox: FancyboxLike,
): void {
  const body = root.ownerDocument?.body ?? (root as Document).body;
  if (body?.dataset.blogFancyboxInitialized) return;
  if (body) body.dataset.blogFancyboxInitialized = "true";

  const galleries = root.querySelectorAll<HTMLElement>("[data-gallery]");
  for (const container of galleries) {
    const gallery = container.dataset.gallery;
    if (!gallery) continue;

    const items = container.querySelectorAll('[data-fancybox="gallery"]');
    for (const el of items) {
      el.setAttribute("data-fancybox", gallery);
    }
  }

  fancybox.unbind?.("[data-fancybox]");
  fancybox.bind("[data-fancybox]", {
    closeExisting: true,
    Hash: false,
    Carousel: {
      transition: "crossfade",
      Thumbs: {
        type: "classic",
      },
    },
  });
}
