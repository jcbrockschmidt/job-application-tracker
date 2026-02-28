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
  resumeJsonPath: string | null
  coverLetterJsonPath: string | null
  directoryPath: string | null
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

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  applicationId: string
  companyName: string
  roleTitle: string
  jobDescription: string
  resume: ResumeJson | null
  coverLetter: CoverLetterJson | null
  matchReport: string | null
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
  generate: {
    resume: (sessionId: string) => Promise<ResumeJson>
    coverLetter: (sessionId: string) => Promise<CoverLetterJson>
    revise: (sessionId: string, section: string, instruction: string) => Promise<string>
  }
  export: {
    pdf: (sessionId: string, type: DocumentType) => Promise<string>
    docx: (sessionId: string, type: DocumentType) => Promise<string>
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
