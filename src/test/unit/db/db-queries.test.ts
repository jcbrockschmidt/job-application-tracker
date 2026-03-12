// STUB: Phase 8 — Integration tests for Drizzle ORM queries against an in-memory SQLite DB.
//
// Tests run entirely in process — no Electron, no IPC, no file system.
// A fresh in-memory database is created before each describe block.
//
// Covered queries (grouped by table):
//   applications — insert, getAll, update (including rename path logic), delete
//   sessions      — insert, getById, getAll
//   spendLog      — insert, sumLast24Hours
//
// All Claude API calls are mocked (not needed here since these test pure DB logic).
//
// TODO (Phase 8): implement the Drizzle query helpers before enabling these tests.
//   Expected location: src/main/db/queries.ts
//   The helpers should accept a db parameter rather than calling getDb() directly,
//   making them easily testable with a test-scoped in-memory database.
//
//   Expected exports:
//     insertApplication(db, data) → Application
//     getAllApplications(db) → Application[]
//     updateApplication(db, id, updates) → void
//     deleteApplication(db, id) → void
//     insertSession(db, data) → Session
//     getSessionById(db, id) → Session | undefined
//     getAllSessions(db) → Session[]
//     insertSpendLog(db, data) → void
//     sumSpendLast24Hours(db, now?: Date) → number

import { describe, it, expect, beforeEach } from 'vitest'

// TODO: uncomment once the query module and in-memory test helper exist:
//   import Database from 'better-sqlite3'
//   import { drizzle } from 'drizzle-orm/better-sqlite3'
//   import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
//   import * as schema from '../../../main/db/schema'
//   import {
//     insertApplication, getAllApplications, updateApplication, deleteApplication,
//     insertSession, getSessionById, getAllSessions,
//     insertSpendLog, sumSpendLast24Hours
//   } from '../../../main/db/queries'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null // STUB — will be a Drizzle instance over an in-memory SQLite DB

// TODO: replace STUBS with real setup once query module exists:
//
//   beforeEach(() => {
//     const sqlite = new Database(':memory:')
//     db = drizzle(sqlite, { schema })
//     migrate(db, { migrationsFolder: './drizzle' })
//   })

beforeEach(() => {
  db = null // placeholder
})

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_APP = {
  id: 'app_test',
  companyName: 'Test Corp',
  roleTitle: 'Engineer',
  briefSummary: null,
  dateGenerated: new Date().toISOString(),
  resumeStatus: 'draft' as const,
  coverLetterStatus: 'none' as const,
  applicationStatus: 'not_applied' as const,
  notes: null,
  submittedDate: null,
  directoryPath: null,
  resumeLastFinalizedAt: null,
  resumeIncorporatedAt: null,
  coverLetterLastFinalizedAt: null,
  coverLetterIncorporatedAt: null,
  coverLetterWritingProfileIncorporatedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const MOCK_SESSION = {
  id: 'sess_test',
  applicationId: 'app_test',
  companyName: 'Test Corp',
  roleTitle: 'Engineer',
  jobDescription: 'Looking for a software engineer...',
  dateGenerated: new Date().toISOString(),
  resume: null,
  resumeStatus: 'draft' as const,
  coverLetter: null,
  coverLetterStatus: 'none' as const,
  matchReport: null,
  lastSaved: new Date().toISOString(),
  isGenerating: false,
  generationError: null,
  createdAt: new Date()
}

const MOCK_SPEND_ENTRY = {
  id: 'spend_test',
  timestamp: new Date(),
  model: 'claude-sonnet-4-6',
  inputTokens: 1500,
  outputTokens: 800,
  estimatedCostUsd: 0.0045
}

// ── Applications ──────────────────────────────────────────────────────────────

describe('applications table', () => {
  it.todo('insertApplication: row is retrievable by getAllApplications')
  it.todo('getAllApplications: returns an empty array when the table is empty')
  it.todo('getAllApplications: returns rows sorted by createdAt descending')
  it.todo('updateApplication: changes the specified fields and bumps updatedAt')
  it.todo('updateApplication: does not modify unspecified fields')
  it.todo('deleteApplication: row no longer appears in getAllApplications')
  it.todo('deleteApplication: does not throw when the id does not exist')

  it('placeholder: fixture has the expected shape', () => {
    expect(MOCK_APP.companyName).toBe('Test Corp')
    expect(db).toBeNull() // remove once implemented
  })
})

// ── Sessions ──────────────────────────────────────────────────────────────────

describe('sessions table', () => {
  it.todo('insertSession: row is retrievable by getSessionById')
  it.todo('getSessionById: returns undefined for a non-existent id')
  it.todo('getAllSessions: returns all rows joined with their application data')
  it.todo('getAllSessions: returns rows sorted by createdAt descending')

  it('placeholder: fixture has the expected shape', () => {
    expect(MOCK_SESSION.applicationId).toBe('app_test')
  })
})

// ── spendLog ──────────────────────────────────────────────────────────────────

describe('spendLog table', () => {
  const NOW = new Date('2026-03-01T12:00:00Z')
  const TWENTY_FIVE_HOURS_AGO = new Date(NOW.getTime() - 25 * 60 * 60 * 1000)

  it.todo('insertSpendLog: row is persisted to the table')

  it.todo('sumSpendLast24Hours: returns 0 when the table is empty')

  it.todo('sumSpendLast24Hours: sums only entries within the last 24 hours')

  it.todo('sumSpendLast24Hours: excludes entries older than 24 hours')

  it.todo('sumSpendLast24Hours: entries exactly at the 24-hour boundary are included (>=)')

  it('placeholder: fixture has the expected shape', () => {
    expect(MOCK_SPEND_ENTRY.estimatedCostUsd).toBe(0.0045)
    expect(TWENTY_FIVE_HOURS_AGO.getTime()).toBeLessThan(NOW.getTime())
  })
})
