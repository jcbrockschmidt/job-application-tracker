# Claude Code — Project Instructions

## Project

Job Application Kit is an Electron + React + TypeScript desktop app. Users paste job descriptions and get tailored resumes and cover letters generated from their Master CV via the Anthropic API.

See [`docs/design.md`](docs/design.md) for the full product and architecture specification.

---

## Hard Architecture Rules

These are non-negotiable. Do not violate them.

- **Anthropic API calls happen in the main process only** — never in the renderer, never in a preload script. All AI calls go through `src/main/ai/index.ts`.
- **The renderer has zero Node/Electron access** — all IPC goes through `window.api` (the `contextBridge` surface defined in `src/preload/index.ts`). Never import `electron` or Node built-ins in renderer code.
- **All shared types live in `src/shared/types.ts`** — do not define model types, IPC types, or document schemas elsewhere.
- **Database access goes through `getDb()`** — import from `src/main/db/index.ts`. Never import the `db` instance directly.
- **File system access goes through `src/main/fs/index.ts`** — use `getDataPaths()`, `getSessionDir()`, `readMasterCV()`, etc. Do not scatter raw `fs` calls across IPC handlers.
- **Atomic writes for JSON files** — always use `atomicWriteJson()` from `src/main/fs/index.ts` when writing `master-cv.json` or `writing-profile.json`. Never use a plain `writeFileSync` on these files.
- **API key lives in the OS keychain** — read and write it via `keytar` (key name: `job-application-kit`, account: `anthropic-api-key`). Never write the API key to a plain file.
- **IPC handlers are registered in `src/main/ipc/index.ts`** — add new channels there, not scattered across files.
- **IPC channels are named `namespace:action`** — e.g. `settings:get`, `masterCV:save`, `generate:resume`. Match the pattern already established in `src/preload/index.ts`.
- **Never call AI APIs from tests** — mock all Anthropic SDK calls. Tests must be deterministic and fast.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/shared/types.ts` | All shared types: models, IPC surface (`WindowAPI`), document schemas |
| `src/main/ipc/index.ts` | IPC handler registration |
| `src/main/db/schema.ts` | Drizzle schema — edit this, then run `just db-generate` |
| `src/main/db/index.ts` | DB init + `getDb()` getter |
| `src/main/ai/index.ts` | Anthropic client factory |
| `src/main/fs/index.ts` | FS helpers: `getDataPaths()`, `getSessionDir()`, `atomicWriteJson()`, `readMasterCV()`, `writeMasterCV()` |
| `src/main/ingestion/index.ts` | Text extraction from PDF/DOCX/TXT (needs `pdf-parse` + `mammoth` installed before implementing) |
| `src/main/export/index.ts` | PDF and DOCX export stub |
| `src/main/backup/index.ts` | Backup/restore stub |
| `src/preload/index.ts` | `contextBridge` API — mirrors IPC channels |
| `src/renderer/src/store/index.ts` | Redux store (settings, sessions, ui slices) |
| `src/renderer/src/hooks/index.ts` | Typed `useAppDispatch` / `useAppSelector` |

## Path Aliases

- `@shared/*` → `src/shared/*` (all processes)
- `@renderer/*` → `src/renderer/src/*` (renderer only)

---

## Before Writing Code

1. Read the relevant section of `docs/design.md` to understand intent before implementing.
2. Check `docs/plan/` for the phased implementation order — it maps each IPC handler to a phase and describes sequencing dependencies.
3. Check `src/shared/types.ts` for existing types before defining new ones.
4. Check whether an IPC channel already exists in `src/preload/index.ts` before adding one.

---

## Coding Conventions

- **TypeScript strictly** — no `any`, no `// @ts-ignore`. Fix the type, don't suppress it.
- **Atomic Design for components** — `atoms → molecules → organisms → templates → pages` under `src/renderer/src/components/`. Place new components at the appropriate level.
- **MUI for all UI** — use MUI components and the theme system. Don't write raw CSS or inline styles unless MUI provides no other way.
- **Redux for cross-component state** — use the existing slices (`settingsSlice`, `sessionsSlice`, `uiSlice`). Don't lift state through prop chains when Redux is appropriate.
- **No over-engineering** — don't add abstractions, helpers, or utilities that aren't immediately needed. Three similar lines is better than a premature abstraction.
- **No backwards-compatibility shims** — if something is unused, delete it.

---

## Dev Tools

Run these before considering any change done:

```sh
just typecheck   # Type-check all TypeScript
just lint        # ESLint
just format      # Prettier (auto-fixes)
just test        # Vitest unit tests
```

All four must pass cleanly. Fix errors — don't suppress them.

---

## Testing Standards

- **Unit tests (Vitest):** Business logic, DB queries (in-memory SQLite), document parsing, IPC handlers. Mock all Anthropic SDK calls.
- **Component tests (Storybook + React Testing Library):** Component behavior at the story level; use RTL for focused isolated tests.
- **E2E tests (Playwright):** Critical flows — onboarding, generation, editing, export, session persistence.
- **Accessibility:** `eslint-plugin-jsx-a11y` catches issues at lint time; `@storybook/addon-a11y` runs axe on every story.

New features need tests. Bug fixes should include a regression test where practical.

### Unit test file structure

`src/test/unit/` mirrors the source tree. Place each test file in the subdirectory that matches the module under test:

| Source module | Test location |
|---------------|---------------|
| `src/main/db/*` | `src/test/unit/db/` |
| `src/main/fs/*` | `src/test/unit/fs/` |
| `src/main/ipc/*` | `src/test/unit/ipc/` |
| `src/main/ingestion/*` | `src/test/unit/ingestion/` |
| `src/main/utils/*` | `src/test/unit/utils/` |
| `src/renderer/src/*` | `src/test/unit/renderer/` |

### Test integrity rules

- **Tests are written to fit the spec, not the code** — if a test and the implementation disagree, fix the implementation, not the test.
- **Never disable or skip tests to make a build pass** — a skipped test is a hidden bug. Only skip a test if it has become genuinely irrelevant (e.g. the feature it covered was removed), and delete it rather than leaving it skipped.
- **Never reduce test coverage or assertion strength to make tests pass** — weakening a test to avoid a failure is the same as deleting it.
- **Never disable lint rules to solve a problem** — fix the underlying issue instead. Inline `eslint-disable` comments are not acceptable unless the rule is provably wrong for that specific case and a comment explains why.

---

## Design Doc

`docs/design.md` is the source of truth for product behavior and architecture. **Keep it current.** When a feature is added, changed, or removed, update the design doc in the same PR. If implementation deviates from the design doc, either update the doc to reflect the new decision or flag the deviation explicitly.
