// ─── Enums ────────────────────────────────────────────────────────────────────

export type ResumeStatus = 'draft' | 'finalized'
export type CoverLetterStatus = 'none' | 'draft' | 'finalized'
export type ApplicationStatus =
  | 'not_applied'
  | 'submitted'
  | 'interviewing'
  | 'offer_received'
  | 'rejected'
  | 'withdrawn'
export type SourceDocType = 'resume' | 'cover_letter'
export type Theme = 'light' | 'dark' | 'system'
export type DocumentType = 'resume' | 'coverLetter'

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface ContactInfo {
  fullName: string
  phone: string
  email: string
  linkedin?: string
  github?: string
}

export interface Settings {
  contactInfo: ContactInfo
  model: string
  theme: Theme
  backupLocation: string
  // Maximum estimated spend in USD over a rolling 24-hour window. 0 = disabled.
  spendingLimit: number
}

// ─── Data Models ──────────────────────────────────────────────────────────────

export interface Application {
  id: string
  companyName: string
  roleTitle: string
  briefSummary: string | null
  dateGenerated: string
  resumeStatus: ResumeStatus
  coverLetterStatus: CoverLetterStatus
  applicationStatus: ApplicationStatus
  notes: string | null
  // User-entered date when the application was submitted to the company. Null until filled in.
  submittedDate: string | null
  resumeJsonPath: string | null
  coverLetterJsonPath: string | null
  directoryPath: string | null
  // Incorporation tracking for Master CV. ISO timestamp strings or null.
  // A document is "unincorporated" when lastFinalizedAt is set and
  // (incorporatedAt is null OR lastFinalizedAt > incorporatedAt).
  resumeLastFinalizedAt: string | null
  resumeIncorporatedAt: string | null
  coverLetterLastFinalizedAt: string | null
  coverLetterIncorporatedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SourceDoc {
  id: string
  filename: string
  type: SourceDocType
  path: string
  uploadedAt: string
}

// ─── Document JSON Schemas ────────────────────────────────────────────────────

export interface ExperienceEntry {
  title: string
  company: string
  startDate: string
  endDate: string
  bullets: string[]
}

export interface EducationEntry {
  degree: string
  institution: string
  graduationDate: string
}

export interface SkillCategory {
  category: string
  items: string[]
}

export interface ResumeJson {
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: SkillCategory[]
}

export interface CoverLetterJson {
  date: string
  salutation: string
  paragraphs: string[]
  signoff: string
}

// ─── Master CV ────────────────────────────────────────────────────────────────

// Where a bullet originated.
export type BulletSource = 'manual' | 'ingested' | 'finalized' | 'regenerated'

// A single bullet in the Master CV, with source tracking and usage attribution.
export interface MasterCVBullet {
  id: string
  text: string
  source: BulletSource
  // Human-readable label: e.g. "Resume uploaded Feb 2026" or "Acme Corp — Senior Engineer (Feb 27)"
  sourceLabel: string
  // Session IDs where this bullet was included in a generated resume.
  usedIn: string[]
}

// Extends ExperienceEntry with per-bullet metadata and a stable ID.
export interface MasterCVExperienceEntry {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  bullets: MasterCVBullet[]
}

export interface MasterCVEducationEntry {
  id: string
  degree: string
  institution: string
  graduationDate: string
}

export interface MasterCVSkillCategory {
  id: string
  category: string
  items: string[]
}

export interface MasterCV {
  experience: MasterCVExperienceEntry[]
  education: MasterCVEducationEntry[]
  skills: MasterCVSkillCategory[]
}

// ─── Master CV Regeneration Suggestions ──────────────────────────────────────

// The type of change a regeneration suggestion proposes.
export type RegenSuggestionType =
  | 'add-bullet' // a bullet present in source docs but missing from the Master CV
  | 'expand-bullet' // an existing bullet that could be enriched with more detail
  | 'add-skill' // a technology or skill named across docs but absent from the skills section
  | 'new-entry' // a role or project referenced in passing with no full entry
  | 'cover-letter-insight' // an accomplishment or framing from a cover letter not captured anywhere

export interface RegenSuggestion {
  id: string
  type: RegenSuggestionType
  // ID of the experience entry this applies to, if relevant.
  entryId?: string
  // Human-readable context: e.g. "for Acme Corp — Senior Software Engineer"
  context: string
  // The existing text, for expand-bullet suggestions.
  currentText?: string
  // The proposed new or replacement text.
  proposedText: string
}

// ─── Writing Profile ──────────────────────────────────────────────────────────

// A compact (~500 word) summary of the user's cover letter style.
// Stored in writing-profile.json. Never updated automatically.
export interface WritingProfile {
  text: string
  // ISO timestamp of the last regeneration.
  lastUpdatedAt: string
  // Number of cover letters the profile was derived from.
  derivedFromCount: number
}

// ─── Match Report ─────────────────────────────────────────────────────────────

export type MatchRating = 'Strong' | 'Good' | 'Fair' | 'Weak'

export interface MatchReport {
  rating: MatchRating
  strengths: string[]
  gaps: string[]
  // ISO timestamp of when the report was generated.
  generatedAt: string
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export type FeedbackType = 'Strengthen' | 'Add' | 'Remove' | 'Reframe'

export interface FeedbackItem {
  id: string
  type: FeedbackType
  // Human-readable label for the section or bullet this applies to.
  target: string
  suggestion: string
  justification: string
  // For suggestions with a concrete replacement (Strengthen, Reframe), the proposed text.
  proposedText?: string
}

// ─── Spend Tracking ───────────────────────────────────────────────────────────

export interface SpendTotal {
  // Sum of estimatedCostUsd for all AI operations in the last 24 hours.
  totalUsd: number
  // Always 24 — included for display purposes.
  periodHours: 24
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  applicationId: string
  companyName: string
  roleTitle: string
  jobDescription: string
  resume: ResumeJson | null
  coverLetter: CoverLetterJson | null
  // Null until the user explicitly generates a match report.
  matchReport: MatchReport | null
  lastSaved: string
}

// ─── IPC API Surface (exposed via contextBridge) ──────────────────────────────

export interface WindowAPI {
  settings: {
    get: () => Promise<Settings>
    save: (settings: Partial<Settings>) => Promise<void>
    validateApiKey: (apiKey: string) => Promise<boolean>
    getAvailableModels: () => Promise<string[]>
  }

