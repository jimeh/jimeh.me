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

- blog posts are discovered from all `.md` and `.mdx` files under
  `src/content/blog`;
- frontmatter has `title`, `description`, `date`, and `slug`;
- derived canonical routes are unique;
- `updatedDate` is not earlier than `date`;
- tags are inline arrays of lowercase slugs;
- local frontmatter images and MDX static imports exist.

The built-site smoke check protects the static deploy surface:

- root, blog, tag, RSS, sitemap, favicon, and profile image outputs exist;
- every post has a canonical built page at `/blog/:year/:slug/`;
- main posts appear in RSS, while archived posts are omitted;
- every post appears in the sitemap with its canonical URL;
- year, current tag, archive, and archive tag pages exist.
