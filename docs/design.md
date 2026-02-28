# Resume Builder — Design Document

## Overview

Resume Builder is a desktop app for creating job-optimized resumes and cover letters quickly and accurately. The goal is to help users apply to jobs faster by generating resumes that pass ATS (Applicant Tracking System) screening while remaining visually polished for human readers — all without hallucinating or misrepresenting the user's actual experience.

---

## Goals

- **Speed up job applications** by reducing the time needed to tailor a resume to each role.
- **Improve ATS pass rates** by analyzing job descriptions and aligning resume content to relevant keywords and structure.
- **Maintain accuracy** by grounding all generated content in the user's own uploaded resume data rather than inventing experience.

---

## Features

### Onboarding
First-run experience shown before the main app is accessible. Guides the user through the minimum setup required to start generating documents:
1. **API key** — enter and validate their Anthropic API key, which is stored securely in the OS keychain.
2. **Contact info** — enter the details that appear in the resume header:
   - Full name *(required)* — also used for default export file names
   - Phone number *(required)*
   - Email address *(required)*
   - LinkedIn URL *(optional)*
   - GitHub URL *(optional)*
3. **Resume / CV** — upload at least one existing resume to serve as the source of truth for generated content.
4. **Cover letter** — optionally upload an existing cover letter to inform cover letter generation style and content.

Onboarding is skipped on subsequent launches once setup is complete.

### Document Ingestion
- Upload one or more existing resumes as a baseline.
- Upload one or more existing cover letters as a baseline.
- **Supported formats:** DOCX, PDF, and plain text files.
- Raw text is extracted from the uploaded file and sent to the LLM, which reads, interprets, and contextualizes the content — normalizing structure, resolving ambiguities, and extracting structured data (e.g. work history, skills, dates, accomplishments).
- The LLM-processed output is stored in the internal database and serves as the source of truth for all generated content. The original uploaded files are also preserved as-is.

### Document Generation
- Paste a job description directly into the app to generate a tailored resume.
- The generated resume is optimized for ATS systems while remaining readable and visually appealing.
- A match report is generated alongside each resume, where the LLM evaluates how well the resume aligns with the job description — identifying strengths, gaps, and any areas of concern.
- Optionally generate a cover letter tailored to the same job description, informed by uploaded cover letters and resume content.

### Editing
- Manually edit any entry in the generated resume or cover letter.
- Interactively prompt the AI to revise specific sections of either document. Before applying, the AI presents a diff of the proposed changes for the user to review and approve or reject.
- All changes — both manual and AI-generated — are tracked in a change history.
  - Changes can be undone and redone via dedicated buttons or `Ctrl+Z` / `Ctrl+Y`.
  - Change history is in-memory only and is not persisted across app restarts.

### Export
- Resumes and cover letters can be exported as PDF or DOCX.
- Exported PDFs use standard page sizing (Letter / A4).
- DOCX export faithfully reproduces the PDF layout — same fonts, spacing, and visual structure — so both formats are presentation-ready.
- Default file name format: `<Full Name> - <Company Name> - Resume` or `<Full Name> - <Company Name> - Cover Letter`.

### Sessions
- Multiple sessions can be open simultaneously, each representing a job application for a specific role.
- A **New Session** button creates a session, prompting the user to paste a job description. Submitting it triggers document generation and opens the new session in a tab.
- Sessions are displayed as tabs within the main window. Tabs can be torn off into separate windows.
- Each session contains a resume and an optional cover letter.
- Sessions can be closed at any time and reopened later without losing progress.
- The app auto-saves all open sessions when closed and restores them when reopened.
- Persisted state includes:
  - All open and previously closed sessions
  - The internal database of previously uploaded resumes and cover letters

### Application Master List
- All sessions — both in-progress and finalized — appear in a single master list.
- Each entry includes:
  - **Company name**
  - **Role title**
  - **Brief summary of the position**
  - **Date generated**
  - **Resume Status** (Draft / Finalized)
  - **Cover Letter Status** (None / Draft / Finalized)
  - **Application Status** (Not Applied / Submitted / Interviewing / Offer Received / Rejected / Withdrawn)
  - **Notes** (user-entered free-form text)
- All fields are editable inline from the master list.
  - Editing **company name** or **role title** renames the corresponding directory in the file system to keep storage in sync.
  - **Date generated** and **Resume Status** / **Cover Letter Status** are read-only (managed by the app).
