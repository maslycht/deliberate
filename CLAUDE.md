# Deliberate

A decision-making tool built with Vue 3. This is a rewrite of the original single-file React artifact "Decision Matrix" into a properly structured, maintainable codebase.

## Reference

The original React artifact is preserved at `reference/original-artifact.tsx` for parity checks during the rewrite. **This file should be removed once all functionality has been fully translated.**

## Tech Stack

- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **Language:** TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v4 + custom design tokens in `src/assets/main.css`
- **State Management:** Pinia
- **Routing:** Vue Router
- **Utilities:** VueUse
- **Testing:** Vitest + @vue/test-utils (JSDOM)
- **Linting:** ESLint + Oxlint
- **Formatting:** Prettier
- **Git Hooks:** Husky + lint-staged (pre-commit)
- **Package Manager:** Bun

## Project Structure

```
src/
  main.ts                 # App entry point
  App.vue                 # Root component (app shell, header, tab navigation)
  router/index.ts         # Vue Router — routes: /, /score, /results
  stores/                 # Pinia stores (counter.ts is a scaffold placeholder — decision matrix store TBD)
  views/                  # Page-level components (one per route)
    SetupView.vue         # Categories & options management
    ScoringView.vue       # Score each option against categories
    ResultsView.vue       # Ranked results (list + table views)
  components/ui/          # Reusable UI primitives
    AppButton.vue         # Button (variants: primary/ghost, sizes: normal/small)
    AppInput.vue          # Text input with v-model
    AppTextarea.vue       # Textarea with v-model
    ScorePicker.vue       # 1–5 rating selector
    ViewToggle.vue        # List/Table view toggle
    SectionHeader.vue     # Section title + subtitle
    AppPlaceholder.vue    # Placeholder with icon + message
    EmptyState.vue        # Empty state with dashed border
  assets/main.css         # Tailwind + design system theme variables
  __tests__/              # Unit tests (co-located with src, not views/)
```

## Design System

Defined as CSS custom properties in `src/assets/main.css` (mapped to Tailwind theme):

- **Colors:** canvas, surface, surface-subtle, line, ink, ink-muted, accent (#c85c2d), success (#3d8a5f)
- **Fonts:** display (Playfair Display), sans (DM Sans), mono (DM Mono)

In templates, use Tailwind utility classes (`bg-accent`, `text-ink-muted`, `border-line`, etc.) rather than raw CSS variables. The `@theme` block in `main.css` registers tokens under a `--color-*` / `--font-*` prefix so Tailwind resolves them, but templates should never reference `var(--accent)` directly.

## Key Concepts

- **Categories** (criteria): ordered list; position determines weight (top = highest, auto-calculated 1–5)
- **Options** (items): things being compared; each gets scored against every category (1–5)
- **Scoring:** weighted sum — `total = Σ(rating × weight)` — determines ranking
- **Weight formula:** `weight(i) = max(1, min(5, 5 - floor(i * 4 / (n - 1))))` for n > 1

## Commands

- `bun dev` — start dev server
- `bun run build` — type-check + production build
- `bun test:unit` — run unit tests
- `bun lint` — run oxlint + eslint
- `bun run format` — format with prettier

## Deployment

GitHub Pages via `.github/workflows/deploy.yml`, base path `/deliberate/`.
