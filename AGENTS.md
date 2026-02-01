# AGENTS.md

Personal portfolio landing page (jimeh.me). Astro 5, TypeScript, CSS.
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
pnpm typecheck    # astro check (TypeScript)
pnpm check        # format:check + lint + typecheck
```

pnpm and Node 24 managed via mise. No tests configured.

## Patterns

- Page content: Data-driven from typed exports → grep `siteConfig`, `siteLinks`
- Icons: astro-icon with Iconify collections (fa6-brands, fa6-solid, heroicons)
- Email: ROT13 obfuscation decoded client-side in `SiteLink.astro`
- CSS: Tailwind CSS v4 via `@tailwindcss/vite`, semantic color tokens in `src/styles/main.css`
- Dark mode: System/light/dark toggle, `.dark` class on `<html>`, state in localStorage
- Fonts: Open Sans variable font, self-hosted via Astro experimental fonts API (local provider)
- SEO: Open Graph, Twitter Card, JSON-LD (WebSite schema) via `SEOHead.astro`

## Domain Concepts

- `SiteConfig`: Site metadata, author info, ROT13-encoded email, social profile URLs
- `SiteLink`: Typed entry for each link on the page (name, url, icon, optional rel)

## CSS Theme

Semantic tokens in `src/styles/main.css` using OKLCH color space:

- `--surface` / `--on-surface`: Background and text colors
- `--heading` / `--heading-muted`: Heading colors
- `--muted`: De-emphasized text (oklch alpha blending)
- `--accent`: Interactive/highlight color (sky-based)
- Dark overrides via `.dark { ... }` block, exposed to Tailwind via `@theme inline`
- Custom variant: `@custom-variant dark (&:where(.dark, .dark *))`
