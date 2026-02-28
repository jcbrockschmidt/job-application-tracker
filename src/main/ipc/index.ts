import { ipcMain } from 'electron'
import type { SourceDocType, DocumentType } from '../../shared/types'

export function registerIpcHandlers(): void {
  // ─── Settings ───────────────────────────────────────────────────────────────

  ipcMain.handle('settings:get', async () => {
    // TODO: read from keychain + app config file
    throw new Error('Not implemented')
  })

  ipcMain.handle('settings:save', async (_event, _settings: unknown) => {
    // TODO: persist to keychain + app config file
    throw new Error('Not implemented')
  })

  ipcMain.handle('settings:validateApiKey', async (_event, _apiKey: string) => {
    // TODO: call validateApiKey from ai module
    throw new Error('Not implemented')
  })

  ipcMain.handle('settings:getAvailableModels', async () => {
    // TODO: call listAvailableModels from ai module
    throw new Error('Not implemented')
  })

  // ─── Applications ────────────────────────────────────────────────────────────

  ipcMain.handle('applications:getAll', async () => {
    // TODO: query applications table via Drizzle
    throw new Error('Not implemented')
  })

  ipcMain.handle('applications:update', async (_event, _id: string, _updates: unknown) => {
    // TODO: update applications table
    throw new Error('Not implemented')
  })

  ipcMain.handle('applications:delete', async (_event, _id: string) => {
    // TODO: delete application + associated files
    throw new Error('Not implemented')
  })

  // ─── Sessions ────────────────────────────────────────────────────────────────

  ipcMain.handle('sessions:create', async (_event, _jobDescription: string) => {
    // TODO: create application row, run generation, return Session
    throw new Error('Not implemented')
  })

  ipcMain.handle('sessions:get', async (_event, _id: string) => {
    // TODO: load session + documents from DB/filesystem
    throw new Error('Not implemented')
  })

  ipcMain.handle('sessions:getAll', async () => {
    // TODO: return all persisted sessions
    throw new Error('Not implemented')
  })

  ipcMain.handle('sessions:update', async (_event, _id: string, _updates: unknown) => {
    // TODO: persist session changes
    throw new Error('Not implemented')
  })

  ipcMain.handle('sessions:close', async (_event, _id: string) => {
    // TODO: auto-save and remove from open sessions list
    throw new Error('Not implemented')
  })

  // ─── Source Documents ────────────────────────────────────────────────────────

  ipcMain.handle('docs:ingest', async (_event, _filePath: string, _type: SourceDocType) => {
    // TODO: extract text, send to LLM, store structured output
    throw new Error('Not implemented')
  })

  ipcMain.handle('docs:getAll', async () => {
    // TODO: query source_docs table
    throw new Error('Not implemented')
  })

  ipcMain.handle('docs:delete', async (_event, _id: string) => {
    // TODO: delete source doc record + file
    throw new Error('Not implemented')
  })

  // ─── Generation ──────────────────────────────────────────────────────────────

  ipcMain.handle('generate:resume', async (_event, _sessionId: string) => {
    // TODO: call Claude with job description + source docs, return ResumeJson
    throw new Error('Not implemented')
  })

  ipcMain.handle('generate:coverLetter', async (_event, _sessionId: string) => {
    // TODO: call Claude with job description + source docs, return CoverLetterJson
    throw new Error('Not implemented')
  })

  ipcMain.handle(
    'generate:revise',
    async (_event, _sessionId: string, _section: string, _instruction: string) => {
      // TODO: call Claude for targeted revision, return diff for user approval
      throw new Error('Not implemented')
    }
  )

  // ─── Export ──────────────────────────────────────────────────────────────────

  ipcMain.handle('export:pdf', async (_event, _sessionId: string, _type: DocumentType) => {
    // TODO: render document to PDF and save to user-chosen path
    throw new Error('Not implemented')
  })

  ipcMain.handle('export:docx', async (_event, _sessionId: string, _type: DocumentType) => {
    // TODO: render document to DOCX matching PDF layout
    throw new Error('Not implemented')
  })

  // ─── Backup ──────────────────────────────────────────────────────────────────

  ipcMain.handle('backup:trigger', async () => {
    // TODO: run incremental backup to configured backup directory
    throw new Error('Not implemented')
  })

  ipcMain.handle('backup:import', async (_event, _backupPath: string) => {
    // TODO: restore data from a backup archive
    throw new Error('Not implemented')
  })
}
