# Job Application Kit

A desktop app for creating job-tailored resumes and cover letters — fast, accurate, and ATS-friendly.

Paste a job description, get a resume and cover letter drawn from your own experience.

## What it does

- **Master CV** — a comprehensive, private record of all your experience. You build it once (by uploading existing resumes), and all generated documents draw from it exclusively.
- **Sessions** — each job application is a session. Paste a job description, generate a resume, optionally generate a cover letter, track your application status.
- **AI editing** — revise any bullet, job entry, or section with AI assistance, or edit manually.
- **Match report** — on-demand analysis of how well your resume aligns with a job description.
- **Export** — PDF and DOCX, matching the same clean ATS-safe template.
- **Application list** — a master list of all sessions with status tracking, notes, filtering, and sorting.

All data is stored locally. Nothing leaves your machine except what's sent to the Anthropic API during generation.

## Requirements

- An [Anthropic API key](https://console.anthropic.com/)
- Node.js 22+
- [just](https://github.com/casey/just) (optional, for convenience commands)

## Getting started

```sh
npm install
npm run dev
```

Or with just:

```sh
just dev
```

On first launch, the app will walk you through entering your API key, contact info, and uploading an existing resume to seed your Master CV.

## Commands

| Command | What it does |
|---|---|
| `just dev` | Start with hot reload |
| `just build` | Production build |
| `just test` | Run unit tests |
| `just typecheck` | Type-check all TS |
| `just lint` | Lint source |
| `just format` | Auto-format with Prettier |
| `just db-generate` | Generate DB migrations after schema changes |
| `just db-migrate` | Apply pending migrations |
| `just db-studio` | Open Drizzle Studio (DB browser) |
| `just build-win` | Package for Windows |
| `just build-mac` | Package for macOS |
| `just build-linux` | Package for Linux |

## Tech

Electron + React + TypeScript. SQLite via Drizzle ORM. Claude via the Anthropic API.

See [docs/design.md](docs/design.md) for the full design doc.
