// Unit tests for applications IPC handlers.
//
// Strategy: mock electron so ipcMain.handle() captures each handler, then call
// handlers directly. External services (keytar, DB) are mocked.

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import type { Application } from '@shared/types'

let tempDir = ''

const capturedHandlers: Record<string, (...args: unknown[]) => Promise<unknown>> = {}

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => (name === 'userData' ? tempDir : '')
  },
  ipcMain: {
    handle: (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
      capturedHandlers[channel] = handler
    }
  }
}))

vi.mock('keytar', () => ({
  default: {
    getPassword: vi.fn(),
    setPassword: vi.fn().mockResolvedValue(undefined)
  }
}))

// Use vi.hoisted so all variables are initialized before vi.mock factories run.
const {
  mockAll,
  mockWhere,
  mockOrderBy,
  mockInnerJoin,
  mockFrom,
  mockSelect,
  mockValues,
  mockInsert,
  mockUpdateWhere,
  mockSet,
  mockUpdate,
  mockDelete,
  mockGet
} = vi.hoisted(() => {
  const mockAll = vi.fn().mockReturnValue([])
  const mockGet = vi.fn().mockReturnValue(undefined)
  const mockOrderBy = vi.fn().mockReturnValue({ all: mockAll })
  const mockWhere = vi.fn().mockReturnValue({ all: mockAll, orderBy: mockOrderBy, get: mockGet })
  const mockInnerJoin = vi.fn().mockReturnValue({
    where: mockWhere,
    orderBy: mockOrderBy,
    all: mockAll
  })
  const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin, where: mockWhere })
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

  // DB mutation mocks.
  const mockRun = vi.fn()
  const mockValues = vi.fn().mockReturnValue({ run: mockRun })
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
  const mockUpdateWhere = vi.fn().mockReturnValue({ run: mockRun })
  const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere })
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
  const mockDeleteWhere = vi.fn().mockReturnValue({ run: mockRun })
  const mockDelete = vi.fn().mockReturnValue({ where: mockDeleteWhere })

  return {
    mockAll,
    mockWhere,
    mockOrderBy,
    mockInnerJoin,
    mockFrom,
    mockSelect,
    mockValues,
    mockInsert,
    mockUpdateWhere,
    mockSet,
    mockUpdate,
    mockDelete,
    mockGet
  }
})

vi.mock('../../../main/ai', () => ({
  isPlaceholderMode: vi.fn().mockReturnValue(false),
  getAnthropicClient: vi.fn(),
  validateApiKey: vi.fn(),
  resetAnthropicClient: vi.fn(),
  listAvailableModels: vi.fn()
}))

vi.mock('../../../main/db', () => ({
  getDb: () => ({
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete
  })
}))

// pdf-parse reads a test PDF from disk at import time. Mock to prevent ENOENT.
vi.mock('pdf-parse', () => ({ default: vi.fn() }))
vi.mock('mammoth', () => ({ default: { extractRawText: vi.fn() } }))

vi.mock('../../../main/ingestion', () => ({
  extractText: vi.fn()
}))

vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('default-nanoid-id')
}))

import { registerIpcHandlers } from '../../../main/ipc/index'

beforeAll(() => {
  registerIpcHandlers()
})

function rebuildDbChain(): void {
  mockAll.mockReturnValue([])
  mockGet.mockReturnValue(undefined)
  mockOrderBy.mockReturnValue({ all: mockAll })
  mockWhere.mockReturnValue({ all: mockAll, orderBy: mockOrderBy, get: mockGet })
  mockInnerJoin.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy, all: mockAll })
  mockFrom.mockReturnValue({ innerJoin: mockInnerJoin, where: mockWhere })
  mockSelect.mockReturnValue({ from: mockFrom })
  mockValues.mockReturnValue({ run: vi.fn() })
  mockInsert.mockReturnValue({ values: mockValues })
  mockUpdateWhere.mockReturnValue({ run: vi.fn() })
  mockSet.mockReturnValue({ where: mockUpdateWhere })
  mockUpdate.mockReturnValue({ set: mockSet })
  mockDelete.mockReturnValue({ where: vi.fn().mockReturnValue({ run: vi.fn() }) })
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'job-app-apps-test-'))
  vi.clearAllMocks()
  rebuildDbChain()
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

