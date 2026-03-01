# Resume Builder — Design Document

## Overview

Resume Builder is a desktop app for creating job-optimized resumes and cover letters quickly and accurately. The goal is to help users apply to jobs faster by generating resumes that pass ATS (Applicant Tracking System) screening while remaining visually polished for human readers — all without hallucinating or misrepresenting the user's actual experience.

---

## Goals

- **Speed up job applications** by reducing the time needed to tailor a resume to each role.
- **Improve ATS pass rates** by analyzing job descriptions and aligning resume content to relevant keywords and structure.
- **Maintain accuracy** by grounding all generated content in the user's Master CV — a structured, user-owned record of their actual experience — rather than inventing anything.

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
3. **Resume / CV** — upload at least one existing resume to populate the Master CV, which serves as the ground truth for all generated content.
4. **Cover letter** — optionally upload an existing cover letter to inform cover letter generation style and content.

Onboarding is skipped on subsequent launches once setup is complete.

### Master CV

The Master CV is the user's permanent, comprehensive record of all their professional experience — uncurated and not tailored to any specific role. It is the canonical ground truth from which all resume content is drawn.

**This is an internal artifact, not a recruiter-facing document.** Completeness and verbosity are always preferred over conciseness. Every detail, every technology, every responsibility belongs here — even minor ones. The richer the Master CV, the better context the AI has when tailoring resumes to specific roles. When in doubt, include more.

- **Comprehensive by design:** Unlike a resume, the Master CV has no length limit. Every experience entry, every bullet, every skill belongs here. Nothing gets left out because it isn't relevant to a particular job.
- **Manually editable:** Users can add, edit, and delete experience entries, bullets, education, and skills at any time. This is the primary place to record new experience as it happens.
- **Populated by ingestion:** When an existing resume or CV is uploaded, its extracted, structured content is merged into the Master CV rather than stored as a separate artifact.
- **Enriched by finalized resumes:** When a resume is finalized, any bullets it contains that are not already present in the Master CV are automatically added to it. This ensures that well-phrased, AI-refined accomplishments are captured and available for future use — without requiring any manual copy-paste. A **pending update banner** is shown at the top of the Master CV view after finalization, summarizing how many bullets were added and from which session. The user can click "Review" to inspect the additions before they are committed.
- **Usage tracking:** Each bullet in the Master CV shows which sessions it has been included in, making it easy to see what experience has been highlighted and where.
- **Source attribution:** Each bullet records where it originated — entered manually, extracted from an uploaded document, or carried over from a specific finalized resume.
- **AI usage display:** An info bar below the Master CV page header shows the model currently in use, the input and output token counts for the last AI operation (e.g. a Regenerate run), and an estimated cost. The rolling 24-hour estimated spend total is also shown alongside the configured limit; it turns orange when the limit is exceeded.

#### Regeneration

The Master CV can be regenerated at any time from all resume data available in the database — uploaded source documents and all finalized session resumes. The AI is explicitly instructed to be verbose: expand thin bullets, preserve every technology and responsibility mentioned anywhere, surface details that might be useful context for future generation even if they never appeared on a polished resume.

**First generation (no existing Master CV):** All uploaded documents and finalized resumes are combined into a single, maximally comprehensive Master CV. Duplicate entries across sources are merged; conflicting phrasings of the same experience are preserved as separate bullets rather than collapsed. The synthesized result is presented in a reviewable list before being committed.

**Re-generation (existing Master CV):** The AI compares all resume data against the current Master CV and surfaces suggested additions and expansions — not a full replacement. Suggestions include:
- Bullets present in source resumes but missing from the Master CV entirely
- Existing bullets that could be expanded with specific numbers, technologies, or outcomes mentioned in other resume versions
- Skills or technologies named across multiple resumes that are absent from the skills section
- Roles, projects, or responsibilities referenced in passing that aren't represented as full entries

Each suggestion is presented individually for review. The user can accept, edit, or dismiss each one. No changes are committed to the Master CV until approved. Accepted suggestions are tagged with `"source": "regenerated"` and the timestamp of the regeneration run.

