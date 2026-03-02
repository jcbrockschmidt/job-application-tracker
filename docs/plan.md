# Job Application Kit — Implementation Plan

Phases are ordered by priority. Complete each phase before moving to the next.
Sub-bullets are implementation notes, not separate tasks.

Current state: scaffolding complete; all IPC handlers are stubs throwing "Not implemented".

---

## Phase 1 — MVP: Core Application Loop

The minimum to go end-to-end: onboard → ingest resume → generate tailored resume → edit → export PDF.

### 1.1 Infrastructure

- [x] **DB: initial migration** — run `just db-generate` and `just db-migrate`; verify `app.db` initializes correctly at `<userData>/data/app.db` on first launch
- [x] **Add `spendLog` table to schema** — columns: `id`, `timestamp` (integer/timestamp), `model`, `inputTokens`, `outputTokens`, `estimatedCostUsd`; regenerate and apply migration
- [x] **Settings persistence** — implement `settings:get` and `settings:save`: API key in OS keychain via `keytar`; everything else in `settings.json` in userData
- [x] **File system helpers** — utility to create/ensure the data directory tree on first launch: `/data/`, `/data/applications/`, `/data/source-documents/`
- [x] **App shell layout** — render the full CSS grid (topbar, sidebar, main area, status bar) matching the mockup; wire sidebar nav buttons to the `uiSlice` `activePage`; render the correct page component per active page

### 1.2 Onboarding

- [x] **Onboarding overlay** — shown on launch when `onboardingComplete === false`; four-step wizard (MUI Stepper) rendered over the app shell; closes on "Get Started" or after step 4
- [x] **Step 1 — API key** — masked text input + Validate button; calls `settings:validateApiKey`; inline error on failure; advances only on success; persists key to keychain
- [x] **Step 2 — Contact info** — required: full name, phone, email; optional: LinkedIn URL, GitHub URL; calls `settings:save` on Next; inline validation
- [x] **Step 3 — Upload resume** — file picker restricted to PDF, DOCX, TXT; required to advance; on select calls `docs:ingest`; shows progress spinner while ingesting; inline error on failure
- [x] **Step 4 — Upload cover letter** — same file picker pattern; optional; Skip button available; "Get Started" sets `onboardingComplete = true` and dismisses overlay
- [x] **`settings:validateApiKey` IPC** — make a minimal Anthropic API call (e.g. list models) to confirm the key works; return `true`/`false`

### 1.3 Document Ingestion

- [x] **Text extraction** — integrate `pdf-parse` (PDF) and `mammoth` (DOCX) in main process; handle errors: image-only PDF, corrupt file, password-protected PDF (return typed errors, not throws)
- [x] **`docs:ingest` IPC** — extract raw text from uploaded file; send to Claude with a prompt to output structured data in `master-cv.json` schema, with per-bullet `id` (nanoid), `source: "ingested"`, `sourceLabel` (filename + date), `usedIn: []`; write result to `master-cv.json` (merge with existing, matching on company + title); record source doc in `source_docs` table; return `SourceDoc`
- [x] **Master CV file I/O** — helper functions: `readMasterCV()` and `writeMasterCV()`; if file doesn't exist, return empty structure; merge strategy: match existing entries by company + title, append new entries, merge bullets without duplicating

### 1.4 New Session + Resume Generation

- [ ] **`settings:getAvailableModels` IPC** — call Anthropic `models.list()`; return model IDs; cache for the process lifetime
- [ ] **New Session dialog** — modal with a large textarea for pasting the job description; Generate button triggers `sessions:create`; animated progress state (MUI LinearProgress or spinner with status text) while the AI call runs; on completion opens the session view
- [ ] **`sessions:create` IPC** — extract company name and role title from the JD via Claude (or regex fallback); create `applications` row and `sessions` row in DB; create directory `data/applications/<company>/<role>_<YYYY-MM>_<id>/`; run resume generation (see below); write `resume.json` to session directory; update `resumeJsonPath` in applications row; return `Session`
- [ ] **Claude prompt: resume generation** — system prompt instructs the model to read the JD and Master CV, select and prioritize the most relevant experience, refine bullet phrasing for ATS alignment, and return a valid `ResumeJson`; all content must be grounded in Master CV bullets (no invention); log tokens to `spendLog`
- [ ] **`sessions:get` IPC** — load session row + application row from DB; read `resume.json` from filesystem (if path set); read `cover-letter.json` (if path set); return `Session`
- [ ] **`sessions:getAll` IPC** — return all session rows joined with application data; used to restore sidebar on launch

### 1.5 Session View + Resume Rendering

