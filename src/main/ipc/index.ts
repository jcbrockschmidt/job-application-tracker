// IPC handler registration for the main process.
//
// Implementation status by phase:
//   Phase 1 (this file): settings:get/save/validateApiKey/getAvailableModels, docs:ingest,
//     sessions:create/get/getAll, generate:resume
//   Phase 2 (STUB): sessions:update/close, applications:*, generate:coverLetter/matchReport
//   Phase 3 (STUB): masterCV:*, spendLog:getTotal
//   Phase 4 (STUB): generate:feedback, generate:revise
//   Phase 5 (STUB): writingProfile:*
//   Phase 6 (STUB): export:docx, backup:*

import { ipcMain, app, dialog } from 'electron'
import { join, extname, basename } from 'path'
import { readFileSync, existsSync, copyFileSync, mkdirSync, rmSync } from 'fs'
import keytar from 'keytar'
import { nanoid } from 'nanoid'
import { eq, desc } from 'drizzle-orm'
import { atomicWriteJson, getDataPaths, getSessionDir, readMasterCV, writeMasterCV } from '../fs'
import {
  validateApiKey,
  resetAnthropicClient,
  getAnthropicClient,
  listAvailableModels,
  isPlaceholderMode
} from '../ai'
import {
  PLACEHOLDER_COMPANY_ROLE,
  PLACEHOLDER_MODELS,
  PLACEHOLDER_RAW_CV,
  PLACEHOLDER_RESUME
} from '../ai/placeholders'
import { getDb } from '../db'
import {
  applications as applicationsTable,
  sessions as sessionsTable,
  sourceDocs,
  spendLog
} from '../db/schema'
import { extractText } from '../ingestion'
import {
  extractCompanyRolePrompt,
  extractResumePrompt,
  tailorResumePrompt,
  tailorCoverLetterPrompt
} from '../ai/prompts'
import { mergeMasterCV } from '../utils/masterCVMerge'
import { estimateCostUsd } from '../utils/spendCalculation'
import { exportResumePdf, exportCoverLetterPdf } from '../export'
import type {
  Settings,
  SourceDocType,
  DocumentType,
  MasterCV,
  MasterCVEducationEntry,
  MasterCVSkillCategory,
  MasterCVBullet,
  WritingProfile,
  SourceDoc,
  Session,
  ResumeJson,
  CoverLetterJson
} from '../../shared/types'

const KEYCHAIN_SERVICE = 'job-application-kit'
const KEYCHAIN_ACCOUNT = 'anthropic-api-key'

// ─── Ingestion helpers ────────────────────────────────────────────────────────

// Shape returned by Claude when extracting a resume.
interface RawExtractedCV {
  experience: Array<{
    title: string
    company: string
    startDate: string
    endDate: string
    bullets: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    graduationDate: string
  }>
  skills: Array<{ category: string; items: string[] }>
}

// Format upload date as "Mon YYYY" for source labels (e.g. "Feb 2026").
function formatUploadMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Convert the raw AI extraction output to a MasterCV with nanoid IDs and source
// metadata so it can be fed directly into mergeMasterCV().
function rawToMasterCV(raw: RawExtractedCV, sourceLabel: string): MasterCV {
  const cv: MasterCV = {
    experience: (raw.experience ?? []).map((entry) => ({
      id: nanoid(),
      title: entry.title,
      company: entry.company,
      startDate: entry.startDate,
      endDate: entry.endDate,
      bullets: (entry.bullets ?? []).map(
        (text): MasterCVBullet => ({
          id: nanoid(),
          text,
          source: 'ingested',
          sourceLabel,
          usedIn: []
        })
      )
    })),
    education: (raw.education ?? []).map(
      (edu): MasterCVEducationEntry => ({
        id: nanoid(),
        degree: edu.degree,
        institution: edu.institution,
        graduationDate: edu.graduationDate
      })
    ),
    skills: (raw.skills ?? []).map(
      (skill): MasterCVSkillCategory => ({
        id: nanoid(),
        category: skill.category,
        items: skill.items ?? []
      })
    )
  }
  return cv
}

// ─── Session helpers ──────────────────────────────────────────────────────────

// Sanitize a string into a filesystem-safe slug (lowercase, hyphens, max 50 chars).
function toSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'unknown'
  )
}

