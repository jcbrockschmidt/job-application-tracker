// Unit tests for export:pdf IPC handler.

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import type { ResumeJson } from '@shared/types'

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
  },
  dialog: {
    showSaveDialog: vi.fn()
  }
}))

vi.mock('keytar', () => ({
  default: {
    getPassword: vi.fn(),
    setPassword: vi.fn().mockResolvedValue(undefined)
  }
}))

const { mockAll, mockWhere, mockInnerJoin, mockFrom, mockSelect } = vi.hoisted(() => {
  const mockAll = vi.fn().mockReturnValue([])
  const mockWhere = vi.fn().mockReturnValue({ all: mockAll })
  const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere, all: mockAll })
  const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

  return {
    mockAll,
    mockWhere,
    mockInnerJoin,
    mockFrom,
    mockSelect
  }
})

vi.mock('../../../main/db', () => ({
  getDb: () => ({
    select: mockSelect
  })
}))

vi.mock('../../../main/export', () => ({
  exportResumePdf: vi.fn().mockResolvedValue(undefined),
  exportCoverLetterPdf: vi.fn().mockResolvedValue(undefined),
  exportResumeDocx: vi.fn().mockResolvedValue(undefined),
  exportCoverLetterDocx: vi.fn().mockResolvedValue(undefined)
}))

// Mock ai module to prevent real API calls or issues with client init
vi.mock('../../../main/ai', () => ({
  isPlaceholderMode: vi.fn().mockReturnValue(false),
  getAnthropicClient: vi.fn(),
  validateApiKey: vi.fn(),
  resetAnthropicClient: vi.fn(),
  listAvailableModels: vi.fn()
}))

// pdf-parse reads a test PDF from disk at import time. Mock to prevent ENOENT.
vi.mock('pdf-parse', () => ({ default: vi.fn() }))
vi.mock('mammoth', () => ({ default: { extractRawText: vi.fn() } }))

import { registerIpcHandlers } from '../../../main/ipc/index'
import { dialog } from 'electron'
import { exportResumePdf } from '../../../main/export'

beforeAll(() => {
  registerIpcHandlers()
})

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'job-app-export-test-'))
  vi.clearAllMocks()

  mockAll.mockReturnValue([])
  mockWhere.mockReturnValue({ all: mockAll })
  mockInnerJoin.mockReturnValue({ where: mockWhere, all: mockAll })
  mockFrom.mockReturnValue({ innerJoin: mockInnerJoin })
  mockSelect.mockReturnValue({ from: mockFrom })
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

const callHandler = <T>(channel: string, ...args: unknown[]): Promise<T> =>
  capturedHandlers[channel](null, ...args) as Promise<T>

function makeMockDbRow(overrides: {
  sessionId?: string
  applicationId?: string
  companyName?: string
  directoryPath?: string | null
}) {
  const {
    sessionId = 'sess-id-1',
    applicationId = 'app-id-1',
    companyName = 'Acme Corp',
    directoryPath = join(tempDir, 'data', 'applications', 'acme', 'sess-id-1')
  } = overrides
  return {
    sessions: {
      id: sessionId,
      applicationId,
      jobDescription: 'JD',
      matchReport: null,
      lastSaved: new Date().toISOString(),
      createdAt: new Date()
    },
    applications: {
      id: applicationId,
      companyName,
      roleTitle: 'Engineer',
      directoryPath,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

describe('export:pdf IPC', () => {
  it('shows save dialog and calls exportResumePdf on success', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'acme', 'sess-1')
    mkdirSync(sessionDir, { recursive: true })
    const resumeData: ResumeJson = { experience: [], education: [], skills: [] }
    writeFileSync(join(sessionDir, 'resume.json'), JSON.stringify(resumeData))

    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])
    vi.mocked(dialog.showSaveDialog).mockResolvedValue({
      filePath: '/path/to/save.pdf',
      canceled: false
    })

    const result = await callHandler<string>('export:pdf', 'sess-id-1', 'resume')

    expect(result).toBe('/path/to/save.pdf')
    expect(dialog.showSaveDialog).toHaveBeenCalled()
    expect(exportResumePdf).toHaveBeenCalledWith(resumeData, expect.anything(), '/path/to/save.pdf')
  })

  it('returns empty string when save dialog is canceled', async () => {
    mockAll.mockReturnValue([makeMockDbRow({})])
    vi.mocked(dialog.showSaveDialog).mockResolvedValue({ filePath: '', canceled: true })

    const result = await callHandler<string>('export:pdf', 'sess-id-1', 'resume')

    expect(result).toBe('')
    expect(exportResumePdf).not.toHaveBeenCalled()
  })

  it('throws with user-friendly message on ENOSPC error', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'acme', 'sess-1')
    mkdirSync(sessionDir, { recursive: true })
    writeFileSync(
      join(sessionDir, 'resume.json'),
      JSON.stringify({ experience: [], education: [], skills: [] })
    )

    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])
    vi.mocked(dialog.showSaveDialog).mockResolvedValue({
      filePath: '/some/path.pdf',
      canceled: false
    })

    const error = new Error('No space left')
    ;(error as { code?: string }).code = 'ENOSPC'
    vi.mocked(exportResumePdf).mockRejectedValue(error)

    await expect(callHandler('export:pdf', 'sess-id-1', 'resume')).rejects.toThrow(
      'Export failed — not enough disk space.'
    )
  })
})
