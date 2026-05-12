# AGENTS.md

Personal portfolio landing page (jimeh.me). Astro 6, TypeScript, CSS. Static
site deployed to GitHub Pages.

## Commands

```sh
mise run dev           # Portless Astro dev server
mise run build         # Production build
mise run preview       # Preview build
mise run lint          # ESLint + Stylelint + Markdownlint
mise run lint-fix      # Auto-fix lint issues
mise run check-content # Blog content invariant checks
mise run smoke         # Built-site smoke checks; run after build
mise run format        # Prettier write
mise run format-check  # Prettier check
mise run typecheck     # astro check (TypeScript)
mise run check         # format:check + lint + content + typecheck
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
- Email: ROT13 obfuscation decoded client-side in `SiteLink.astro`.
- SEO: Open Graph, Twitter Card, JSON-LD via `SEOHead.astro`.
- Markdown alerts: GitHub-style `> [!NOTE]` / `> [!WARNING]` through
  `remark-github-blockquote-alert`.
- Code highlighting: `rehype-pretty-code`; Astro's built-in Shiki is disabled.
- Code copy button: `CodeCopyButton.astro` clones an astro-icon template per
  code block and is always visible.

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
- MDX `Image` accepts remote HTTPS URLs by passing `inferSize` to Astro's image
  pipeline. Keep `astro.config.mjs` `image.remotePatterns` aligned with that;
  non-remote string sources still need explicit `width` and `height`.
- Astro frontmatter helpers should not return JSX/TSX. `astro check` can pass,
  but `astro build` fails during Vite/esbuild parsing; keep render branches in
  template markup or extract a component.
- Imported SVGs can go through Astro's image pipeline when
  `image.dangerouslyAllowSVG` is enabled, but first run `pnpm optimize:svg`. The
  project SVGO plugin removes Illustrator fallback markup and both external and
  embedded raster masks that can change SVG transparency/backgrounds.
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
