import { eq, desc } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import type { Application, Session } from '../../shared/types'

export function insertApplication(
  db: BetterSQLite3Database<typeof schema>,
  data: typeof schema.applications.$inferInsert
): void {
  db.insert(schema.applications).values(data).run()
}

export function insertSession(
  db: BetterSQLite3Database<typeof schema>,
  data: typeof schema.sessions.$inferInsert
): void {
  db.insert(schema.sessions).values(data).run()
}

export function getAllApplications(db: BetterSQLite3Database<typeof schema>): Application[] {
  const rows = db
    .select()
    .from(schema.applications)
    .orderBy(desc(schema.applications.createdAt))
    .all()
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    resumeLastFinalizedAt: row.resumeLastFinalizedAt?.toISOString() || null,
    resumeIncorporatedAt: row.resumeIncorporatedAt?.toISOString() || null,
    coverLetterLastFinalizedAt: row.coverLetterLastFinalizedAt?.toISOString() || null,
    coverLetterIncorporatedAt: row.coverLetterIncorporatedAt?.toISOString() || null,
    coverLetterWritingProfileIncorporatedAt:
      row.coverLetterWritingProfileIncorporatedAt?.toISOString() || null
  })) as Application[]
}

export function updateApplication(
  db: BetterSQLite3Database<typeof schema>,
  id: string,
  updates: Partial<Application>
): void {
  const dbUpdates: Record<string, unknown> = { ...updates, updatedAt: new Date() }

  // Convert ISO strings back to Dates for Drizzle if they are present in updates
  if (updates.createdAt) dbUpdates.createdAt = new Date(updates.createdAt)
  if (updates.resumeLastFinalizedAt)
    dbUpdates.resumeLastFinalizedAt = new Date(updates.resumeLastFinalizedAt)
  if (updates.resumeIncorporatedAt)
    dbUpdates.resumeIncorporatedAt = new Date(updates.resumeIncorporatedAt)
  if (updates.coverLetterLastFinalizedAt)
    dbUpdates.coverLetterLastFinalizedAt = new Date(updates.coverLetterLastFinalizedAt)
  if (updates.coverLetterIncorporatedAt)
    dbUpdates.coverLetterIncorporatedAt = new Date(updates.coverLetterIncorporatedAt)
  if (updates.coverLetterWritingProfileIncorporatedAt)
    dbUpdates.coverLetterWritingProfileIncorporatedAt = new Date(
      updates.coverLetterWritingProfileIncorporatedAt
    )

  db.update(schema.applications).set(dbUpdates).where(eq(schema.applications.id, id)).run()
}

export function deleteApplication(db: BetterSQLite3Database<typeof schema>, id: string): void {
  // Associated sessions are deleted via cascade if foreign keys are enabled,
  // but better-sqlite3 needs PRAGMA foreign_keys = ON.
  // We'll delete them explicitly to be safe if not sure about PRAGMA.
  db.delete(schema.sessions).where(eq(schema.sessions.applicationId, id)).run()
  db.delete(schema.applications).where(eq(schema.applications.id, id)).run()
}

export function getApplicationById(
  db: BetterSQLite3Database<typeof schema>,
  id: string
): Application | undefined {
  const row = db.select().from(schema.applications).where(eq(schema.applications.id, id)).get()
  if (!row) return undefined
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    resumeLastFinalizedAt: row.resumeLastFinalizedAt?.toISOString() || null,
    resumeIncorporatedAt: row.resumeIncorporatedAt?.toISOString() || null,
    coverLetterLastFinalizedAt: row.coverLetterLastFinalizedAt?.toISOString() || null,
    coverLetterIncorporatedAt: row.coverLetterIncorporatedAt?.toISOString() || null,
    coverLetterWritingProfileIncorporatedAt:
      row.coverLetterWritingProfileIncorporatedAt?.toISOString() || null
  } as Application
}

// Session queries
export function getAllSessions(db: BetterSQLite3Database<typeof schema>): Session[] {
  // This is a bit complex because we need to join with applications and read files.
  // The IPC handler already has a good implementation, but we can move the DB part here.
  const rows = db
    .select()
    .from(schema.sessions)
    .innerJoin(schema.applications, eq(schema.sessions.applicationId, schema.applications.id))
    .orderBy(desc(schema.applications.updatedAt))
    .all()

  return rows.map(({ sessions, applications }) => ({
    id: sessions.id,
    applicationId: sessions.applicationId,
    companyName: applications.companyName,
    roleTitle: applications.roleTitle,
    jobDescription: sessions.jobDescription,
    dateGenerated: applications.dateGenerated,
    resume: null, // Placeholder, files are read in IPC handler
    resumeStatus: applications.resumeStatus,
    coverLetter: null, // Placeholder
    coverLetterStatus: applications.coverLetterStatus,
    matchReport: sessions.matchReport ? JSON.parse(sessions.matchReport) : null,
    lastSaved: sessions.lastSaved,
    isOpen: sessions.isOpen,
    isGenerating: false,
    generationError: null
  }))
}
