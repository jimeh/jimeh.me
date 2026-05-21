# Blog Writing Guide

Blog posts live under `src/content/blog` as Markdown or MDX files:

```text
post-slug.md
post-slug/
  index.mdx
  image-or-local-asset.ext
```

Public URLs use `/blog/:year/:slug/`. The year comes from frontmatter `date`.
The slug comes from frontmatter `slug`, so files and folders can be reorganized
without changing canonical URLs.

The blog frontmatter JSON Schema is generated from the shared Zod definition in
`src/content/blog-schema.ts`:

```sh
mise run generate-blog-schema
```

Use `.md` for normal Markdown posts. Use `.mdx` when the body needs imported
media components such as `Image`, `ImageGrid`, or `YouTube`.

## Frontmatter

Required fields:

- `title`: post title.
- `description`: short summary for listings and metadata.
- `date`: `YYYY-MM-DD`.
- `slug`: URL slug. Slash-separated lowercase segments are allowed.

Optional fields:

- `updatedDate`: later revision date; must not be earlier than `date`.
- `tags`: inline array of lowercase tag slugs, e.g. `["macos", "apple"]`. Tags
  are site-wide and include archived posts; prefer broad labels that can group
  multiple posts.
- `image`: primary image rendered above the post unless hidden.

Image options:

- `src`: local relative image or supported remote HTTPS image. Use either a
  single source or a light/dark object:
  ```yaml
  src: ./hero.jpg
  ```
  ```yaml
  src:
    light: ./logo-light.svg
    dark: ./logo.svg
  ```
- `alt`: accessible text. Empty string is allowed for decorative legacy images.
- `caption`: visible caption.
- `size`: `default`, `wide`, `full`, or a percentage like `"50%"`.
- `position`: `center`, `left`, or `right`.
- `flush`: removes top margin so the image sits flush with content.
- `noLightbox`: disables Fancybox for this image.
- `gallery`: lightbox gallery group name.
- `aspect`: CSS aspect ratio string such as `"16/9"`.
- `objectPosition`: CSS object-position when `aspect` crops an image.
- `credit`: attribution object with `text`, optional `href`, and `position`.
- `hidden`: prevents automatic rendering at the top of the post body.
- `thumbnail`: optional listing thumbnail controls nested under `image`. If
  `image.thumbnail.src` is not set, the thumbnail uses `image.src`.
- `src`: optional thumbnail-specific source. Uses the same single-source or
  light/dark object shape as `image.src`.
- `fill`: `fill` crops thumbnails; `fit` contains the full image.
- `objectPosition`: CSS object-position for cropped thumbnails. Supports anchors
  like `top`, `bottom`, `left`, `right`, `center`, and percentages like
  `"50% 30%"`.
- `size`: image size inside thumbnail boxes, as a percentage. Values below
  `100%` add inset space; values above `100%` zoom/crop and request larger
  optimized image variants up to the source image width.
- `frame`: draws the listing thumbnail inside a bordered background. Use `true`
  for both themes, or `{ light: true, dark: false }` /
  `{ light: false, dark: true }` to control light and dark mode independently.

Example:

```yaml
---
title: "How to add Apple's new Liquid Glass icons to applications"
description: "Without Xcode, almost."
date: 2025-06-29
updatedDate: 2026-02-17
tags: ["macos", "macos26", "apple"]
image:
  src: ./hero.jpg
  alt: "Liquid Glass icon in Icon Composer"
  size: wide
  aspect: "16/9"
  objectPosition: center
  thumbnail:
    fill: fit
    size: 110%
---
```

## Syntax Highlighting

Code highlighting uses `rehype-pretty-code` with Shiki themes. Astro's built-in
Shiki highlighting is disabled in `astro.config.ts`.

Use normal fenced code blocks with a language:

````markdown
```js
function getStringLength(str) {
  return str.length;
}
```
````

Inline code can also be syntax-highlighted by adding a language after the code
span:

```markdown
The `getStringLength(str){:js}` function returns a string length.
```

Supported code block features:

- Line highlighting: ` ```js {1,3-5} `.
- Word highlighting: ` ```js /needle/ `.
- Titles: ` ```js title="scripts/example.js" `.
- Line numbers: ` ```js showLineNumbers `.
- Diff lines: add `// [!code ++]` or `// [!code --]` on changed lines.

## Markdown Features

GitHub-style blockquote alerts are supported:

```text
> [!NOTE]
> Useful context goes here.
```

Regular Markdown links, lists, headings, tables, and images work as expected.
For local post assets that need layout control, prefer MDX media components over
plain Markdown images.

