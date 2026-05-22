# AGENTS.md

Personal portfolio landing page (jimeh.me). Astro 6, TypeScript, CSS. Static
site deployed to GitHub Pages.

## Commands

```sh
mise run dev           # Portless Astro dev server
mise run build         # Production build
mise run preview       # Preview build
mise run test          # Unit tests
mise run lint          # ESLint + Stylelint + Markdownlint + mdxlint
mise run lint-fix      # Auto-fix lint issues
mise run lint-mdx      # MDX-aware lint checks via mdxlint
mise run check-content # Blog content invariant checks
mise run smoke         # Built-site smoke checks; run after build
mise run generate-blog-schema # Generate blog frontmatter JSON Schema
mise run format        # Prettier write
mise run format-check  # Prettier check + MDX lint
mise run typecheck     # astro check (TypeScript)
mise run check         # format:check + test + lint + content + typecheck
mise run fix           # format + lint-fix
mise run verify        # check + build + smoke
```

Husky runs `pnpm precommit` before commits. That executes `lint-staged` against
staged files first, then `pnpm check` across the whole project.

Node 24 and pnpm 11 are managed via mise. Prefer `mise run <task>` for common
workflows; use `pnpm` directly when you need package-manager details. No unit
tests are configured.

## Project Map

- Local development and validation: `docs/local-dev.md`
- Blog post writing guide and authoring features: `docs/blog-content.md`
- Styling, theme tokens, and shared UI primitives: `docs/styling.md`
- Harness checks and CI shape: `docs/harness.md`

## Patterns

- Page content: data-driven from typed exports. Grep `siteConfig`, `siteLinks`.
- Blog URLs: use `src/utils/blog-url.ts` helpers.
- Blog ordering: use `src/utils/blog-sort.ts` comparators.
- Blog page data helpers live in `src/utils/blog-page-data.ts`; page tests live
  in `src/page-tests`. Keep non-route helpers and tests out of `src/pages`
  because Astro treats `.ts` files there as routable endpoints.
- Blog tags are scoped by context: current posts, general archives, and named
  archives each have independent tag pages. Prefer broad tags that group
  multiple posts over one-off detail tags.
- Email: ROT13 obfuscation decoded client-side in `SiteLink.astro`.
- SEO: Open Graph, Twitter Card, JSON-LD via `SEOHead.astro`.
- Markdown alerts: GitHub-style `> [!NOTE]` / `> [!WARNING]` through
  `remark-github-blockquote-alert`.
- Code highlighting: `rehype-pretty-code`; Astro's built-in Shiki is disabled.
- Code copy button: `CodeCopyButton.astro` clones an astro-icon template per
  code block and is always visible.
- Dead links: prefer Markdown links with the `dead+` scheme, e.g.
  `[label](dead+https://example.com/)`; use a Markdown title for custom tooltip
  text. If the original URL is unknown, use `dead+missing://slug`.
  `rehypeDeadLinks` renders these as inert dead-link spans.
- UI styling: prefer existing Tailwind utilities, variants, and design tokens
  before adding component-scoped CSS or hand-rolled selectors. Use built-in
  utilities for layout behavior such as floats, clears, pseudo-elements,
  spacing, and responsive states when they fit. For tooltip-like UI, follow the
  `ThemeToggle.astro` / `DeadLink.astro` pattern: `group`, absolute tooltip,
  `group-hover` + `group-focus-within`, `aria-describedby`, and
  `role="tooltip"`; avoid native `title` when a custom tooltip is rendered.

## Domain Concepts

- `SiteConfig`: site metadata, author info, ROT13-encoded email, social profile
  URLs.
- `SiteLink`: typed entry for each home page link: name, URL, icon, optional
  `rel`.

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
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 10080`, so pnpm will avoid
  resolving package versions published less than seven days ago as a
  supply-chain hardening measure.
- MDX `Image` accepts remote HTTPS URLs by passing `inferSize` to Astro's image
  pipeline. Keep `astro.config.ts` `image.remotePatterns` aligned with that;
  non-remote string sources still need explicit `width` and `height`.
- Astro frontmatter helpers should not return JSX/TSX. `astro check` can pass,
  but `astro build` fails during Vite/esbuild parsing; keep render branches in
  template markup or extract a component.
- Imported SVGs can go through Astro's image pipeline when
  `image.dangerouslyProcessSVG` is enabled, but first run `pnpm optimize:svg`.
  The project SVGO plugin removes Illustrator fallback markup and both external
  and embedded raster masks that can change SVG transparency/backgrounds.
- Shared VS Code settings live in `.vscode/settings.shared.json`. Local
  `.vscode/settings.json` may be ignored and should not be treated as the shared
  source.
- Historical WordPress dump imports should prefer `zydev_blog` over
  `zhuoqe_blog`: the zhuoqe published posts are duplicated by old post ID in
  zydev, and some zhuoqe text has mojibake. Check imported HTML for hacked
  WordPress residue; zydev published post ID 132 contains hidden spam/iframe
  markup in the dump.
- The historical `tmp/uploads` WordPress upload dump contains a malicious
  obfuscated PHP web shell at `2009/09/827051.php`; never import executable
  files from that tree. The legitimate post assets are images/zips referenced
  through the SQLite `canonical_post_assets` view.
- Chromium-family browsers can report dark CSS backgrounds correctly while
  rendered pixels sample lighter. If macOS Digital Color Meter is set to sRGB
  and Firefox/Safari show `#0a0a0a` while Chrome/Arc show `#0f0f0f`, suspect
  Chromium content darkening or GPU/display color pipeline rather than app CSS:
  a standalone static page with literal `#0a0a0a` panels and no Tailwind/Astro
  classes also rendered as `#0f0f0f` in Chrome/Arc on affected displays.
- MDX `Image.astro` responsive `sizes` hints are coupled to the default blog
  layout width: `BlogLayout.astro` defaults to `width="3xl"` with `px-6`, making
  the content column 720px at a 768px outer breakpoint. Update those constants
  if the default layout width or horizontal padding changes.
- If markdownlint is re-enabled for `.mdx`, blog MDX components must be listed
  in `.markdownlint-cli2.yaml` under `MD033.allowed_elements`; otherwise
  markdownlint treats component tags as inline HTML.
- Markdown and MDX linting are split: `markdownlint-cli2` handles `.md` only,
  while `mdxlint` handles `.mdx` with MDX-aware JSX rules. Prettier formats
  `.mdx`; do not use mdxlint or remark-stringify as a formatter because they can
  collapse multiline MDX components and rewrite historical imported posts.
- `mdxlint` emits 80-character line-length warnings but currently runs without
  `--frail`, so historical archive line-width warnings are advisory until those
  posts are intentionally wrapped.
- After renaming content files between `.mdx` and `.md`, clear both `.astro` and
  `node_modules/.astro`; Astro's content data store can otherwise keep stale
  deferred module paths and break `astro build`.
- Vitest covers both `src/**/*.test.ts` and `scripts/**/*.test.ts`. Import
  scripts that expose helper functions for tests should guard `main()` with an
  `import.meta.url` / `pathToFileURL(process.argv[1])` check so importing them
  does not start network, SQLite, or filesystem import work.
- Astro container page tests do not reliably provide `Astro.site` for every
  route context. For post-page render tests, use a fixture post that avoids
  image-derived OG URL generation, or cover the URL-building branch through a
  smaller helper.
- With Astro `ClientRouter`, keep Fancybox `Hash: false` for blog images.
  Fancybox hash cleanup triggers Astro history/hash handling during close, which
  can remove the lightbox DOM before the thumbnail return animation completes.