  applications: {
    getAll: () => Promise<Application[]>
    update: (id: string, updates: Partial<Application>) => Promise<void>
    delete: (id: string) => Promise<void>
  }

  sessions: {
    create: (jobDescription: string) => Promise<Session>
    get: (id: string) => Promise<Session>
    getAll: () => Promise<Session[]>
    update: (id: string, updates: Partial<Session>) => Promise<void>
    close: (id: string) => Promise<void>
  }

  docs: {
    ingest: (filePath: string, type: SourceDocType) => Promise<SourceDoc>
    getAll: () => Promise<SourceDoc[]>
    delete: (id: string) => Promise<void>
  }

  masterCV: {
    get: () => Promise<MasterCV>
    save: (cv: MasterCV) => Promise<void>
    // Gathers source docs + finalized resumes/cover letters and asks Claude to
    // suggest additions and expansions relative to the current Master CV.
    // Pass documentIds to scope the run to specific unincorporated documents.
    regenerate: (documentIds?: string[]) => Promise<RegenSuggestion[]>
  }

  writingProfile: {
    get: () => Promise<WritingProfile | null>
    save: (profile: WritingProfile) => Promise<void>
    // Re-derives the writing profile from all available cover letters.
    regenerate: () => Promise<WritingProfile>
  }

  generate: {
    resume: (sessionId: string) => Promise<ResumeJson>
    coverLetter: (sessionId: string) => Promise<CoverLetterJson>
    // Returns a qualitative rating + strengths/gaps analysis.
    matchReport: (sessionId: string) => Promise<MatchReport>
    // Returns a list of actionable feedback suggestions for the specified document.
    // prompt is an optional focus instruction from the user (e.g. "focus on ATS keywords").
    feedback: (
      sessionId: string,
      documentType: DocumentType,
      prompt?: string
    ) => Promise<FeedbackItem[]>
    // Returns proposed replacement text for a targeted revision. The caller shows
    // a diff and decides whether to accept or reject before applying.
    revise: (sessionId: string, section: string, instruction: string) => Promise<string>
  }

  export: {
    pdf: (sessionId: string, type: DocumentType) => Promise<string>
    docx: (sessionId: string, type: DocumentType) => Promise<string>
  }

  spendLog: {
    // Returns the sum of estimated costs for AI operations in the last 24 hours.
    getTotal: () => Promise<SpendTotal>
  }

  backup: {
    trigger: () => Promise<void>
    import: (backupPath: string) => Promise<void>
  }
}

// Augment the global Window type so renderer code gets full type safety
declare global {
  interface Window {
    api: WindowAPI
  }
}
