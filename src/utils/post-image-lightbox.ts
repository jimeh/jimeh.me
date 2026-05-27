/**
 * Returns the no-lightbox setting for automatic post frontmatter images.
 */
export function postImageNoLightbox(noLightbox: boolean | undefined): boolean {
  return noLightbox ?? true;
}
