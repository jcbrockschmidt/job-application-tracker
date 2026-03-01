// File system helpers for the main process.
// All path computation, directory setup, and atomic file I/O goes here so IPC
// handlers don't scatter fs calls throughout the codebase.
//
// STUB: ensureDataDirectories is the only function needed immediately (Phase 1).
// The read/write helpers for master-cv.json and writing-profile.json are stubs
// that will be implemented in Phase 1 (masterCV) and Phase 5 (writingProfile).

import { app } from 'electron'
import { join } from 'path'
import { mkdirSync, writeFileSync, renameSync, readFileSync, existsSync } from 'fs'
import type { MasterCV, WritingProfile } from '../../shared/types'

// ─── Path helpers ────────────────────────────────────────────────────────────

// Returns the absolute path to the app's data directory (<userData>/data/).
export function getDataDir(): string {
  return join(app.getPath('userData'), 'data')
}

// Returns a map of all well-known paths under the data directory.
export function getDataPaths(): {
  dataDir: string
  dbPath: string
  masterCvPath: string
  writingProfilePath: string
  applicationsDir: string
  sourceDocsDir: string
} {
  const dataDir = getDataDir()
  return {
    dataDir,
    dbPath: join(dataDir, 'app.db'),
    masterCvPath: join(dataDir, 'master-cv.json'),
    writingProfilePath: join(dataDir, 'writing-profile.json'),
    applicationsDir: join(dataDir, 'applications'),
    sourceDocsDir: join(dataDir, 'source-documents')
  }
}

// Returns the directory for a specific session.
// Caller is responsible for creating it if needed.
export function getSessionDir(companySlug: string, roleSlug: string, sessionId: string): string {
  const { applicationsDir } = getDataPaths()
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  return join(applicationsDir, companySlug, `${roleSlug}_${month}_${sessionId}`)
}

// ─── Directory setup ─────────────────────────────────────────────────────────

// Creates the full data directory tree on first launch. Safe to call every launch
// — mkdirSync with { recursive: true } is a no-op if directories already exist.
export function ensureDataDirectories(): void {
  const { dataDir, applicationsDir, sourceDocsDir } = getDataPaths()
  mkdirSync(dataDir, { recursive: true })
  mkdirSync(applicationsDir, { recursive: true })
  mkdirSync(sourceDocsDir, { recursive: true })
}

// ─── Atomic JSON write ───────────────────────────────────────────────────────

// Writes JSON to a file atomically: write to a .tmp file first, then rename.
// Prevents corruption if the process is killed mid-write.
export function atomicWriteJson(filePath: string, data: unknown): void {
  const tmp = `${filePath}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8')
  renameSync(tmp, filePath)
}

// ─── Master CV I/O ───────────────────────────────────────────────────────────

const EMPTY_MASTER_CV: MasterCV = { experience: [], education: [], skills: [] }

// Reads master-cv.json. Returns an empty MasterCV structure if the file doesn't exist.
// STUB: Does not yet validate the parsed JSON against the MasterCV shape.
export function readMasterCV(): MasterCV {
  const { masterCvPath } = getDataPaths()
  if (!existsSync(masterCvPath)) return EMPTY_MASTER_CV
  // TODO: Add try/catch and surface a typed error if the file is corrupt.
  return JSON.parse(readFileSync(masterCvPath, 'utf-8')) as MasterCV
}

// Writes master-cv.json atomically.
export function writeMasterCV(cv: MasterCV): void {
  const { masterCvPath } = getDataPaths()
  atomicWriteJson(masterCvPath, cv)
}

// ─── Writing Profile I/O ─────────────────────────────────────────────────────
// STUB: Phase 5

// Reads writing-profile.json. Returns null if the file doesn't exist.
export function readWritingProfile(): WritingProfile | null {
  // TODO: Implement — read and parse writing-profile.json.
  throw new Error('Not implemented')
}

// Writes writing-profile.json atomically.
export function writeWritingProfile(_profile: WritingProfile): void {
  // TODO: Implement — atomicWriteJson(writingProfilePath, profile).
  throw new Error('Not implemented')
}