// Regex fallback for extracting company name and role title when Claude parsing fails.
function extractCompanyRoleRegex(jd: string): { company: string; role: string } {
  const roleMatch = jd.match(/(?:job title|position|role)[:\s]+([^\n,]{3,60})/i)
  const companyMatch = jd.match(/(?:company|employer|organization|about us)[:\s]+([^\n,]{2,60})/i)
  return {
    company: companyMatch?.[1]?.trim() ?? 'Unknown Company',
    role: roleMatch?.[1]?.trim() ?? 'Unknown Role'
  }
}

// Read resume.json and cover-letter.json from a session directory (if they exist).
function readSessionDocs(directoryPath: string | null): {
  resume: ResumeJson | null
  coverLetter: CoverLetterJson | null
} {
  if (!directoryPath) return { resume: null, coverLetter: null }

  let resume: ResumeJson | null = null
  let coverLetter: CoverLetterJson | null = null

  const resumePath = join(directoryPath, 'resume.json')
  if (existsSync(resumePath)) {
    resume = JSON.parse(readFileSync(resumePath, 'utf-8')) as ResumeJson
  }

  const clPath = join(directoryPath, 'cover-letter.json')
  if (existsSync(clPath)) {
    coverLetter = JSON.parse(readFileSync(clPath, 'utf-8')) as CoverLetterJson
  }

  return { resume, coverLetter }
}

// ─── Settings helpers ─────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  contactInfo: { fullName: '', phone: '', email: '', linkedin: '', github: '' },
  model: 'claude-opus-4-6',
  theme: 'system',
  backupLocation: '',
  spendingLimit: 0,
  onboardingComplete: false
}

function getSettingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function readSettings(): Settings {
  const path = getSettingsPath()
  if (!existsSync(path)) return { ...DEFAULT_SETTINGS }
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf-8')) as Partial<Settings>
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

// ─── Process-lifetime model list cache ────────────────────────────────────────

// Populated on first call to settings:getAvailableModels; cleared when the API key
// is replaced. null means the cache is cold.
let cachedModels: string[] | null = null

// ─── Resume generation helper ─────────────────────────────────────────────────

// Calls Claude to generate a tailored resume from the Master CV + job description,
// writes resume.json to sessionDir, logs the spend, and returns the ResumeJson.
// Used by both sessions:create (initial generation) and generate:resume (re-generation).
async function generateResumeFromCV(
  jobDescription: string,
  sessionDir: string,
  model: string,
  apiKey: string | null
): Promise<ResumeJson> {
  mkdirSync(sessionDir, { recursive: true })

  if (isPlaceholderMode()) {
    atomicWriteJson(join(sessionDir, 'resume.json'), PLACEHOLDER_RESUME)
    return PLACEHOLDER_RESUME
  }

  const masterCV = readMasterCV()
  const client = getAnthropicClient(apiKey!)

  const response = await client.messages.create({
    model,
    ...tailorResumePrompt(masterCV, jobDescription)
  })

  const toolBlock = response.content.find((b) => b.type === 'tool_use')
  let resume: ResumeJson
  if (toolBlock && toolBlock.type === 'tool_use') {
    resume = toolBlock.input as ResumeJson
  } else {
    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text')
      throw new Error('Resume generation returned no structured output')
    const raw = textBlock.text
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim()
    resume = JSON.parse(raw) as ResumeJson
  }

  // Write resume.json to session directory.
  atomicWriteJson(join(sessionDir, 'resume.json'), resume)

  // Log spend.
  const now = new Date()
  const inputTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens
  const db = getDb()
  db.insert(spendLog).values({
    id: nanoid(),
    timestamp: now,
    model,
    inputTokens,
    outputTokens,
    estimatedCostUsd: estimateCostUsd(model, inputTokens, outputTokens)
  })

  return resume
}

// ─── IPC handler registration ─────────────────────────────────────────────────

export function registerIpcHandlers(): void {
  if (isPlaceholderMode()) {
    console.log('[AI Placeholder] Placeholder mode active — Claude API calls are skipped.')
  }

  // ─── Settings ───────────────────────────────────────────────────────────────

  ipcMain.handle('settings:get', async (): Promise<Settings> => {
    return readSettings()
  })

  ipcMain.handle('settings:save', async (_event, updates: Partial<Settings>): Promise<void> => {
    const current = readSettings()
    const merged: Settings = {
      ...current,
      ...updates,
      contactInfo: { ...current.contactInfo, ...(updates.contactInfo ?? {}) }
    }
    atomicWriteJson(getSettingsPath(), merged)
  })

  ipcMain.handle('settings:validateApiKey', async (_event, apiKey: string): Promise<boolean> => {
    if (isPlaceholderMode()) {
      await keytar.setPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT, apiKey)
      resetAnthropicClient()
      cachedModels = null
      return true
    }
    const isValid = await validateApiKey(apiKey)
    if (isValid) {
      await keytar.setPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT, apiKey)
      resetAnthropicClient()
      // Clear the model cache since the new key may have different model access.
      cachedModels = null
    }
    return isValid
  })

  ipcMain.handle('settings:getAvailableModels', async (): Promise<string[]> => {
    if (isPlaceholderMode()) return PLACEHOLDER_MODELS
    if (cachedModels) return cachedModels
    const apiKey = await keytar.getPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
    if (!apiKey) throw new Error('API key not configured — validate it in Settings')
    cachedModels = await listAvailableModels(apiKey)
    return cachedModels
  })

  // ─── Applications ────────────────────────────────────────────────────────────
  // STUB: Phase 2

  ipcMain.handle('applications:getAll', async () => {
    // TODO: Query the applications table via Drizzle (getDb()). Return all rows
    // sorted by createdAt descending. Map DB row timestamps to ISO strings.
    throw new Error('Not implemented')
  })

  ipcMain.handle('applications:update', async (_event, _id: string, _updates: unknown) => {
    // TODO: Update the matching row in the applications table. Set updatedAt to now.
    // Special case: if companyName or roleTitle changed, rename the session directory
    // on disk (directoryPath) to match the new values so the filesystem stays in sync.
    throw new Error('Not implemented')
  })

  ipcMain.handle('applications:delete', async (_event, _id: string) => {
    // TODO: Delete the application row, its associated sessions rows, and the
    // entire directory tree at directoryPath. Remove any source doc references
    // that are scoped to this application. Confirm the directory exists before deleting.
    throw new Error('Not implemented')
  })

  // ─── Sessions ────────────────────────────────────────────────────────────────

  ipcMain.handle('sessions:create', async (_event, jobDescription: string): Promise<Session> => {
    const settings = readSettings()
    const { model } = settings
    const now = new Date()
    const db = getDb()

    // 1. Extract company name and role title from the JD via Claude, with regex fallback.
    let companyName = 'Unknown Company'
    let roleTitle = 'Unknown Role'
    let apiKey: string | null = null
    if (isPlaceholderMode()) {
      companyName = PLACEHOLDER_COMPANY_ROLE.company
      roleTitle = PLACEHOLDER_COMPANY_ROLE.role
    } else {
      apiKey = await keytar.getPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
      if (!apiKey) throw new Error('API key not configured — validate it in Settings')
      const client = getAnthropicClient(apiKey)
      try {
        const extractResponse = await client.messages.create({
          model,
          ...extractCompanyRolePrompt(jobDescription)
        })
        const toolBlock = extractResponse.content.find((b) => b.type === 'tool_use')
        let extracted: { company?: string; role?: string }
        if (toolBlock && toolBlock.type === 'tool_use') {
          extracted = toolBlock.input as { company?: string; role?: string }
        } else {
          const textBlock = extractResponse.content.find((b) => b.type === 'text')
          if (!textBlock || textBlock.type !== 'text')
            throw new Error('No tool_use block in extract response')
          const raw = textBlock.text
            .replace(/^```(?:json)?\n?/, '')
            .replace(/\n?```$/, '')
            .trim()
          extracted = JSON.parse(raw) as { company?: string; role?: string }
        }
        companyName = extracted.company?.trim() || companyName
        roleTitle = extracted.role?.trim() || roleTitle

        // Log the extraction spend.
        db.insert(spendLog)
          .values({
            id: nanoid(),
            timestamp: now,
            model,
            inputTokens: extractResponse.usage.input_tokens,
            outputTokens: extractResponse.usage.output_tokens,
            estimatedCostUsd: estimateCostUsd(
              model,
              extractResponse.usage.input_tokens,
              extractResponse.usage.output_tokens
            )
          })
          .run()
      } catch {
        // Regex fallback: try to extract from common patterns.
        const fallback = extractCompanyRoleRegex(jobDescription)
        companyName = fallback.company
        roleTitle = fallback.role
      }
    }

    // 2. Generate IDs and directory path.
    const applicationId = nanoid()
    const sessionId = nanoid()
    const sessionDir = getSessionDir(toSlug(companyName), toSlug(roleTitle), sessionId)

    // 3. Create the session directory.
    mkdirSync(sessionDir, { recursive: true })

    // 4. Insert DB rows.
    db.insert(applicationsTable)
      .values({
        id: applicationId,
        companyName,
        roleTitle,
        briefSummary: null,
        dateGenerated: now.toISOString(),
        resumeStatus: 'draft',
        coverLetterStatus: 'none',
        applicationStatus: 'not_applied',
        notes: null,
        submittedDate: null,
        directoryPath: sessionDir,
        resumeLastFinalizedAt: null,
        resumeIncorporatedAt: null,
        coverLetterLastFinalizedAt: null,
        coverLetterIncorporatedAt: null,
        coverLetterWritingProfileIncorporatedAt: null,
        createdAt: now,
        updatedAt: now
      })
      .run()

    const lastSaved = now.toISOString()
    db.insert(sessionsTable)
      .values({
        id: sessionId,
        applicationId,
        jobDescription,
        matchReport: null,
        lastSaved,
        createdAt: now
      })
      .run()

    // 5. Generate the resume.
    const resume = await generateResumeFromCV(jobDescription, sessionDir, model, apiKey)

    // 6. Return the assembled Session.
    return {
      id: sessionId,
      applicationId,
      companyName,
      roleTitle,
      jobDescription,
      dateGenerated: now.toISOString(),
      resume,
      coverLetter: null,
      matchReport: null,
      lastSaved,
      isGenerating: false,
      generationError: null
    }
  })

  ipcMain.handle('sessions:get', async (_event, id: string): Promise<Session> => {
    const db = getDb()
    const rows = db
      .select()
      .from(sessionsTable)
      .innerJoin(applicationsTable, eq(sessionsTable.applicationId, applicationsTable.id))
      .where(eq(sessionsTable.id, id))
      .all()

    if (rows.length === 0) throw new Error(`Session not found: ${id}`)

    const { sessions, applications } = rows[0]
    const { resume, coverLetter } = readSessionDocs(applications.directoryPath)

    return {
      id: sessions.id,
      applicationId: sessions.applicationId,
      companyName: applications.companyName,
      roleTitle: applications.roleTitle,
      jobDescription: sessions.jobDescription,
      dateGenerated: applications.dateGenerated,
      resume,
      coverLetter,
      matchReport: sessions.matchReport
        ? (JSON.parse(sessions.matchReport) as Session['matchReport'])
        : null,
      lastSaved: sessions.lastSaved,
      isGenerating: false,
      generationError: null
    }
  })

  ipcMain.handle('sessions:getAll', async (): Promise<Session[]> => {
    const db = getDb()
    const rows = db
      .select()
      .from(sessionsTable)
      .innerJoin(applicationsTable, eq(sessionsTable.applicationId, applicationsTable.id))
      .orderBy(desc(sessionsTable.createdAt))
      .all()

    const result: Session[] = []

    for (const { sessions, applications } of rows) {
      const { resume, coverLetter } = readSessionDocs(applications.directoryPath)

      // Sessions with no resume.json were abandoned mid-first-generation (e.g. app was
      // closed before generation completed). Clean them up from the DB and filesystem.
      if (!resume) {
        db.delete(sessionsTable).where(eq(sessionsTable.id, sessions.id)).run()
        db.delete(applicationsTable).where(eq(applicationsTable.id, applications.id)).run()
        if (applications.directoryPath) {
          try {
            rmSync(applications.directoryPath, { recursive: true, force: true })
          } catch {
            // Best-effort cleanup — ignore filesystem errors
          }
        }
        continue
      }

      result.push({
        id: sessions.id,
        applicationId: sessions.applicationId,
        companyName: applications.companyName,
        roleTitle: applications.roleTitle,
        jobDescription: sessions.jobDescription,
        dateGenerated: applications.dateGenerated,
        resume,
        coverLetter,
        matchReport: sessions.matchReport
          ? (JSON.parse(sessions.matchReport) as Session['matchReport'])
          : null,
        lastSaved: sessions.lastSaved,
        isGenerating: false,
        generationError: null
      })
    }

    return result
  })

  ipcMain.handle(
    'sessions:update',
    async (_event, id: string, updates: Partial<Session>): Promise<void> => {
      const db = getDb()

      // 1. Load the session and application.
      const rows = db
        .select()
        .from(sessionsTable)
        .innerJoin(applicationsTable, eq(sessionsTable.applicationId, applicationsTable.id))
        .where(eq(sessionsTable.id, id))
        .all()

      if (rows.length === 0) throw new Error(`Session not found: ${id}`)
      const { applications } = rows[0]

      if (!applications.directoryPath) throw new Error(`Session ${id} has no directory path`)

      const now = new Date()

      // 2. Update files on disk if resume or coverLetter changed.
      if (updates.resume) {
        atomicWriteJson(join(applications.directoryPath, 'resume.json'), updates.resume)
      }
      if (updates.coverLetter) {
        atomicWriteJson(join(applications.directoryPath, 'cover-letter.json'), updates.coverLetter)
      }

      // 3. Update the sessions table.
      const sessionUpdates: Record<string, unknown> = {}
      if (updates.jobDescription !== undefined)
        sessionUpdates.jobDescription = updates.jobDescription
      if (updates.matchReport !== undefined)
        sessionUpdates.matchReport = JSON.stringify(updates.matchReport)
      if (updates.lastSaved !== undefined) sessionUpdates.lastSaved = updates.lastSaved

      if (Object.keys(sessionUpdates).length > 0) {
        db.update(sessionsTable).set(sessionUpdates).where(eq(sessionsTable.id, id)).run()
      }

      // 4. Update the applications table.
      db.update(applicationsTable)
        .set({ updatedAt: now })
        .where(eq(applicationsTable.id, applications.id))
        .run()
    }
  )

  ipcMain.handle('sessions:close', async (_event, _id: string) => {
    // STUB: Phase 2
    // TODO: Trigger a save of the session (same logic as sessions:update with current state),
    // then update the session row to mark it as closed (e.g. set a closedAt timestamp,
    // or simply ensure it is persisted — the session stays in the DB, just not "open").
    throw new Error('Not implemented')
  })

  // ─── Source Documents ────────────────────────────────────────────────────────

  ipcMain.handle(
    'docs:ingest',
    async (_event, filePath: string, type: SourceDocType): Promise<SourceDoc> => {
      // 1. Extract raw text — throws a typed IngestionError on known failure modes.
      const text = await extractText(filePath)

      // 2. Copy the file into data/source-documents/ with a stable <id><ext> name.
      const { sourceDocsDir } = getDataPaths()
      mkdirSync(sourceDocsDir, { recursive: true })
      const originalFilename = basename(filePath)
      const ext = extname(filePath)
      const docId = nanoid()
      const storedPath = join(sourceDocsDir, `${docId}${ext}`)
      copyFileSync(filePath, storedPath)

      const uploadedAt = new Date()
      const db = getDb()

      // 3. For resumes: call Claude to extract structured MasterCV data and merge.
      //    Cover letter ingestion records the file but defers writing-profile updates
      //    to Phase 5 (writingProfile:regenerate).
      if (type === 'resume') {
        const sourceLabel = `${originalFilename} uploaded ${formatUploadMonth(uploadedAt)}`
        if (isPlaceholderMode()) {
          writeMasterCV(
            mergeMasterCV(readMasterCV(), rawToMasterCV(PLACEHOLDER_RAW_CV, sourceLabel))
          )
        } else {
          const apiKey = await keytar.getPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
          if (!apiKey) throw new Error('API key not configured — validate it in Settings')

          const settings = readSettings()
          const model = settings.model
          const client = getAnthropicClient(apiKey)

          const response = await client.messages.create({
            model,
            ...extractResumePrompt(text)
          })

          const toolBlock = response.content.find((b) => b.type === 'tool_use')
          let parsed: RawExtractedCV
          if (toolBlock && toolBlock.type === 'tool_use') {
            parsed = toolBlock.input as RawExtractedCV
          } else {
            const textBlock = response.content.find((b) => b.type === 'text')
            if (!textBlock || textBlock.type !== 'text')
              throw new Error('Resume extraction returned no structured output')
            const raw = textBlock.text
              .replace(/^```(?:json)?\n?/, '')
              .replace(/\n?```$/, '')
              .trim()
            parsed = JSON.parse(raw) as RawExtractedCV
          }
          writeMasterCV(mergeMasterCV(readMasterCV(), rawToMasterCV(parsed, sourceLabel)))

          // 4. Log spend.
          const inputTokens = response.usage.input_tokens
          const outputTokens = response.usage.output_tokens
          db.insert(spendLog).values({
            id: nanoid(),
            timestamp: uploadedAt,
            model,
            inputTokens,
            outputTokens,
            estimatedCostUsd: estimateCostUsd(model, inputTokens, outputTokens)
          })
        }
      }

      // 5. Record source doc in the database.
      db.insert(sourceDocs).values({
        id: docId,
        filename: originalFilename,
        type,
        path: storedPath,
        uploadedAt,
        writingProfileIncorporatedAt: null
      })

      return {
        id: docId,
        filename: originalFilename,
        type,
        path: storedPath,
        uploadedAt: uploadedAt.toISOString(),
        writingProfileIncorporatedAt: null
      }
    }
  )

  ipcMain.handle('docs:getAll', async () => {
    // STUB: Phase 2
    // TODO: Query the source_docs table via Drizzle. Return all rows sorted by
    // uploadedAt descending.
    throw new Error('Not implemented')
  })

  ipcMain.handle('docs:delete', async (_event, _id: string) => {
    // STUB: Phase 2
    // TODO: Delete the source_docs row and the file at its stored path.
    // Note: deleting a source doc does not modify the Master CV — ingested
    // content is already merged and is the user's to manage.
    throw new Error('Not implemented')
  })

  // ─── Generation ──────────────────────────────────────────────────────────────

  ipcMain.handle('generate:resume', async (_event, sessionId: string): Promise<ResumeJson> => {
    const db = getDb()

    // 1. Load the session and application from the DB.
    const rows = db
      .select()
      .from(sessionsTable)
      .innerJoin(applicationsTable, eq(sessionsTable.applicationId, applicationsTable.id))
      .where(eq(sessionsTable.id, sessionId))
      .all()

    if (rows.length === 0) throw new Error(`Session not found: ${sessionId}`)
    const { sessions, applications } = rows[0]
    if (!applications.directoryPath) throw new Error(`Session ${sessionId} has no directory path`)

    let apiKey: string | null = null
    if (!isPlaceholderMode()) {
      apiKey = await keytar.getPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
      if (!apiKey) throw new Error('API key not configured — validate it in Settings')
    }

    const settings = readSettings()

    // 2. Generate the resume (writes resume.json and logs spend).
    const resume = await generateResumeFromCV(
      sessions.jobDescription,
      applications.directoryPath,
      settings.model,
      apiKey
    )

    // 3. Update sessions.lastSaved and applications.resumeStatus/updatedAt.
    const now = new Date()
    const lastSaved = now.toISOString()
    db.update(sessionsTable).set({ lastSaved }).where(eq(sessionsTable.id, sessionId))
    db.update(applicationsTable)
      .set({ resumeStatus: 'draft', updatedAt: now })
      .where(eq(applicationsTable.id, applications.id))

    return resume
  })

  ipcMain.handle(
    'generate:coverLetter',
    async (_event, sessionId: string): Promise<CoverLetterJson> => {
      const db = getDb()

      // 1. Load the session and application.
      const rows = db
        .select()
        .from(sessionsTable)
        .innerJoin(applicationsTable, eq(sessionsTable.applicationId, applicationsTable.id))
        .where(eq(sessionsTable.id, sessionId))
        .all()

      if (rows.length === 0) throw new Error(`Session not found: ${sessionId}`)
      const { sessions, applications } = rows[0]

      if (!applications.directoryPath) throw new Error(`Session ${sessionId} has no directory path`)

      let apiKey: string | null = null
      if (!isPlaceholderMode()) {
        apiKey = await keytar.getPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
        if (!apiKey) throw new Error('API key not configured — validate it in Settings')
      }

      const settings = readSettings()
      const model = settings.model

      // 2. Load writing-profile.json if it exists.
      let writingProfile: WritingProfile | null = null
      const wpPath = join(app.getPath('userData'), 'writing-profile.json')
      if (existsSync(wpPath)) {
        try {
          writingProfile = JSON.parse(readFileSync(wpPath, 'utf-8')) as WritingProfile
        } catch {
          // Best effort
        }
      }

      if (isPlaceholderMode()) {
        const coverLetter: CoverLetterJson = {
          salutation: 'Dear Hiring Manager,',
          paragraphs: [
            'Opening paragraph generated in placeholder mode.',
            'Body paragraph generated in placeholder mode.',
            'Closing paragraph generated in placeholder mode.'
          ],
          signoff: 'Sincerely,'
        }
        atomicWriteJson(join(applications.directoryPath, 'cover-letter.json'), coverLetter)
        return coverLetter
      }

      const masterCV = readMasterCV()
      const client = getAnthropicClient(apiKey!)

      const response = await client.messages.create({
        model,
        ...tailorCoverLetterPrompt(masterCV, sessions.jobDescription, writingProfile?.text)
      })

      const toolBlock = response.content.find((b) => b.type === 'tool_use')
      let coverLetter: CoverLetterJson
      if (toolBlock && toolBlock.type === 'tool_use') {
        coverLetter = toolBlock.input as CoverLetterJson
      } else {
        const textBlock = response.content.find((b) => b.type === 'text')
        if (!textBlock || textBlock.type !== 'text')
          throw new Error('Cover letter generation returned no structured output')
        const raw = textBlock.text
          .replace(/^```(?:json)?\n?/, '')
          .replace(/\n?```$/, '')
          .trim()
        coverLetter = JSON.parse(raw) as CoverLetterJson
      }

      // Write cover-letter.json to session directory.
      atomicWriteJson(join(applications.directoryPath, 'cover-letter.json'), coverLetter)

      // Log spend.
      const now = new Date()
      const inputTokens = response.usage.input_tokens
      const outputTokens = response.usage.output_tokens
      db.insert(spendLog)
        .values({
          id: nanoid(),
          timestamp: now,
          model,
          inputTokens,
          outputTokens,
          estimatedCostUsd: estimateCostUsd(model, inputTokens, outputTokens)
        })
        .run()

      // Update session status.
      db.update(applicationsTable)
        .set({ coverLetterStatus: 'draft', updatedAt: now })
        .where(eq(applicationsTable.id, applications.id))
        .run()

      return coverLetter
    }
  )

  ipcMain.handle('generate:matchReport', async (_event, _sessionId: string) => {
    // STUB: Phase 2
    // TODO:
    // 1. Load the session's JD and its current resume.json.
    // 2. Call Claude to evaluate alignment: identify keyword matches, strengths,
    //    and gaps. Return a qualitative rating (Strong/Good/Fair/Weak) plus lists
    //    of strengths and gaps as a MatchReport object.
    // 3. Serialize the report to JSON and store it in sessions.matchReport.
    // 4. Log the AI operation to spendLog.
    // 5. Return the MatchReport.
    throw new Error('Not implemented')
  })

  ipcMain.handle(
    'generate:feedback',
    async (
      _event,
      _sessionId: string,
      _documentType: DocumentType,
      _prompt: string | undefined
    ) => {
      // STUB: Phase 4
      // TODO:
      // 1. Load the session's JD and the requested document (resume or cover letter).
      // 2. Call Claude to evaluate the document against the JD. If prompt is provided,
      //    focus the evaluation on that concern (e.g. "ATS keywords", "tone").
      // 3. Return a list of FeedbackItem objects.
      // 4. Log the AI operation to spendLog.
      throw new Error('Not implemented')
    }
  )

  ipcMain.handle(
    'generate:revise',
    async (_event, _sessionId: string, _section: string, _instruction: string) => {
      // STUB: Phase 4
      // TODO:
      // 1. Load the session's JD and the current text of the targeted section/bullet.
      // 2. Call Claude with the current text and instruction to produce a revised version.
      // 3. Return only the proposed replacement text.
      // 4. Log the AI operation to spendLog.
      throw new Error('Not implemented')
    }
  )

  // ─── Master CV ───────────────────────────────────────────────────────────────
  // STUB: Phase 3

  ipcMain.handle('masterCV:get', async () => {
    // TODO: Read and parse master-cv.json from the data directory. If the file
    // doesn't exist, return an empty MasterCV ({ experience: [], education: [], skills: [] }).
    throw new Error('Not implemented')
  })

  ipcMain.handle('masterCV:save', async (_event, _cv: MasterCV) => {
    // TODO: Serialize the MasterCV to JSON and write it to master-cv.json.
    throw new Error('Not implemented')
  })

  ipcMain.handle('masterCV:regenerate', async (_event, _documentIds: string[] | undefined) => {
    // TODO: Gather source material and call Claude to produce RegenSuggestion objects.
    throw new Error('Not implemented')
  })

  // ─── Writing Profile ─────────────────────────────────────────────────────────
  // STUB: Phase 5

  ipcMain.handle('writingProfile:get', async () => {
    // TODO: Read and parse writing-profile.json. Return null if not found.
    throw new Error('Not implemented')
  })

  ipcMain.handle('writingProfile:save', async (_event, _profile: WritingProfile) => {
    // TODO: Atomic write of writing-profile.json.
    throw new Error('Not implemented')
  })

  ipcMain.handle('writingProfile:regenerate', async () => {
    // TODO: Re-derive the writing profile from all available cover letters.
    throw new Error('Not implemented')
  })

  // ─── Spend Log ───────────────────────────────────────────────────────────────
  // STUB: Phase 3
  ipcMain.handle('spendLog:getTotal', async () => {
    // STUB: Phase 3
    // TODO: Query the spend_log table for rows where timestamp >= (now - 24 hours).
    // Sum estimatedCostUsd. Return a SpendTotal object with totalUsd and periodHours: 24.
    throw new Error('Not implemented')
  })

  ipcMain.handle('spendLog:getLastOp', async () => {
    const db = getDb()
    const latest = db.select().from(spendLog).orderBy(desc(spendLog.timestamp)).limit(1).all()

    if (latest.length === 0) return null

    const op = latest[0]
    return {
      model: op.model,
      inputTokens: op.inputTokens,
      outputTokens: op.outputTokens,
      estimatedCostUsd: op.estimatedCostUsd
    }
  })

  // ─── Export ──────────────────────────────────────────────────────────────────
  // Implementation status: Phase 1.7 (pdf), Phase 6.1 (docx)

  ipcMain.handle(
    'export:pdf',
    async (_event, sessionId: string, type: DocumentType): Promise<string> => {
      const db = getDb()
      const settings = readSettings()

      // 1. Load the session and application from the DB.
      const rows = db
        .select()
        .from(sessionsTable)
        .innerJoin(applicationsTable, eq(sessionsTable.applicationId, applicationsTable.id))
        .where(eq(sessionsTable.id, sessionId))
        .all()

      if (rows.length === 0) throw new Error(`Session not found: ${sessionId}`)
      const { sessions: _sessions, applications } = rows[0]

      const { resume, coverLetter } = readSessionDocs(applications.directoryPath)
      const contact = settings.contactInfo

      // 2. Determine default filename.
      const docLabel = type === 'resume' ? 'Resume' : 'Cover Letter'
      const defaultFilename = `${contact.fullName || 'User'} - ${
        applications.companyName
      } - ${docLabel}.pdf`

      // 3. Show save dialog.
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: `Export ${docLabel} as PDF`,
        defaultPath: defaultFilename,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      })

      if (canceled || !filePath) return ''

      // 4. Perform export.
      try {
        if (type === 'resume') {
          if (!resume) throw new Error('No resume found to export')
          await exportResumePdf(resume, contact, filePath)
        } else {
          if (!coverLetter) throw new Error('No cover letter found to export')
          await exportCoverLetterPdf(coverLetter, contact, filePath)
        }
        return filePath
      } catch (err: unknown) {
        // Handle specific error types as requested in Phase 1.7.
        let message = 'Export failed'
        const error = err as { code?: string; message?: string }
        if (error.code === 'ENOSPC') {
          message = 'Export failed — not enough disk space.'
        } else if (error.code === 'EACCES' || error.code === 'EPERM') {
          message = `Export failed — the app doesn't have permission to write to ${filePath}.`
        } else if (error.code === 'ENOENT') {
          message = 'Export failed — the destination folder no longer exists.'
        } else {
          message = `Export failed: ${error.message}`
        }
        throw new Error(message)
      }
    }
  )

  ipcMain.handle('export:docx', async (_event, _sessionId: string, _type: DocumentType) => {
    // STUB: Phase 6
    // TODO: Use the `docx` npm package to reproduce the document layout.
    throw new Error('Not implemented')
  })

  // ─── Backup ──────────────────────────────────────────────────────────────────
  // STUB: Phase 6

  ipcMain.handle('backup:trigger', async () => {
    // TODO: Copy modified files to the backup location.
    throw new Error('Not implemented')
  })

  ipcMain.handle('backup:import', async (_event, _backupPath: string) => {
    // TODO: Import a backup archive.
    throw new Error('Not implemented')
  })
}
