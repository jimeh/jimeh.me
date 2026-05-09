# Styling

CSS uses Tailwind CSS v4 through `@tailwindcss/vite`.

`src/styles/main.css` is the entry point. It imports semantic tokens,
`@tailwindcss/typography`, and vendor styles. Component-specific CSS stays next
to the component that owns it, such as `Figure.css` beside `Figure.astro`.

`src/styles/prose.css` is legacy and intentionally not imported.

## Theme Tokens

Semantic tokens live in `src/styles/tokens.css` using OKLCH:

- `--surface` / `--on-surface`: background and text colors.
- `--heading` / `--heading-muted`: heading colors.
- `--muted`: de-emphasized text through OKLCH alpha blending.
- `--accent`: interactive/highlight color.
- `--alert-{note,tip,important,warning,caution}`: Markdown alert colors.

Dark mode uses a `.dark` class on `<html>`, persisted in `localStorage`. Tokens
are exposed to Tailwind with `@theme inline`, and the custom variant is:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Components

Shared typography primitives live in `src/components/ui/`:

- `PageHeading`
- `MetaText`
- `NavTextLink`

Prefer these for blog list/detail surfaces so page typography stays consistent.

Icons use `astro-icon` with Iconify collections: `fa6-brands`, `fa6-solid`,
`heroicons`, and `octicon`.
