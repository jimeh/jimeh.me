# Local Development

Node 24 and pnpm 11 are managed by mise. Prefer `mise run <task>` for common
workflows so local work matches CI.

```sh
mise run install       # Install dependencies
mise run dev           # Portless Astro dev server
mise run build         # Production build
mise run preview       # Preview build
mise run test          # Unit tests
mise run check         # Format, test, lint, content, and type checks
mise run verify        # Full local/CI verification
```

`mise run dev` wraps `astro dev` with Portless on proxy port 1355, giving the
site a stable URL:

```text
https://jimeh-me.localhost:1355
```

Linked git worktrees get branch-prefixed subdomains automatically. To bypass
Portless, run:

```sh
PORTLESS=0 mise run dev
```

There are no unit tests configured. The feedback loop is linting, Astro type
checking, content invariants, production build, and built-site smoke checks.
