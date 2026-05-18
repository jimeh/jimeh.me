interface FancyboxLike {
  bind(selector: string, options: unknown): void;
}

/** Applies blog image gallery grouping and binds Fancybox. */
export function initBlogFancybox(
  root: ParentNode,
  fancybox: FancyboxLike,
): void {
  const galleries = root.querySelectorAll<HTMLElement>("[data-gallery]");
  for (const container of galleries) {
    const gallery = container.dataset.gallery;
    if (!gallery) continue;

    const items = container.querySelectorAll('[data-fancybox="gallery"]');
    for (const el of items) {
      el.setAttribute("data-fancybox", gallery);
    }
  }

  fancybox.bind("[data-fancybox]", {
    Carousel: {
      transition: "crossfade",
      Thumbs: {
        type: "classic",
      },
    },
  });
}