## MDX Components

MDX media components are exported from `@mdx/index`:

```mdx
import { Download, Figure, Image, ImageGrid, YouTube } from "@mdx/index";
import hero from "./hero.webp";
```

The static import form is preferred for local image files because Astro can
infer dimensions and optimize the image. String `src` values are allowed for
remote HTTPS images and for public assets, but public string sources must
include explicit `width` and `height`.

### Image

```mdx
<Image
  src={hero}
  alt="Application icon preview"
  caption="Rendered icon preview"
  size="wide"
/>
```

Useful props:

- `size`: `default`, `wide`, `full`, or a percentage like `"50%"`.
- `position`: `center`, `left`, or `right`.
- `overhang`: percentage such as `"50%"`, or `"outside"` for floated media.
- `aspect`: CSS aspect ratio such as `"16/9"`.
- `objectPosition`: CSS object-position used when `aspect` crops the image.
- `caption`: visible caption text.
- `credit`: `{ text, href?, position? }`.
- `flush`: remove block margins.
- `gallery`: Fancybox gallery group.
- `noLightbox`: disable Fancybox wrapping.

`Image` and `Figure` components can float with `position="left"` or
`position="right"`. Without a percentage `size`, the floated figure shrinks to
the intrinsic width of its content, which works well for small icons and
thumbnails. Use `size="50%"` for proportional floats.

Use `overhang="50%"` to hang half a percentage-sized figure outside the content
boundary on desktop. `overhang="outside"` and `overhang="100%"` place the figure
fully outside with the normal text gutter; mobile ignores overhang. Centered
percentages above `100%`, such as `size="120%"`, expand outside the content
column like `wide`, capped to the viewport with the normal page gutter.

Wrap a normal fenced code block in `Figure` when it needs the same layout
controls. The code block still goes through `rehype-pretty-code` and keeps the
standard syntax highlighting and copy button behavior:

````mdx
<Figure size="120%">

```js
function getStringLength(str) {
  return str.length;
}
```

</Figure>
````

### ImageGrid

Use `ImageGrid` for grouped galleries:

```mdx
import { Image, ImageGrid } from "@mdx/index";
import v1 from "./v1.webp";
import v2 from "./v2.webp";

<ImageGrid columns={2} size="wide" caption="Website versions">
  <Image src={v1} caption="v1.0" />
  <Image src={v2} caption="v2.0" />
</ImageGrid>
```

Useful props:

- `columns`: number of grid columns; defaults to `2`.
- `gap`: CSS gap value; defaults to `1rem`.
- `size`: `default`, `wide`, `full`, or a percentage.
- `caption`: grid-level caption.
- `gallery`: Fancybox gallery group applied to child figures.

### YouTube

Use `YouTube` for responsive privacy-enhanced embeds:

```mdx
import { YouTube } from "@mdx/index";

<YouTube
  src="https://www.youtube.com/watch?v=ea6UuRTjkKs"
  title="Extra Credits video"
  caption="Extra Credits on reward schedules"
  size="wide"
/>
```

`src` can be a normal YouTube URL, `youtu.be` URL, embed URL, shorts URL, or a
bare video ID. The component renders through `youtube-nocookie.com`.

### Download

Use `Download` for local post attachments that should be emitted by Astro's
asset pipeline:

```mdx
import { Download } from "@mdx/index";
import archive from "./archive.zip?url&no-inline";

<Download href={archive} filename="archive.zip">
  archive.zip
</Download>
```

The `?url&no-inline` import returns the built asset URL, prevents tiny files
from becoming `data:` URLs, and makes the build fail if the source file is
missing. The `filename` prop is passed to the browser's `download` attribute.

### Dead Links

Use the `dead+` URL scheme for historical links that should read like the
original link text but must not navigate anywhere because the target is gone:

```md
[old download](dead+http://example.com/old-download.zip)
```

For URL-as-label prose, angle-bracket autolinks work too. The rendered text
omits the `dead+` prefix:

```md
<dead+http://example.com/old-download.zip>
```

The original `href` is kept only as build output metadata. It is not rendered as
a clickable destination. Hovering or focusing the text shows the default
dead-link message; use the Markdown link title to customize it:

```md
[old download](dead+http://example.com/old-download.zip "This archive is gone.")
```

If the original URL is unknown, use a `dead+missing://` placeholder with a short
slug, for example `[details](dead+missing://details)`.

## Checks

Run content invariants with:

```sh
mise run check-content
```

The check verifies dated directory naming, required frontmatter, date matching,
tag format, local image/thumbnail source assets, and local MDX static imports.
