# Blog Content

Blog posts live under `src/content/blog` as dated directories:

```text
YYYY-MM-DD-post-slug/
  index.md
  image-or-local-assets.ext
```

The directory date and frontmatter `date` must match. Canonical public URLs use
`/blog/:year/:slug/`; legacy full-date URLs are still generated and redirected
from `astro.config.mjs`.

## Frontmatter

Required fields:

- `title`: post title.
- `description`: short summary for listings and metadata.
- `date`: `YYYY-MM-DD`, matching the directory prefix.

Optional fields:

- `updatedDate`: later revision date; must not be earlier than `date`.
- `tags`: inline array of lowercase tag slugs, e.g. `["macos", "apple"]`.
- `image`: primary image rendered above the post unless hidden.

Image options:

- `src`: local relative image or supported remote HTTPS image.
- `alt`: accessible text. Empty string is allowed for decorative legacy images.
- `caption`: visible caption.
- `size`: `default`, `wide`, `full`, or a percentage like `"50%"`.
- `position`: `center`, `left`, or `right`.
- `flush`: removes top margin so the image sits flush with content.
- `noLightbox`: disables Fancybox for this image.
- `gallery`: lightbox gallery group name.
- `thumbnailFill`: `fill` crops thumbnails; `full` contains the full image.
- `aspect`: CSS aspect ratio string such as `"16/9"`.
- `objectPosition`: CSS object-position when `aspect` crops an image.
- `credit`: attribution object with `text`, optional `href`, and `position`.
- `hidden`: prevents automatic rendering at the top of the post body.

MDX posts can import media components from `@mdx/index`. Percentage-sized
`Figure`/`Image`/`YouTube` components can float with `position="left"` or
`position="right"`. Use `overhang="50%"` to hang half the figure outside the
content boundary on desktop. `overhang="outside"` and `overhang="100%"` place
the figure fully outside with the normal text gutter; mobile ignores overhang.

## Checks

Run content invariants with:

```sh
mise run check-content
```

The check verifies dated directory naming, required frontmatter, date matching,
tag format, local `image.src` assets, and local MDX static imports.
