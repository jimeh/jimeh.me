import { describe, expect, test } from "vitest";

import { postImageNoLightbox } from "./post-image-lightbox";

describe("postImageNoLightbox", () => {
  test("disables lightbox for automatic post images by default", () => {
    expect(postImageNoLightbox(undefined)).toBe(true);
  });

  test("preserves an explicit disabled lightbox setting", () => {
    expect(postImageNoLightbox(true)).toBe(true);
  });

  test("allows frontmatter to opt automatic post images into lightbox", () => {
    expect(postImageNoLightbox(false)).toBe(false);
  });
});