### Document Ingestion
- Upload one or more existing resumes or CVs to populate the Master CV.
- Upload one or more existing cover letters to inform cover letter generation style.
- **Supported formats:** DOCX, PDF, and plain text files.
- Raw text is extracted from the uploaded file and sent to the LLM, which reads, interprets, and contextualizes the content — normalizing structure, resolving ambiguities, and extracting structured data (e.g. work history, skills, dates, accomplishments).
- The LLM-processed output is merged into the Master CV. Entries that already exist are updated; new entries are added. The original uploaded files are preserved as-is alongside the structured output.

### Document Generation
- Paste a job description directly into the app to generate a tailored resume.
- All generated content is drawn exclusively from the Master CV — the LLM selects, prioritizes, and refines existing entries but cannot introduce experience that isn't already there.
- The generated resume is optimized for ATS systems while remaining readable and visually appealing.
- **Match Report** — generated on demand via a button in the Match Report tab. The LLM evaluates how well the resume aligns with the job description — identifying strengths, gaps, and any areas of concern. The report uses a qualitative rating (e.g. Strong, Good, Fair, Weak) rather than a numeric score, paired with a plain-language breakdown of keyword alignment and notable gaps. Never generated automatically — the user must explicitly trigger it. Once generated, a Regenerate button in the report header allows the user to request a fresh evaluation at any time (e.g. after editing the resume or updating the job description).
- **Cover Letter** — generated on demand via a button in the Cover Letter tab. Tailored to the same job description, informed by uploaded cover letters and Master CV content. Not generated automatically; the user triggers it when ready.

### Editing
- Manually edit any entry in the generated resume or cover letter.
- Interactively prompt the AI to revise content at multiple levels of granularity. Clicking any **Revise with AI** button expands an inline panel beneath the item where the user can type optional revision instructions; submitting presents a diff of the proposed changes for the user to approve or reject before anything is applied. Three levels are available in the resume:
  - **Bullet / skill row** — hover any resume bullet or skills row to reveal a dark popup toolbar with an **Edit** button (manual edit) and a **Revise with AI** button (AI-assisted rewrite of that item). Hovering a bullet or skill row also applies a subtle background highlight as a visual affordance.
  - **Job entry** — hover any Experience entry to reveal a **Revise with AI** button that floats over the top-right corner of the entry without displacing the date, for AI-assisted revision of all bullets within that role.
  - **Section** — the Experience and Skills section headings each show a **Revise section with AI** button on hover, for AI-assisted revision of the entire section at once.
  - All **Revise with AI** buttons — at the bullet/skill, entry, and section levels — share the same dark chip style for visual consistency.
- Cover letter paragraphs each have the same hover toolbar pattern: **Edit** and **Revise with AI**.
- All changes — both manual and AI-generated — are tracked in a change history.
  - Changes can be undone and redone via `Ctrl+Z` / `Ctrl+Y`.
  - Change history is in-memory only and is not persisted across app restarts.

### Feedback
- A **feedback prompt bar** is shown above the document in both the Resume and Cover Letter tabs. It contains an optional freeform textarea (e.g. "Focus on ATS keywords, tone, conciseness…") and a **Get Feedback** button. Leaving the textarea blank requests general feedback; filling it in focuses the feedback on the specified concern.
- After a resume or cover letter has been generated, the user can request holistic feedback from the LLM.
- Feedback is returned as a list of suggestions, each with:
  - A **type** (e.g. Strengthen, Add, Remove, Reframe)
  - The **section or bullet** it applies to
  - A clear **suggestion** (what to change)
  - A **justification** (why the change would improve the document given the job description)
- Each suggestion can be individually **accepted**, **edited**, or **dismissed**.

### Export
- Resumes and cover letters can be exported as PDF or DOCX.
- Exported PDFs use standard page sizing (Letter / A4).
- DOCX export faithfully reproduces the PDF layout — same fonts, spacing, and visual structure — so both formats are presentation-ready.
- Default file name format: `<Full Name> - <Company Name> - Resume` or `<Full Name> - <Company Name> - Cover Letter`.

