# Deliberate

A small decision-making tool: weigh options against criteria and get a ranked result.

## Features

- **Setup** – define categories (criteria) and options. Category order sets weight: top = highest (auto-calculated 1–5).
- **Score** – rate each option 1–5 against every category.
- **Results** – options ranked by weighted sum (`Σ rating × weight`), shown as a list or table.

## Stack

Vue 3 (`<script setup>`), TypeScript, Vite, Pinia, Vue Router, VueUse, Tailwind CSS v4. Tests: Vitest. Lint/format: ESLint, Oxlint, Prettier. Package manager: Bun.

## Development

```sh
bun install
bun dev            # dev server
bun run build      # type-check + production build
bun test:unit      # unit tests
bun lint           # oxlint + eslint
bun run format     # prettier
```

A Husky + lint-staged pre-commit hook runs on commit.

## CI & Deployment

Workflows in `.github/workflows/`:

- `deploy.yml` – on push to `main`: install (`bun install --frozen-lockfile`), type-check, unit tests, build, then publish `dist/` to GitHub Pages. Deploy only runs if all prior steps pass.
- `claude-code-review.yml` – automated Claude review on every PR.
- `claude.yml` – responds to `@claude` mentions in issues and PRs.

Pages details:

- Served at `/deliberate/` (`base` in `vite.config.ts`).
- `index.html` is copied to `404.html` so client-side routes survive a refresh.
- Repo setting required: **Settings → Pages → Source: GitHub Actions**.
- Claude workflows need the `CLAUDE_CODE_OAUTH_TOKEN` repo secret.