const callHandler = <T>(channel: string, ...args: unknown[]): Promise<T> =>
  capturedHandlers[channel](null, ...args) as Promise<T>

function makeMockApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 'app-id-1',
    companyName: 'Acme Corp',
    roleTitle: 'Senior Engineer',
    briefSummary: 'Summary',
    dateGenerated: new Date().toISOString(),
    resumeStatus: 'draft',
    coverLetterStatus: 'none',
    applicationStatus: 'not_applied',
    notes: null,
    submittedDate: null,
    directoryPath: join(tempDir, 'data', 'applications', 'acme-corp', 'senior-engineer_sess-id-1'),
    resumeLastFinalizedAt: null,
    resumeIncorporatedAt: null,
    coverLetterLastFinalizedAt: null,
    coverLetterIncorporatedAt: null,
    coverLetterWritingProfileIncorporatedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('applications:update', () => {
  it('updates the notes field in the DB', async () => {
    const existing = makeMockApplication()
    // Mock getApplicationById(db, id)
    mockGet.mockReturnValue({
      ...existing,
      createdAt: new Date(existing.createdAt),
      updatedAt: new Date(existing.updatedAt)
    })

    await callHandler('applications:update', 'app-id-1', { notes: 'New notes' })

    expect(mockUpdate).toHaveBeenCalled()
    const setCall = mockSet.mock.calls.find(
      (c) => (c[0] as { notes?: string }).notes === 'New notes'
    )
    expect(setCall).toBeDefined()
  })

  it('updates the status field in the DB', async () => {
    const existing = makeMockApplication()
    mockGet.mockReturnValue({
      ...existing,
      createdAt: new Date(existing.createdAt),
      updatedAt: new Date(existing.updatedAt)
    })

    await callHandler('applications:update', 'app-id-1', { applicationStatus: 'applied' })

    expect(mockUpdate).toHaveBeenCalled()
    const setCall = mockSet.mock.calls.find(
      (c) => (c[0] as { applicationStatus?: string }).applicationStatus === 'applied'
    )
    expect(setCall).toBeDefined()
  })

  it('updates the submittedDate field in the DB', async () => {
    const existing = makeMockApplication()
    mockGet.mockReturnValue({
      ...existing,
      createdAt: new Date(existing.createdAt),
      updatedAt: new Date(existing.updatedAt)
    })

    const newDate = new Date().toISOString()
    await callHandler('applications:update', 'app-id-1', { submittedDate: newDate })

    expect(mockUpdate).toHaveBeenCalled()
    const setCall = mockSet.mock.calls.find(
      (c) => (c[0] as { submittedDate?: string }).submittedDate === newDate
    )
    expect(setCall).toBeDefined()
  })

  it('performs a partial update (only one field)', async () => {
    const existing = makeMockApplication()
    mockGet.mockReturnValue({
      ...existing,
      createdAt: new Date(existing.createdAt),
      updatedAt: new Date(existing.updatedAt)
    })

    await callHandler('applications:update', 'app-id-1', { notes: 'Only notes' })

    expect(mockUpdate).toHaveBeenCalled()
    const setCall = mockSet.mock.calls[0][0] as Partial<Application>
    expect(setCall.notes).toBe('Only notes')
    expect(setCall.applicationStatus).toBeUndefined()
  })

  it('throws when the application is not found', async () => {
    mockGet.mockReturnValue(undefined)

    await expect(
      callHandler('applications:update', 'nonexistent', { notes: 'hi' })
    ).rejects.toThrow('Application not found: nonexistent')
  })
})
