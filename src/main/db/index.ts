import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'
import * as schema from './schema'

let db: ReturnType<typeof drizzle<typeof schema>>

export function initDatabase(): void {
  const dataDir = join(app.getPath('userData'), 'data')
  mkdirSync(dataDir, { recursive: true })

  const dbPath = join(dataDir, 'app.db')
  const sqlite = new Database(dbPath)

  // Enable WAL mode for better concurrent read performance
  sqlite.pragma('journal_mode = WAL')

  db = drizzle(sqlite, { schema })

  // Run migrations from the bundled migrations directory
  const migrationsFolder = join(__dirname, 'migrations')
  migrate(db, { migrationsFolder })
}

export function getDb(): typeof db {
  if (!db) throw new Error('Database not initialized — call initDatabase() first')
  return db
}
