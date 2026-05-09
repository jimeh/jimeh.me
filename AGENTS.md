# AGENTS.md

Personal portfolio landing page (jimeh.me). Astro 5, TypeScript, CSS. Static
site deployed to GitHub Pages.

## Commands

```sh
mise run dev          # Portless Astro dev server
mise run build        # Production build
mise run preview      # Preview build
mise run lint         # ESLint + Stylelint
mise run lint-fix     # Auto-fix lint issues
mise run format       # Prettier write
mise run format-check # Prettier check
mise run typecheck    # astro check (TypeScript)
mise run check        # format:check + lint + typecheck
mise run fix          # format + lint-fix
mise run verify       # check + build
```

Node 24 and pnpm 11 are managed via mise. Prefer `mise run <task>` for common
workflows; use `pnpm` directly when you need package-manager details. No tests
configured.

`mise run dev` wraps `astro dev` with Portless on proxy port 1355, giving the
site a stable `https://jimeh.me.localhost:1355` URL without a sudo prompt.
Linked git worktrees get branch-prefixed subdomains automatically. To bypass
Portless, run `PORTLESS=0 mise run dev`.

## Patterns

- Page content: Data-driven from typed exports → grep `siteConfig`, `siteLinks`
- Blog URLs: Use `src/utils/blog-url.ts` helpers. Canonical post URLs are
  `/blog/:year/:slug/`; year archives live at `/blog/:year/`; legacy full-date
  URLs redirect via `astro.config.mjs`.
- Icons: astro-icon with Iconify collections (fa6-brands, fa6-solid, heroicons,
  octicon)
- Email: ROT13 obfuscation decoded client-side in `SiteLink.astro`
- CSS: Tailwind CSS v4 via `@tailwindcss/vite`. `main.css` is a thin entry point
  importing `tokens.css`, `@tailwindcss/typography`, and vendor styles. Legacy
  `src/styles/prose.css` is kept but not imported. Component CSS co-located as
  imports (e.g. `Figure.css` next to `Figure.astro`)
- UI primitives: `src/components/ui/` — `PageHeading`, `MetaText`, `NavTextLink`
  for consistent blog typography
- Dark mode: System/light/dark toggle, `.dark` class on `<html>`, state in
  localStorage
- Fonts: Open Sans variable font, self-hosted via Astro Fonts API (local
  provider)
- SEO: Open Graph, Twitter Card, JSON-LD (WebSite schema) via `SEOHead.astro`
- Markdown alerts: GitHub-style `> [!NOTE]` / `> [!WARNING]` etc. via
  `remark-github-blockquote-alert` remark plugin, rendered inside `.prose`
- Code highlighting: `rehype-pretty-code` (Shiki-based rehype plugin) with dual
  themes (`one-light` / `one-dark-pro`). Astro's built-in Shiki is disabled
  (`syntaxHighlight: false`). Supports inline highlighting
  (`` `code{:lang}` ``), line highlighting (` ```lang {1,3-5} `), word
  highlighting (` ```lang /word/ `), titles (` ```lang title="file.js" `), line
  numbers (` ```lang showLineNumbers `), and diff (`// [!code ++]` /
  `// [!code --]`)
- Code copy button: `CodeCopyButton.astro` uses a `<template>` with astro-icon
  (octicon) cloned per code block; always visible, no hover-to-show
- MDX media: percentage-sized `Figure`/`Image`/`YouTube` components can float
  with `position="left"` / `"right"`; add `overhang="50%"` to hang half the
  figure outside the content boundary on desktop. `overhang="outside"` or
  `overhang="100%"` places the figure fully outside with the normal text gutter;
  mobile ignores overhang.

## Blog Image Frontmatter

Image options in blog post frontmatter (`image:` field in content schema):

- `aspect`: CSS aspect-ratio string (e.g. `"16/9"`) — crops via
  `object-fit: cover`, does not distort
- `objectPosition`: CSS object-position (default `"center"`) — controls visible
  region when cropped; applies to blog post display, PostCard, and PostFeatured
  thumbnails
- `thumbnailFill`: `"fill"` (default, crops to fill) or `"full"` (shows entire
  image via `object-contain`) — only affects PostCard/PostFeatured thumbnails

## Domain Concepts

- `SiteConfig`: Site metadata, author info, ROT13-encoded email, social profile
  URLs
- `SiteLink`: Typed entry for each link on the page (name, url, icon, optional
  rel)

## CSS Theme

Semantic tokens in `src/styles/tokens.css` using OKLCH color space:

- `--surface` / `--on-surface`: Background and text colors
- `--heading` / `--heading-muted`: Heading colors
- `--muted`: De-emphasized text (oklch alpha blending)
- `--accent`: Interactive/highlight color (sky-based)
- `--alert-{note,tip,important,warning,caution}`: Alert type colors
- Dark overrides via `.dark { ... }` block, exposed to Tailwind via
  `@theme inline`
- Custom variant: `@custom-variant dark (&:where(.dark, .dark *))`

## Discoveries

- Blog post ordering must use shared comparators in `src/utils/blog-sort.ts`
  (`date` + `id`) to keep tie behavior consistent across blog index, tag pages,
  RSS, and prev/next navigation.
- Stylelint must treat Tailwind v4 `@plugin` as valid in `stylelint.config.mjs`
  for both `at-rule-no-unknown.ignoreAtRules` and
  `no-invalid-position-at-import-rule.ignoreAtRules`; otherwise CSS linting
  fails when `@plugin` appears between `@import` statements.
- In Astro 6 prerender chunks, `import.meta.url` points into `dist/`, so
  synchronous reads of `public/` assets from Astro components should resolve
  from `process.cwd()` instead.
- pnpm 11 uses `strictDepBuilds: true` by default. Keep reviewed dependency
  build scripts in `pnpm-workspace.yaml` `allowBuilds`; otherwise clean installs
  fail with `ERR_PNPM_IGNORED_BUILDS`.
- MDX `Image` accepts remote HTTPS URLs by passing `inferSize` to Astro's image
  pipeline. Keep `astro.config.mjs` `image.remotePatterns` aligned with that;
  non-remote string sources still need explicit `width` and `height`.
