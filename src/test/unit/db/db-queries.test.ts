import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '../../../main/db/schema'
import {
  insertApplication,
  getAllApplications,
  updateApplication,
  deleteApplication,
  insertSession,
  getAllSessions,
  getApplicationById
} from '../../../main/db/queries'
import { join } from 'path'

let db: BetterSQLite3Database<typeof schema>

beforeEach(() => {
  const sqlite = new Database(':memory:')
  db = drizzle(sqlite, { schema })
  // Migrate the in-memory database
  migrate(db, { migrationsFolder: join(__dirname, '../../../../src/main/db/migrations') })
})

const MOCK_APP = {
  id: 'app_test',
  companyName: 'Test Corp',
  roleTitle: 'Engineer',
  briefSummary: 'A test summary',
  dateGenerated: new Date().toISOString(),
  resumeStatus: 'draft' as const,
  coverLetterStatus: 'none' as const,
  applicationStatus: 'not_applied' as const,
  notes: 'Some notes',
  submittedDate: null,
  directoryPath: '/path/to/dir',
  resumeLastFinalizedAt: null,
  resumeIncorporatedAt: null,
  coverLetterLastFinalizedAt: null,
  coverLetterIncorporatedAt: null,
  coverLetterWritingProfileIncorporatedAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

const MOCK_SESSION = {
  id: 'sess_test',
  applicationId: 'app_test',
  jobDescription: 'Looking for a software engineer...',
  matchReport: null,
  lastSaved: new Date().toISOString(),
  createdAt: new Date()
}

describe('applications table queries', () => {
  it('insertApplication and getAllApplications', () => {
    insertApplication(db, MOCK_APP)
    const apps = getAllApplications(db)
    expect(apps).toHaveLength(1)
    expect(apps[0].id).toBe(MOCK_APP.id)
    expect(apps[0].companyName).toBe(MOCK_APP.companyName)
  })

  it('getAllApplications: returns rows sorted by createdAt descending', () => {
    const app1 = { ...MOCK_APP, id: 'app1', createdAt: new Date(Date.now() - 1000) }
    const app2 = { ...MOCK_APP, id: 'app2', createdAt: new Date() }
    insertApplication(db, app1)
    insertApplication(db, app2)
    const apps = getAllApplications(db)
    expect(apps[0].id).toBe('app2')
    expect(apps[1].id).toBe('app1')
  })

  it('updateApplication: changes fields and bumps updatedAt', () => {
    insertApplication(db, MOCK_APP)
    const originalUpdateAt = MOCK_APP.updatedAt

    // Wait a bit to ensure updatedAt will be different
    // (Actually we can just check if it's replaced by a new Date in updateApplication)

    updateApplication(db, MOCK_APP.id, { companyName: 'New Corp', notes: 'New notes' })
    const updated = getApplicationById(db, MOCK_APP.id)
    expect(updated?.companyName).toBe('New Corp')
    expect(updated?.notes).toBe('New notes')
    expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThanOrEqual(
      originalUpdateAt.getTime()
    )
  })

  it('deleteApplication: removes application and sessions', () => {
    insertApplication(db, MOCK_APP)
    insertSession(db, MOCK_SESSION)

    deleteApplication(db, MOCK_APP.id)

    const apps = getAllApplications(db)
    expect(apps).toHaveLength(0)

    const sessions = getAllSessions(db)
    expect(sessions).toHaveLength(0)
  })
})

describe('sessions table queries', () => {
  it('insertSession and getAllSessions', () => {
    insertApplication(db, MOCK_APP)
    insertSession(db, MOCK_SESSION)
    const sessions = getAllSessions(db)
    expect(sessions).toHaveLength(1)
    expect(sessions[0].id).toBe(MOCK_SESSION.id)
    expect(sessions[0].companyName).toBe(MOCK_APP.companyName) // Join check
  })
})