- [ ] **Session header bar** — displays company name and role title; Application Status chip (click-to-cycle through statuses, calls `applications:update`); Finalize button (sets `resumeStatus = 'finalized'`, updates badge); Export button (opens export dialog)
- [ ] **Tab bar** — Resume, Cover Letter, Match Report, Description tabs; token usage display on right side (model name, in/out tokens, estimated cost for last AI op — populated after any AI call)
- [ ] **`ResumePaper` component** — renders `ResumeJson` as the fixed template: name (from settings) + contact details header, hairline rule, Experience section, Education section, Skills section; matches the mockup paper card exactly (fonts, spacing, colors)
- [ ] **Bullet hover toolbar** — on hover over any bullet, show a dark popup toolbar inline with Edit and Revise with AI buttons; hovering also applies a subtle background highlight
- [ ] **Entry hover button** — on hover over an Experience entry, show a Revise with AI chip floating over the top-right corner (does not displace the date)
- [ ] **Section hover button** — on hover over Experience or Skills section heading, show a Revise section with AI chip; same dark chip style as the entry and bullet buttons
- [ ] **Inline bullet editing** — clicking Edit in the bullet toolbar turns the bullet into an in-place text input; Save and Cancel buttons appear below; Escape cancels; Enter saves (single-line bullet)
- [ ] **Side panels** — 272px right column; Match Rating panel (empty state until report generated); Job Description panel (scrollable JD text + Edit button)
- [ ] **JD inline editing** — click Edit in the JD panel: text becomes a resizable textarea; Save / Cancel; saved JD does not auto-regenerate (show a note)
- [ ] **Status bar** — save indicator dot + "All changes saved" text; active session/view name; last-saved timestamp

### 1.6 Settings View

- [ ] **Settings page** — accessible from sidebar footer icon and topbar icon; sections: API Key, Model, Contact Info, Theme, Backup Location
- [ ] **API key field** — masked input; re-validate button; on success persist to keychain; inline error on failure
- [ ] **Model picker** — dropdown populated from `settings:getAvailableModels`; saves selection to settings; used for all subsequent AI calls
- [ ] **Contact info form** — pre-populated from stored settings; Save button calls `settings:save`
- [ ] **Theme selector** — Light / Dark / System; applies immediately via MUI `ThemeProvider` and `useMediaQuery`

### 1.7 PDF Export

- [ ] **`export:pdf` IPC** — use Electron's `webContents.printToPDF` to render the document; show OS save dialog via `dialog.showSaveDialog`; default filename: `<Full Name> - <Company Name> - Resume.pdf`; write file; return path
- [ ] **Export error handling** — disk full, permissions error, path not found; each error shown inline with a specific message and "Save to different location" action (re-opens the save dialog)

---

## Phase 2 — Full Session Features

### 2.1 Cover Letter

- [ ] **Cover Letter tab** — empty state with a centered Generate button on first visit; after generation shows the cover letter paper and the feedback bar above it
- [ ] **`generate:coverLetter` IPC** — call Claude with JD + Master CV (and writing profile if present); return `CoverLetterJson` with today's date; write `cover-letter.json` to session directory; update `coverLetterStatus = 'draft'`; log tokens
- [ ] **`CoverLetterPaper` component** — renders `CoverLetterJson` with the same header/hairline rule as the resume; date, salutation, three paragraphs, sign-off + user's name; matches the cover letter template from the design
- [ ] **Per-paragraph hover toolbar** — dark popup toolbar appears below the paragraph on hover: Edit button + Revise with AI button
- [ ] **Inline paragraph editing** — clicking Edit turns the paragraph into an auto-growing textarea (MUI or native with `field-sizing: content`); Save / Cancel

### 2.2 Match Report

- [ ] **Add `generate:matchReport` to IPC surface and preload** — not yet in the existing stubs; add handler, preload exposure, and `WindowAPI` type
- [ ] **Match Report tab** — empty state with Generate button; after generation shows the full two-column report
- [ ] **`generate:matchReport` IPC** — call Claude to evaluate how well the resume aligns with the JD; return a qualitative rating (Strong / Good / Fair / Weak) + strengths list + gaps list as a JSON string; store in `sessions.matchReport`; log tokens
- [ ] **Match Report component** — full-width layout: header card with rating badge and Regenerate button; two-column body (Strengths / Gaps) with icon-prefixed items
- [ ] **Match Rating side panel** — condensed version shown at all times in the side panels: rating badge + 2–3 key points; empty state until report is generated

### 2.3 Session Persistence