### Sessions
- Multiple sessions can be open simultaneously, each representing a job application for a specific role.
- A **New Session** button creates a session, prompting the user to paste a job description. Submitting it triggers document generation and opens the new session.
- Sessions are listed in a persistent **sidebar** on the left of the main window. Each sidebar entry shows the company name, job title, date, and a status badge (Draft / Final). The active session is highlighted; clicking any entry opens that session.
- Each session contains a resume and an optional cover letter.
- The **session view** is structured as follows:
  - **Session header bar** — displays the company name, job title, and an **Application Status chip** (e.g. "Not Applied"), with **Finalize** and **Export** action buttons on the right.
  - **Tab bar** — four tabs organize session content: **Resume**, **Cover Letter**, **Match Report**, and **Description**. Token usage for the last AI operation is shown on the right side of the tab bar (model name, input and output token counts, estimated cost). When the rolling 24-hour estimated spend exceeds the configured limit, an orange badge showing the current vs. limit amounts appears to the left of the token usage, and an amber warning bar is shown below the tab bar across all tabs.
  - **Document area** (left/center) — the active tab's document rendered as a paper card, scrollable.
  - **Side panels** (right, ~272px) — two persistent panels shown alongside the document regardless of active tab:
    - **Match Rating** — a condensed summary of the match report (rating badge + key points). Empty until a Match Report has been generated.
    - **Job Description** — the full job description text, scrollable, with an inline Edit button. Editing here is equivalent to editing in the Description tab.
- The full job description for a session can be viewed and edited at any time from within the session — either in the Description tab or the Job Description side panel. Editing the job description does not automatically regenerate documents — the user can manually trigger regeneration after updating it.
- Sessions can be closed at any time and reopened later without losing progress. Each session in the sidebar has a close button (×) that appears on hover.
- The app auto-saves all open sessions when closed and restores them when reopened.
- Persisted state includes:
  - All open and previously closed sessions
  - The internal database of previously uploaded resumes and cover letters
- A persistent **status bar** runs across the bottom of the window, showing a save-state indicator ("All changes saved"), the current context (active view or session name), and a last-saved timestamp.

### Application Master List
- All sessions — both in-progress and finalized — appear in a single master list.
- Each entry includes:
  - **Company name**
  - **Role title**
  - **Brief summary of the position**
  - **Started date** — when the session was created (read-only, set automatically)
  - **Submitted date** — when the application was submitted to the company (user-entered)
  - **Resume Status** (Draft / Finalized)
  - **Cover Letter Status** (None / Draft / Finalized)
  - **Application Status** (Not Applied / Submitted / Interviewing / Offer Received / Rejected / Withdrawn)
  - **Notes** (user-entered free-form text)
- All fields are editable inline from the master list.
  - Editing **company name** or **role title** renames the corresponding directory in the file system to keep storage in sync.
  - **Started date** and **Resume Status** / **Cover Letter Status** are read-only (managed by the app).
  - **Submitted date** is user-entered and optional; blank until the user fills it in.
- Any session can be reopened directly from the master list, regardless of status.
- The list supports:
  - **Sorting** by any column
  - **Filtering** by any column (e.g. filter to a specific application status or resume status)
  - **Quick-filter chips** above the table for common application status values (All, Not Applied, Submitted, Interviewing, Offer) as a faster alternative to column filtering
  - **Search** via a text search bar that matches across all text fields
- Finalized resumes and cover letters are used as additional context when generating future documents, improving consistency and quality over time.

### Backups
- The app incrementally backs up all user data to a local directory, including:
  - All resume and cover letter documents (uploaded and generated)
  - The Application Master List
- Only changes since the last backup are written, keeping backup size small.
- Incremental backups run automatically on app closed.
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
- **Claude model** — select which Claude model to use for all AI operations. Available models are fetched from the Anthropic API at runtime and displayed as a picker showing each model's name, a brief capability description, and its current input and output pricing per million tokens.
- **Spending limit** — an optional cost threshold (in USD) applied to a rolling 24-hour window. When the rolling estimated spend exceeds the limit, a warning banner appears in the session view and Master CV view, and a confirmation dialog is shown before any generation proceeds. Set to 0 to disable. Costs displayed throughout the app are estimates based on published model pricing and may not match actual Anthropic charges.
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

