# AGENTS.md

Personal portfolio landing page (jimeh.me). Astro 5, TypeScript, SCSS.
Static site deployed to GitHub Pages.

## Commands

```sh
pnpm dev          # Dev server
pnpm build        # Production build
pnpm preview      # Preview build
pnpm lint         # ESLint + Stylelint
pnpm lint:fix     # Auto-fix lint issues
pnpm format       # Prettier write
pnpm format:check # Prettier check
pnpm check        # format:check + lint
```

pnpm and Node 24 managed via mise. No tests configured.

## Patterns

- Page content: Data-driven from typed exports → grep `siteConfig`, `siteLinks`
- Icons: astro-icon with Iconify collections → grep `Icon`, `fa6-brands`, `fa6-solid`
- Email: ROT13 obfuscation decoded client-side → grep `rot13`
- SCSS: Modern module system (`@use` not `@import`), namespaced access (e.g. `setup.$brand-color`)
- Fonts: Google Fonts (Open Sans, Open Sans Condensed) loaded via `<link>` tags in layout

## Domain Concepts

- `SiteLink`: Typed entry for each link on the page (name, url, icon, optional rel/type)
- `SiteConfig`: Site metadata, author info, ROT13-encoded email, social profile URLs
