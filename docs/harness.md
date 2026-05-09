# Harness

This repository aims for a small, executable agent harness:

- Root `AGENTS.md` is the map.
- `docs/` contains deeper source-of-truth notes.
- `mise run check` validates source state.
- `mise run verify` validates source state plus production build output.
- CI runs the same verification command as local development.
- CI uses mise for tool setup and an explicit GitHub Actions cache for the pnpm
  store.

## Checks

Source checks:

```sh
mise run check
```

Full local/CI checks:

```sh
mise run verify
```

Built-site smoke checks require `dist/`, so run them after a build:

```sh
mise run build
mise run smoke
```

## Durable Invariants

The custom content check protects blog rules that are easy for agents to miss:

- post directories use `YYYY-MM-DD-slug`;
- each post has exactly one `index.md` or `index.mdx`;
- frontmatter has `title`, `description`, and matching `date`;
- `updatedDate` is not earlier than `date`;
- tags are inline arrays of lowercase slugs;
- local frontmatter images and MDX static imports exist.

The built-site smoke check protects the static deploy surface:

- root, blog, tag, RSS, sitemap, favicon, and profile image outputs exist;
- every post has canonical and legacy built pages;
- every post appears in RSS and sitemap with its canonical URL;
- year and tag archive pages exist.