- [ ] **`sessions:update` IPC** — persist changes to `resume.json`, `cover-letter.json`, and the session row (`matchReport`, `lastSaved`); also updates `applications.updatedAt`
- [ ] **`sessions:close` IPC** — auto-save session state before closing; mark as closed (remove from "open sessions" concept or simply persist to DB)
- [ ] **Auto-save** — call `sessions:update` automatically after every edit (debounced, ~2s); update status bar to "Saving…" → "All changes saved"
- [ ] **Restore sessions on launch** — on app start, call `sessions:getAll`; populate sidebar with all persisted sessions; reload the most recently active session
- [ ] **Session sidebar** — list sessions: company name, role, date, Draft/Final badge; close (×) button appears on hover; click to switch active session; sidebar updates `sessionsSlice`

### 2.4 Application Master List

- [ ] **Application Master List view** — full-page sortable table; columns: Company, Role, Summary, Started, Submitted, Resume Status, Cover Letter Status, Application Status, Notes, Open
- [ ] **Quick-filter chips** — All, Not Applied, Submitted, Interviewing, Offer chips above the table; active chip filters the table rows
- [ ] **Search bar** — text input that matches across Company, Role, Notes, Summary
- [ ] **Column sorting** — click any column header to sort ascending/descending; sort arrow indicator
- [ ] **Inline editing** — Application Status chip: click to cycle; Notes: click to edit in place (contenteditable or input); Submitted date: date picker or text input; all changes call `applications:update`
- [ ] **`applications:getAll` / `applications:update` / `applications:delete` IPC** — query the applications table; persist updates; on company/role rename: rename the directory on disk to stay in sync
- [ ] **Open session from list** — Open button navigates to the session view for that application; creates a session row if none exists yet

### 2.5 Description Tab

- [ ] **Description tab** — full-width display of the job description; inline Edit button; editing updates `sessions.jobDescription`; a note below the editor reads "Editing the job description does not automatically regenerate documents"

---

## Phase 3 — Master CV

### 3.1 Master CV View & Editing

- [ ] **Add `masterCV:get` and `masterCV:save` to IPC surface and preload** — not in current stubs; add handlers, preload, and `WindowAPI` types
- [ ] **`masterCV:get` IPC** — read and return parsed `master-cv.json`; return empty structure if file doesn't exist
- [ ] **`masterCV:save` IPC** — write updated master CV to `master-cv.json`
- [ ] **Master CV page** — page header with "Master CV" title, subtitle, and Regenerate button; AI usage info bar below header (model, last-op tokens, estimated cost, 24h spend vs. limit); Experience section; Education section; Skills section
- [ ] **Experience entry card** — shows title, company, date range; bullet list below; each bullet shows text, source tag (manual / ingested / finalized / regenerated), and "Used in N sessions" label; add bullet (+) button at bottom of card; entry-level Edit and Delete icon buttons
- [ ] **Inline bullet editing (Master CV)** — click bullet text to edit in place; Enter to save; Escape to cancel; delete icon per bullet on hover
- [ ] **Inline entry editing** — clicking the edit icon on an entry opens inline fields for title, company, startDate, endDate; Save / Cancel
- [ ] **Add new experience entry** — "+ Add entry" dashed button opens an inline form; fields: title, company, startDate, endDate; Save / Cancel
- [ ] **Education editing** — edit/delete existing rows; add new row inline
- [ ] **Skills editing** — edit/delete individual items within a category; add items; add new category row; delete a category

### 3.2 AI Usage & Spend Tracking

- [ ] **Log every AI operation** — after each Claude call in the main process, insert a row into `spendLog` (timestamp, model, inputTokens, outputTokens, estimatedCostUsd computed from model pricing)
- [ ] **Add `spendLog:getTotal` to IPC** — query spendLog for entries within the last 24 hours; sum `estimatedCostUsd`; return total; add to IPC surface and preload
- [ ] **Token usage display** — session tab bar right side shows model name, in/out token counts, and estimated cost for the last AI operation; updates after each AI call in the active session
- [ ] **Master CV AI info bar** — same display below the Master CV page header

### 3.3 Unincorporated Documents Tracking

- [ ] **Schema: incorporation tracking** — add `resumeIncorporatedAt`, `resumeLastFinalizedAt`, `coverLetterIncorporatedAt`, `coverLetterLastFinalizedAt` timestamp columns to `applications`; a document is "unincorporated" when `lastFinalizedAt` is set and (`incorporatedAt` is null or `lastFinalizedAt > incorporatedAt`); migrate
- [ ] **Mark as last-finalized** — when the Finalize button is clicked in the session view, set the corresponding `lastFinalizedAt` to now
- [ ] **Unincorporated documents banner** — shown on the Master CV page when any finalized resumes or cover letters have `lastFinalizedAt > incorporatedAt`; lists each document by name with a Resume/Cover Letter type tag; Regenerate button scoped to those documents