- Any session can be reopened directly from the master list, regardless of status.
- The list supports:
  - **Sorting** by any column
  - **Filtering** by any column (e.g. filter to a specific application status or resume status)
  - **Search** via a text search bar that matches across all text fields
- Finalized resumes and cover letters are used as additional context when generating future documents, improving consistency and quality over time.

### Backups
- The app incrementally backs up all user data to a local directory, including:
  - All resume and cover letter documents (uploaded and generated)
  - The Application Master List
- Only changes since the last backup are written, keeping backup size small.
- Incremental backups run automatically every 5 minutes and on app close.
- Users can manually trigger a full backup export at any time.
- Previously exported backups can be imported to restore data.

### Error Handling

Errors on blocking operations (generation, ingestion, export) are displayed inline and persist until resolved — not as toasts that disappear. Toasts are reserved for non-blocking transient feedback (e.g. "Session saved"). Error messages are specific and actionable — they always explain what went wrong and what the user can do next. User state is never lost due to an error.

**AI generation errors**
- **Network / timeout / server error (5xx):** Inline error in the generation panel with a **Retry** button. The job description and session are preserved.
- **Rate limit (429):** Inline error with the retry-after delay if provided by the API (e.g. *"Rate limited — retry in 30s"*), with a manual retry button.
- **Auth error (401):** Specific message with a direct link to Settings to fix the API key.
- **Context window exceeded:** *"The job description or resume content is too long for the selected model. Try a model with a larger context window, or shorten the job description."*

**Document ingestion errors**
- **Image-only / scanned PDF:** *"This PDF contains no extractable text. It may be a scanned document. Try exporting your resume as a text-based PDF from your word processor, or upload as DOCX or plain text instead."*
- **Corrupt / unreadable file:** *"This file couldn't be read and may be damaged. Try re-exporting or uploading a different format."*
- **Password-protected PDF:** *"This PDF is password-protected. Remove the password and try again."*
- Errors appear inline next to the file in the upload UI; the user stays in the upload flow to retry.

**Export errors**
- **Disk full:** *"Export failed — not enough disk space."*
- **Permissions error:** *"Export failed — the app doesn't have permission to write to [path]."*
- **Path not found:** *"Export failed — the destination folder no longer exists."*
- All export errors include a **Save to different location** action inline, so the user doesn't need to dismiss and re-navigate.

### Accessibility
- Target standard: **WCAG 2.1 AA**.
- Full keyboard navigability throughout the app — no mouse-only interactions.
- Visible focus indicators on all interactive elements.
- Focus management on modals and view changes — focus moves to the new context when it appears.
- Color contrast meets WCAG AA minimums: 4.5:1 for normal text, 3:1 for large text.
- Correct ARIA roles and labels, especially for icon-only buttons, dialogs, and dynamically updated content.
- ARIA live regions for async feedback (e.g. AI generation in progress or complete).
- MUI's built-in WAI-ARIA compliance provides a strong baseline; custom components are held to the same standard.

### Settings
- **Anthropic API key** — entered by the user and stored securely in the OS keychain.
- **Claude model** — select which Claude model to use for all AI operations.
- **Contact info** — edit the details collected during onboarding: name, phone, email, LinkedIn (optional), GitHub (optional).
- **Theme** — Light / Dark / System default.
- **Backup location** — directory path for incremental backups.

---

## Resume Template

A single fixed template is used for all generated resumes. Single-column layout throughout — no tables, no text boxes, no graphics — ensuring reliable ATS text extraction while remaining polished for human readers.

### Structure

```
  Jane Smith
  (555) 123-4567  ·  jane@email.com  ·  linkedin.com/in/jane-smith  ·  github.com/janesmith
  ─────────────────────────────────────────────────────────────────────────────────

  Experience

  Software Engineer II · Acme Corp                                       July 2024 – Present
  • Bullet point accomplishment
  • Bullet point accomplishment

  Software Engineer II · Some Company                         March 2021 – July 2024
  • Bullet point accomplishment

  Education

  Bachelor's in Computer Science · State University                           June 2020

  Skills

  Languages: Python (7 years), TypeScript (5 years), SQL (7 years), Rust (2 years), ...
  Cloud / Infrastructure: AWS, Azure, Docker, Kubernetes, Terraform, Git, ...
  AI / ML / Data: PyTorch, TensorFlow, Spark, Kafka, MLflow, Elasticsearch, ...
  Web / App: React, Redux, Node.js, REST APIs, GraphQL, Playwright, ...
  Methodologies: Agile, CI/CD, DevOps, On-call, Microservices, ...
```