## Master CV

The Master CV is stored as `master-cv.json` in the app's data directory. It extends the resume schema with per-bullet metadata for source tracking and usage attribution. Header info (name, phone, email, LinkedIn, GitHub) is owned by settings and is not duplicated here.

### master-cv.json Schema

```json
{
  "experience": [
    {
      "id": "exp_abc123",
      "title": "Senior Software Engineer",
      "company": "Acme Corp",
      "startDate": "Jan 2023",
      "endDate": "Present",
      "bullets": [
        {
          "id": "bul_def456",
          "text": "Redesigned the platform's caching architecture, reducing P99 API latency by 42% and cutting database load by 60% during peak traffic.",
          "source": "ingested",
          "sourceLabel": "Resume uploaded Feb 2026",
          "usedIn": ["session_abc", "session_xyz"]
        },
        {
          "id": "bul_ghi789",
          "text": "Led a cross-functional team of 5 engineers to deliver a new customer analytics dashboard, shipped on schedule across 3 sprint cycles.",
          "source": "finalized",
          "sourceLabel": "Acme Corp — Senior Software Engineer (Feb 27)",
          "usedIn": ["session_abc"]
        }
      ]
    }
  ],
  "education": [
    {
      "id": "edu_jkl012",
      "degree": "Bachelor of Science in Computer Science",
      "institution": "State University",
      "graduationDate": "May 2020"
    }
  ],
  "skills": [
    {
      "id": "skill_mno345",
      "category": "Languages",
      "items": ["TypeScript (6 yrs)", "Python (5 yrs)", "SQL (6 yrs)", "Go (2 yrs)", "Rust (1 yr)", "Bash"]
    }
  ]
}
```

`source` is one of:
- `"manual"` — entered directly by the user in the Master CV editor
- `"ingested"` — extracted from an uploaded resume or CV file
- `"finalized"` — carried over automatically when a resume session was finalized
- `"regenerated"` — accepted from an AI regeneration suggestion

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

- **SQLite** via `better-sqlite3` — stores the Application Master List metadata, session state, file path references, and the AI spend log. Enables fast sorting, filtering, and search without loading document files. The `spend_log` table records each AI operation (timestamp, model, input tokens, output tokens, estimated cost in USD) and is used to compute the rolling 24-hour spend total.
- **Drizzle ORM** — provides type-safe, SQL-close query building over SQLite. Schema migrations are managed with **Drizzle Kit**.
- **File system** — document content is stored as human-readable files, organized by application. Original uploaded source documents are stored as-is.

Directory structure:
```
/data/
  app.db
  master-cv.json
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
- **Token usage** is displayed after each AI operation in the right side of the session tab bar and in a dedicated info bar on the Master CV page, showing the model name, input and output token counts, and an estimated cost based on the selected model's pricing. Cost is labeled as an estimate since pricing may change.
- **Spending limit** — the app logs each AI operation with a timestamp, model, input tokens, output tokens, and estimated cost. The rolling 24-hour spend total is computed from log entries within the last 24 hours; entries older than 24 hours are excluded automatically. This log is persisted to the SQLite database (`spend_log` table) and loaded on app launch, so the rolling window remains accurate across restarts. When the total exceeds the user-configured limit, a persistent warning banner appears in the session and Master CV views. Any subsequent generation attempt shows a **spending limit warning dialog** before proceeding, displaying the 24-hour estimated spend vs. the limit with options to cancel or generate anyway. The limit can be set to 0 to disable warnings.

### Privacy & Security
- All user data — uploaded documents, generated resumes and cover letters, and the application database — is stored locally on the user's machine. Nothing is transmitted externally except the content sent to the Anthropic API during document generation.
- The Anthropic API key is stored in the OS keychain, not in plain local storage.

### Development Workflow
- A `Justfile` defines common commands and build targets to standardize the development workflow.

---

## Testing

### Unit Tests — Vitest
- Business logic: undo/redo history (keyboard shortcuts only), session state management, file naming
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
