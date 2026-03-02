# Contributing

## Setup

```sh
npm install
just dev        # start with hot reload
```

Requires Node.js 20+ and an [Anthropic API key](https://console.anthropic.com/). Install [just](https://github.com/casey/just) for the convenience commands (optional but recommended).

---

## Dev Commands

| Command | What it does |
|---|---|
| `just dev` | Start with hot reload |
| `just test` | Run unit tests |
| `just test-watch` | Run tests in watch mode |
| `just typecheck` | Type-check all TypeScript |
| `just lint` | Run ESLint |
| `just format` | Auto-format with Prettier |
| `just build` | Production build |
| `just db-generate` | Generate migrations after schema changes |
| `just db-migrate` | Apply pending migrations |
| `just db-studio` | Open Drizzle Studio (DB browser) |

Before opening a PR, run `just typecheck`, `just lint`, and `just test`. All must pass.

---

## Architecture

This is an Electron app. The renderer (React) has no access to Node.js or Electron APIs — all file system access, database queries, and AI calls happen in the main process and are invoked through a typed IPC bridge (`window.api`).

Key boundaries:
- **Renderer → Main:** via `window.api` (defined in `src/preload/index.ts`)
- **Anthropic API:** called from `src/main/ai/index.ts` only — never from the renderer
- **Database:** SQLite via Drizzle ORM, accessed through `getDb()` from `src/main/db/index.ts`
- **Shared types:** everything in `src/shared/types.ts` — don't define models or IPC types elsewhere

See [`docs/design.md`](docs/design.md) for the full architecture and feature spec, and [`docs/plan.md`](docs/plan.md) for the phased implementation order.

---

## Code Organization

```
src/
  main/           # Electron main process
    ai/           # Anthropic client
    backup/       # Backup/restore stub
    db/           # SQLite schema, migrations, getDb()
    export/       # PDF and DOCX export stub
    fs/           # FS helpers: data paths, atomicWriteJson, readMasterCV, etc.
    ingestion/    # Text extraction from PDF/DOCX/TXT
    ipc/          # IPC handler registration
  preload/        # contextBridge API surface
  renderer/src/
    components/   # Atomic Design: atoms / molecules / organisms / templates / pages
    store/        # Redux slices (settings, sessions, ui)
    hooks/        # Typed useAppDispatch / useAppSelector
  shared/
    types.ts      # All shared types
```

---

## Coding Standards

- **TypeScript strictly** — no `any`, no `@ts-ignore`. Fix the underlying type issue.
- **MUI for all UI** — use MUI components and the theme. Avoid raw CSS or inline styles unless MUI provides no alternative.
- **Atomic Design** — place components at the right level (`atoms` for primitives, `molecules` for small compositions, `organisms` for self-contained sections, etc.).
- **Redux for shared state** — use the existing slices. Don't pass state through long prop chains when a slice is the right fit.
- **Keep it simple** — don't add abstractions, configurability, or error handling for scenarios that can't happen. Solve the problem at hand.

---

## Testing

- **Unit tests (Vitest):** Business logic, DB queries, document parsing, IPC handlers. All Anthropic API calls must be mocked — no real AI calls in tests.
- **Component tests (Storybook + React Testing Library):** Component behavior. Every non-trivial component should have a story. Note: Storybook is not yet initialized — run `npx storybook@latest init` when you're ready to set it up.
- **E2E tests (Playwright):** Critical user flows — onboarding, generation, editing, export, session persistence.
- **Accessibility:** Linted automatically by `eslint-plugin-jsx-a11y`; axe checks run on every Storybook story via `@storybook/addon-a11y`.

New features need tests. Bug fixes should include a regression test where practical.

---

## Design Doc

[`docs/design.md`](docs/design.md) is the source of truth for how the product works. **Update it when you change behavior.** If a feature is added, modified, or removed, the design doc should reflect that in the same PR. If your implementation differs from what the doc says, either update the doc or call out the deviation explicitly in your PR description.