### Design Decisions

- **Layout:** Single column, left-aligned throughout.
- **Header:** Name on its own line; contact details on the next line separated by `·` centered beneath.
- **Section headings:** Bold, followed by a full-width hairline rule.
- **Experience entries:** `Job Title · Company` on one line with the date range right-aligned on the same line. Location omitted to save space. Bullet points for accomplishments beneath.
- **Education entries:** `Degree · Institution` with graduation date right-aligned, single line per entry.
- **Skills:** Each category on its own line as `Category: item, item, item` — plain flat text, no table. Skill categories are tailored to the job description (irrelevant categories may be omitted or reordered).
- **No summary section** — content goes straight from the header into Experience.
- **ATS safety:** No tables, headers/footers, icons, graphics, or decorative characters. Standard bullet points (`•`) only.
- **Typography:** Clean sans-serif font (e.g. Calibri or Inter); ~11pt body, ~13pt section headings, ~18pt name. Margins 0.75–1 inch.

### resume.json Schema

Mirrors the template structure section-for-section. This is the canonical stored representation of a generated resume. Header info (name, phone, email, LinkedIn, GitHub) is not stored here — it is owned by the app and injected at render/export time.

```json
{
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Acme Corp",
      "startDate": "Jan 2023",
      "endDate": "Present",
      "bullets": [
        "Reduced API response times by 40% by redesigning the caching layer and eliminating N+1 query patterns across core service endpoints.",
        "Led a team of 4 engineers to deliver a new customer-facing dashboard on time, coordinating across design, product, and backend teams."
      ]
    },
    {
      "title": "Software Engineer",
      "company": "Some Company",
      "startDate": "June 2020",
      "endDate": "Dec 2022",
      "bullets": [
        "Built and maintained REST APIs serving 2M+ daily requests, with 99.95% uptime over two years.",
        "Migrated a monolithic application to a microservices architecture, enabling independent deployments."
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor's in Computer Science",
      "institution": "State University",
      "graduationDate": "June 2020"
    }
  ],
  "skills": [
    {
      "category": "Languages",
      "items": ["Python (5 years)", "TypeScript (4 years)", "SQL (5 years)", "Go (2 years)", "Java", "Bash"]
    },
    {
      "category": "Cloud / Infrastructure",
      "items": ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "PostgreSQL", "Redis", "Grafana", "Linux"]
    },
    {
      "category": "Web / App",
      "items": ["React", "Redux", "Node.js", "REST APIs", "GraphQL", "HTML5/CSS"]
    },
    {
      "category": "Methodologies",
      "items": ["Agile", "CI/CD", "DevOps", "Microservices", "On-call", "TDD"]
    }
  ]
}
```

---

## Cover Letter Template

A single fixed template is used for all generated cover letters. Shares the same header, font, and spacing as the resume for a consistent, paired presentation.

### Structure

```
  Jane Smith
  (555) 123-4567  ·  jane@email.com  ·  linkedin.com/in/jane-smith  ·  github.com/janesmith
  ─────────────────────────────────────────────────────────────────────────────────

  February 27, 2026

  Dear Hiring Manager,

  [Opening paragraph — the specific role being applied for and a compelling hook
  that immediately connects the applicant's background to the position.]

  [Body paragraph — concrete examples from experience that directly address the
  role's requirements, grounded in the applicant's actual background.]

  [Closing paragraph — enthusiasm for the role, a brief call to action, and
  availability for next steps.]

  Sincerely,
  Jane Smith
```

### Design Decisions

- **Header:** Identical to the resume header — same name, contact details, and hairline rule — so the two documents look like a matched set.
- **Date:** Auto-populated with the date the cover letter is generated.
- **Salutation:** Defaults to "Dear Hiring Manager," — editable by the user if they know the recipient's name.
- **Body:** Three structured paragraphs generated by the LLM: opening, body, and closing. Each is independently editable.
- **Sign-off:** "Sincerely," followed by the user's name, injected by the app.
- **No recipient address block** — omitted since hiring manager and address details are rarely known and add no value.
- **Typography:** Same font, size, and margins as the resume.

### cover-letter.json Schema

Header info and sign-off name are injected by the app at render/export time and are not stored here.