### 3.4 Master CV Regeneration

- [ ] **Add `masterCV:regenerate` to IPC surface and preload**
- [ ] **`masterCV:regenerate` IPC** — accept an optional list of document IDs to scope the run; gather source text from those documents; compare against current Master CV; call Claude to produce a typed suggestion list (types: `add-bullet`, `expand-bullet`, `add-skill`, `new-entry`, `cover-letter-insight`); return suggestions; log tokens
- [ ] **Regeneration review UI** — suggestion cards appear in a review panel below the banner; each card shows type badge, context (which entry it applies to), diff view (old → new, or just new for additions), and Accept / Edit / Dismiss action buttons; header shows "N of M remaining" and Dismiss All button
- [ ] **Commit regeneration** — accepted suggestions are written to `master-cv.json` with `source: "regenerated"` and the run timestamp; all documents included in the run have their `incorporatedAt` set to now

---

## Phase 4 — AI-Assisted Editing & Feedback

### 4.1 Revise with AI

- [ ] **Inline revision panel** — clicking any Revise with AI button (bullet, entry, section) expands a panel beneath the item; optional instruction textarea ("Leave blank for general improvement…") + Submit button; loading state while the AI call runs
- [ ] **Diff view** — proposed change shown as a before/after diff card; Before row (red background, strikethrough); After row (green background); Accept and Reject buttons
- [ ] **`generate:revise` IPC** — call Claude with the current text, scope context (bullet/entry/section), and optional instruction; return proposed replacement text; log tokens
- [ ] **Undo/redo** — in-memory change stack (not persisted); `Ctrl+Z` undoes the last edit (manual or AI-accepted); `Ctrl+Y` redoes; history clears on app restart

### 4.2 Holistic Feedback

- [ ] **Add `generate:feedback` to IPC surface and preload**
- [ ] **`generate:feedback` IPC** — call Claude to evaluate a resume or cover letter against the JD; return a list of feedback items: `type` (Strengthen / Add / Remove / Reframe), `target` (section or bullet identifier), `suggestion`, `justification`, and optionally proposed replacement text; log tokens
- [ ] **Feedback prompt bar (Resume)** — shown above the resume paper in the document area: optional freeform textarea ("Focus on ATS keywords, tone, conciseness…") + Get Feedback button; renders suggestions inline below the bar after generation
- [ ] **Feedback suggestion cards** — type chip, target label, suggestion text, justification card, diff view (where applicable), Accept / Edit / Dismiss actions; progress counter in the section header; Dismiss All button
- [ ] **Feedback prompt bar (Cover Letter)** — same pattern above the cover letter paper; shares the same `generate:feedback` IPC

### 4.3 Spending Limit

- [ ] **Add `spendingLimit` to settings** — number field (USD); 0 = disabled; persist via `settings:save`
- [ ] **Spending limit field in Settings** — numeric input labeled "Daily spending limit (USD)" with a note that costs are estimates; 0 disables warnings
- [ ] **Spending warning banner** — amber bar shown below the tab bar in session view and below the header in Master CV view whenever 24h rolling spend > configured limit (and limit > 0)
- [ ] **Spending limit dialog** — shown before any AI generation call when over limit: displays 24h spend vs. limit; Cancel and Generate Anyway buttons; user must actively dismiss

---

## Phase 5 — Writing Profile

- [ ] **Add `writingProfile:get`, `writingProfile:save`, and `writingProfile:regenerate` to IPC surface and preload**
- [ ] **`writingProfile:get` IPC** — read and return `writing-profile.json`; return null if not present
- [ ] **`writingProfile:save` IPC** — write updated profile to `writing-profile.json`
- [ ] **`writingProfile:regenerate` IPC** — gather all available cover letters (source docs + finalized session cover letters); call Claude to distill a ~500-word style summary (tone, formality, sentence structure, recurring phrasings, how letters open and close); return profile text; log tokens; write to `writing-profile.json`
- [ ] **Writing Profile page** — sidebar nav item (✏) with a yellow unincorporated-count badge; profile text displayed in a readable card with inline Edit button; metadata: last updated timestamp, derived from N letters; unincorporated cover letters banner with Regenerate button; Regenerate button also in the page header
- [ ] **Unincorporated cover letter tracking** — track which cover letters (source docs + finalized sessions) have not yet been reflected in the writing profile; a cover letter is unincorporated when it is newly finalized/uploaded or edited since last incorporation; yellow badge on the sidebar nav item shows the count
- [ ] **Seed profile on cover letter ingest** — when a cover letter source doc is ingested, queue it as unincorporated in the writing profile (and also trigger a summarization pass to seed or update the profile if the profile has never been generated)
- [ ] **Use writing profile in cover letter generation** — if `writing-profile.json` exists, include the profile text in the `generate:coverLetter` prompt to maintain voice consistency

