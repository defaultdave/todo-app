# Todo App

A simple todo web app with file-based (localStorage) memory.

## Quick Start

```bash
pnpm install
pnpm dev
```

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Vite | Build tool / dev server |
| React 19 | UI framework |
| TypeScript | Language (strict mode) |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Zustand | State management (with persist middleware) |
| localStorage | Data persistence |
| Vitest | Unit testing |
| Playwright | E2e testing |
| @axe-core/playwright | Accessibility testing |
| pnpm | Package manager |

## Project Structure

```
src/
  components/     # UI components (shadcn/ui + custom)
  hooks/          # Custom React hooks
  lib/            # Business logic, utilities
  stores/         # Zustand stores
  types/          # TypeScript type definitions
  App.tsx         # Root component
  main.tsx        # Entry point
e2e/              # Playwright e2e tests
```

## Development Guidelines

Tier: **Full Project [F]** -- See dev-team `memory/templates/tiers/full-project.md` for full standards.

- TypeScript strict mode, no `any`
- TDD -- write tests alongside code
- Playwright e2e tests for user flows
- Accessibility testing with @axe-core/playwright
- Husky pre-commit hooks (lint, format, typecheck)
- PR quality gate: typecheck, lint, test, test:e2e
- Feature-based folder structure
- DRY: extract shared logic at 2+ occurrences
- Lean code -- no dead code, unused imports, or over-abstraction
- Color contrast WCAG AA compliance
- `prefers-reduced-motion` support
- Semantic HTML elements
- Keyboard navigation for all interactive elements

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server (port 5173) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Run Prettier |
| `pnpm typecheck` | TypeScript type check |

## Testing

- **Unit tests:** Vitest with @testing-library/react. Colocate with source files (`*.test.tsx`).
- **E2e tests:** Playwright in `e2e/` directory. Test user flows, not implementation.
- **Accessibility:** @axe-core/playwright in e2e tests. Every page must pass axe scan.
- **Quality gate:** `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`

## Key Patterns

- **State:** Zustand store with `persist` middleware for localStorage sync
- **Components:** shadcn/ui primitives composed into app-specific components
- **Validation:** Zod schemas for todo data shapes
- **Error handling:** Discriminated unions for Result types

## Agent Notes

- Working directory: `/Users/davidfleming/Workspace/todo-app`
- Dev-team memory: `/Users/davidfleming/Workspace/dev-team/memory/`
- Project memory: `/Users/davidfleming/Workspace/dev-team/memory/projects/todo-app/`