```json
{
  "date": "February 27, 2026",
  "salutation": "Dear Hiring Manager,",
  "paragraphs": [
    "Opening paragraph — the specific role being applied for and a compelling hook that immediately connects the applicant's background to the position.",
    "Body paragraph — concrete examples from experience that directly address the role's requirements, grounded in the applicant's actual background.",
    "Closing paragraph — enthusiasm for the role, a brief call to action, and availability for next steps."
  ],
  "signoff": "Sincerely,"
}
```

---

## Architecture

### Runtime
- **Electron** — wraps the React frontend in a native desktop shell, providing full file system access for backups, exports, and local data storage.
- **Build:** `electron-vite` — Vite-based build tool handling the main/preload/renderer split, with fast HMR in development.
- **Packaging & Distribution:** `electron-builder` — produces platform installers (NSIS on Windows, DMG on macOS, AppImage on Linux). Auto-updates are delivered via `electron-updater` pointed at GitHub Releases.
- **Target platforms:** Windows, macOS, Linux.

### IPC (Main ↔ Renderer)
- The renderer has no direct access to Node.js or Electron APIs.
- A typed preload script uses `contextBridge.exposeInMainWorld` to expose a explicit, typed API surface to the renderer.
- Shared TypeScript types between main and preload ensure the contract stays in sync.
- All file system access, SQLite queries, AI calls, and backup operations are performed in the main process and invoked by the renderer through this bridge.

### Frontend
- **Framework:** React with TypeScript
- **UI Component Library:** MUI (Material UI)
- **State Management:** Redux Toolkit
- **Component Design:** Atomic Design pattern (atoms → molecules → organisms → templates → pages)
- **Component Development & Testing:** Storybook with automated interaction tests

### Data Storage

A hybrid approach is used: SQLite for structured, queryable data; the file system for document content.

- **SQLite** via `better-sqlite3` — stores the Application Master List metadata, session state, and file path references. Enables fast sorting, filtering, and search without loading document files.
- **Drizzle ORM** — provides type-safe, SQL-close query building over SQLite. Schema migrations are managed with **Drizzle Kit**.
- **File system** — document content is stored as human-readable files, organized by application. Original uploaded source documents are stored as-is.

Directory structure:
```
/data/
  app.db
  /applications/
    /<company>/
      <role>_<YYYY-MM>_<id>/
        resume.json
        cover-letter.json     ← if present
  /source-documents/
    <uploaded-resume>.pdf
    <uploaded-cover-letter>.pdf
```

### AI / LLM
- **Provider:** Anthropic Claude (cloud API)
- **SDK:** Anthropic TypeScript SDK (`@anthropic-ai/sdk`), called from the Electron main process
- **API key** is configured by the user in app settings and stored securely in the OS keychain
- **Model selection** is user-configurable in settings. Available Claude models are fetched from the Anthropic API at runtime; the user selects from this list and the selected model is used for all AI operations.
- **Token usage** is displayed after each AI operation in a non-intrusive status line, showing input and output token counts alongside an estimated cost based on the selected model's pricing. Cost is labeled as an estimate since pricing may change.

### Privacy & Security
- All user data — uploaded documents, generated resumes and cover letters, and the application database — is stored locally on the user's machine. Nothing is transmitted externally except the content sent to the Anthropic API during document generation.
- The Anthropic API key is stored in the OS keychain, not in plain local storage.

### Development Workflow
- A `Justfile` defines common commands and build targets to standardize the development workflow.

---

## Testing

### Unit Tests — Vitest
- Business logic: undo/redo history, session state management, file naming
- Document ingestion and parsing
- Match report generation (AI calls mocked)
- Drizzle queries, tested against an in-memory SQLite instance for speed and isolation
- AI calls are mocked in all automated tests to keep tests deterministic and fast

### Component Tests — Storybook + React Testing Library
- Storybook interaction tests cover component behavior at the story level
- React Testing Library is used for more focused, isolated component tests that don't require a full Storybook environment

### E2E Tests — Playwright
- Playwright's Electron support is used to drive the full app in a real Electron window.
- Covers critical end-to-end flows: onboarding, document generation, editing, export, and session persistence.

### Accessibility Tests
- **`eslint-plugin-jsx-a11y`** — static analysis at lint time catches common issues early.
- **Storybook `@storybook/addon-a11y`** — runs axe checks automatically on every story.
- **`vitest-axe`** — axe assertions in unit/component tests for cases outside Storybook.
- **Manual testing** — keyboard navigation across all flows.

---

## Out of Scope (Initial Version)

- Multi-user support or cloud sync
- Direct job board integration (job descriptions are pasted manually)