---

## Phase 6 — Export, Backup & Error Handling

### 6.1 DOCX Export

- [ ] **`export:docx` IPC** — use the `docx` npm package to reproduce the resume/cover letter layout: same fonts, heading styles, bullet formatting, spacing, and single-column structure as the PDF; open save dialog; default filename matches PDF naming; return path
- [ ] **DOCX export error handling** — same error types and "Save to different location" pattern as PDF export

### 6.2 Backup

- [ ] **Backup location picker** — directory path input in Settings; opens OS folder picker; stores path in settings
- [ ] **`backup:trigger` IPC** — copy all files changed since the last backup to the configured backup directory; maintain a manifest file tracking last-backup timestamps per file; return success/failure
- [ ] **Auto-backup on app close** — register a `before-quit` handler in the main process that runs `backup:trigger` before allowing the app to exit
- [ ] **Manual full export** — "Export full backup now" button in Settings; triggers `backup:trigger`; shows success toast with the destination path
- [ ] **`backup:import` IPC** — show file picker for a backup archive; restore data to the app's data directory after a confirmation dialog; restart prompt after import

### 6.3 Error Handling Completeness

- [ ] **AI generation errors** — network/timeout/5xx: inline error with Retry button; rate limit 429: shows retry-after delay from API response headers, manual retry button; auth 401: specific message with direct link to Settings; context window exceeded: specific message suggesting a shorter JD or a larger-context model
- [ ] **Document ingestion errors** — image-only PDF: message explaining the issue and suggesting text-based PDF, DOCX, or plain text; corrupt/unreadable file: message prompting re-export or different format; password-protected PDF: message to remove password; all shown inline in the upload UI without leaving the upload flow
- [ ] **Toast vs. inline error policy** — blocking errors (generation failure, ingestion failure, export failure) are inline and persistent; non-blocking transient feedback (session saved, backup complete, suggestion accepted) uses MUI Snackbar toasts that auto-dismiss

---

## Phase 7 — Accessibility

- [ ] **`eslint-plugin-jsx-a11y`** — add to ESLint config; run and fix all reported issues
- [ ] **Keyboard navigation audit** — tab through every interactive element in every view; verify all are reachable, operable, and have visible focus indicators; fix any mouse-only interactions
- [ ] **Focus management** — modals: focus moves to the modal on open, returns to the trigger on close; view changes: focus moves to the new page heading; use MUI's built-in focus trap for dialogs
- [ ] **ARIA labels** — all icon-only buttons get `aria-label`; dialogs get `role="dialog"` and `aria-labelledby`; ARIA live regions (`aria-live="polite"`) for AI generation progress and completion messages
- [ ] **Color contrast audit** — verify all text meets WCAG AA minimums: 4.5:1 for normal text, 3:1 for large text; fix any failures in custom color choices

---

## Phase 8 — Testing

- [ ] **Vitest: unit tests** — test: undo/redo history (push, undo, redo, clear); session state management (create, update, close); file naming (company + role + date slugs); rolling 24h spend total calculation; Master CV merge logic (no-duplicate ingestion); Drizzle queries run against an in-memory SQLite instance; all Claude calls mocked via `vi.mock`
- [ ] **Storybook init** — run `npx storybook@latest init`; configure the MUI theme wrapper and a Redux Provider decorator so components render correctly in isolation
- [ ] **Storybook stories** — stories for: `ResumePaper` (various data shapes), `CoverLetterPaper`, Master CV entry card (each source type), Match Report (each rating), feedback suggestion card (each type), onboarding steps, session sidebar item (Draft vs. Final), spending warning banner
- [ ] **Storybook `@storybook/addon-a11y`** — add axe accessibility checks to all stories; fix reported issues
- [ ] **`vitest-axe`** — add axe assertions to component tests for cases outside Storybook (e.g. modals, dynamic live regions)
- [ ] **Playwright E2E** — configure Playwright with Electron support; cover critical flows: complete onboarding, create a new session and generate a resume, edit a bullet manually, export as PDF, close and reopen a session, navigate to Master CV and Application List
