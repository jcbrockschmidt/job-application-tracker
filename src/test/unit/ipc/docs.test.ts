// Unit tests for the docs:ingest IPC handler in src/main/ipc/index.ts.
//
// Strategy: mock electron so ipcMain.handle() captures each handler, then call
// handlers directly. app.getPath is pointed at a real temporary directory so
// fs operations (mkdirSync, copyFileSync, writeMasterCV) run against the actual
// filesystem. External services (keytar, Anthropic, DB) are mocked.

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import type { SourceDoc, SourceDocType } from '@shared/types'

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
const { mockMessagesCreate, mockExtractText, mockValues, mockInsert } = vi.hoisted(() => {
  const mockMessagesCreate = vi.fn()
  const mockExtractText = vi.fn()
  const mockValues = vi.fn()
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
  return { mockMessagesCreate, mockExtractText, mockValues, mockInsert }
})

vi.mock('../../../main/ai', () => ({
  isPlaceholderMode: vi.fn().mockReturnValue(false),
  getAnthropicClient: vi.fn().mockReturnValue({
    messages: { create: mockMessagesCreate }
  }),
  validateApiKey: vi.fn(),
  resetAnthropicClient: vi.fn()
}))

// extractText is mocked so no real PDF/DOCX parsing occurs.
vi.mock('../../../main/ingestion', () => ({
  extractText: mockExtractText
}))

// Mock the DB: capture insert calls for assertion.
vi.mock('../../../main/db', () => ({
  getDb: () => ({ insert: mockInsert })
}))

// pdf-parse reads a test PDF from disk at import time. Mock to prevent ENOENT.
vi.mock('pdf-parse', () => ({ default: vi.fn() }))
vi.mock('mammoth', () => ({ default: { extractRawText: vi.fn() } }))

vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('test-id')
}))

import { registerIpcHandlers } from '../../../main/ipc/index'
import keytar from 'keytar'

beforeAll(() => {
  registerIpcHandlers()
})

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'job-app-docs-test-'))
  vi.clearAllMocks()
  // Reset insert mock after clearAllMocks restores it.
  mockInsert.mockReturnValue({ values: mockValues })
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

// Helper: invoke the docs:ingest handler directly.
const docsIngest = (filePath: string, type: SourceDocType): Promise<SourceDoc> =>
  capturedHandlers['docs:ingest'](null, filePath, type) as Promise<SourceDoc>

// Helper: create a throwaway file in tempDir to act as the uploaded file.
function makeUploadedFile(name: string, content = 'fake content'): string {
  const filePath = join(tempDir, name)
  writeFileSync(filePath, content, 'utf-8')
  return filePath
}

// A minimal valid AI response for resume extraction.
const RESUME_AI_RESPONSE = {
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        experience: [
          {
            title: 'Software Engineer',
            company: 'Acme Corp',
            startDate: 'Jan 2023',
            endDate: 'Present',
            bullets: ['Built scalable APIs.']
          }
        ],
        education: [{ degree: 'B.S. CS', institution: 'MIT', graduationDate: '2020' }],
        skills: [{ category: 'Languages', items: ['TypeScript', 'Python'] }]
      })
    }
  ],
  usage: { input_tokens: 1000, output_tokens: 500 }
}

// ── Cover letter ingest ────────────────────────────────────────────────────────

describe('docs:ingest — cover_letter', () => {
  beforeEach(() => {
    mockExtractText.mockResolvedValue('Cover letter text content')
  })

  it('returns a SourceDoc with the correct fields', async () => {
    const filePath = makeUploadedFile('cover-letter.pdf')
    const result = await docsIngest(filePath, 'cover_letter')

    expect(result.id).toBe('test-id')
    expect(result.filename).toBe('cover-letter.pdf')
    expect(result.type).toBe('cover_letter')
    expect(result.writingProfileIncorporatedAt).toBeNull()
  })

  it('stores the file in the source-documents directory', async () => {
    const filePath = makeUploadedFile('my-cover.pdf')

    await docsIngest(filePath, 'cover_letter')

    // The stored file path should be <userData>/data/source-documents/test-id.pdf
    const storedPath = join(tempDir, 'data', 'source-documents', 'test-id.pdf')
    expect(existsSync(storedPath)).toBe(true)
  })

  it('sets the stored path on the returned SourceDoc', async () => {
    const filePath = makeUploadedFile('resume.docx')
    const result = await docsIngest(filePath, 'cover_letter')

    expect(result.path).toContain('test-id.docx')
    expect(result.path).toContain('source-documents')
  })

  it('does not call the Anthropic API for cover letter ingestion', async () => {
    const filePath = makeUploadedFile('cover.pdf')

    await docsIngest(filePath, 'cover_letter')

    expect(mockMessagesCreate).not.toHaveBeenCalled()
    expect(keytar.getPassword).not.toHaveBeenCalled()
  })

  it('inserts a source_docs row into the database', async () => {
    const filePath = makeUploadedFile('cover.txt')

    await docsIngest(filePath, 'cover_letter')

    expect(mockValues).toHaveBeenCalledTimes(1)
    const insertedDoc = mockValues.mock.calls[0][0]
    expect(insertedDoc.id).toBe('test-id')
    expect(insertedDoc.filename).toBe('cover.txt')
    expect(insertedDoc.type).toBe('cover_letter')
  })

  it('calls extractText to verify the file is readable', async () => {
    const filePath = makeUploadedFile('cover.pdf')

    await docsIngest(filePath, 'cover_letter')

    expect(mockExtractText).toHaveBeenCalledWith(filePath)
  })

  it('returns an ISO timestamp string for uploadedAt', async () => {
    const filePath = makeUploadedFile('cover.pdf')
    const result = await docsIngest(filePath, 'cover_letter')

    // Must be a valid ISO date string.
    expect(() => new Date(result.uploadedAt)).not.toThrow()
    expect(new Date(result.uploadedAt).toISOString()).toBe(result.uploadedAt)
  })
})

// ── Resume ingest ─────────────────────────────────────────────────────────────

describe('docs:ingest — resume', () => {
  beforeEach(() => {
    mockExtractText.mockResolvedValue('Resume text content')
    vi.mocked(keytar.getPassword).mockResolvedValue('sk-test-key')
    mockMessagesCreate.mockResolvedValue(RESUME_AI_RESPONSE)
  })

  it('returns a SourceDoc with the correct type and filename', async () => {
    const filePath = makeUploadedFile('my-resume.pdf')
    const result = await docsIngest(filePath, 'resume')

    expect(result.type).toBe('resume')
    expect(result.filename).toBe('my-resume.pdf')
  })

  it('calls the Anthropic API with the extracted text', async () => {
    const filePath = makeUploadedFile('resume.pdf')

    await docsIngest(filePath, 'resume')

    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)
    const call = mockMessagesCreate.mock.calls[0][0]
    // The extracted text must appear in the user message content.
    expect(call.messages[0].content).toContain('Resume text content')
  })

  it('writes a master-cv.json file after successful Claude extraction', async () => {
    const filePath = makeUploadedFile('resume.pdf')

    await docsIngest(filePath, 'resume')

    const masterCvPath = join(tempDir, 'data', 'master-cv.json')
    expect(existsSync(masterCvPath)).toBe(true)
    const cv = JSON.parse(readFileSync(masterCvPath, 'utf-8'))
    expect(cv.experience).toHaveLength(1)
    expect(cv.experience[0].company).toBe('Acme Corp')
  })

  it('inserts both a spendLog row and a sourceDocs row into the database', async () => {
    const filePath = makeUploadedFile('resume.pdf')

    await docsIngest(filePath, 'resume')

    // Two inserts: spendLog first, then sourceDocs.
    expect(mockValues).toHaveBeenCalledTimes(2)
  })

  it('reads the API key from the OS keychain', async () => {
    const filePath = makeUploadedFile('resume.pdf')

    await docsIngest(filePath, 'resume')

    expect(keytar.getPassword).toHaveBeenCalledWith('job-application-kit', 'anthropic-api-key')
  })

  it('handles Claude responses wrapped in a markdown code fence', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text:
            '```json\n' +
            JSON.stringify({
              experience: [
                {
                  title: 'PM',
                  company: 'Beta',
                  startDate: 'Mar 2022',
                  endDate: 'Present',
                  bullets: ['Led product roadmap.']
                }
              ],
              education: [],
              skills: []
            }) +
            '\n```'
        }
      ],
      usage: { input_tokens: 800, output_tokens: 300 }
    })

    const filePath = makeUploadedFile('resume.pdf')
    const result = await docsIngest(filePath, 'resume')

    // Should not throw, and master-cv.json should contain the parsed data.
    expect(result.type).toBe('resume')
    const masterCvPath = join(tempDir, 'data', 'master-cv.json')
    const cv = JSON.parse(readFileSync(masterCvPath, 'utf-8'))
    expect(cv.experience[0].company).toBe('Beta')
  })
})

// ── Error handling ─────────────────────────────────────────────────────────────

describe('docs:ingest — error handling', () => {
  it('propagates an IngestionError thrown by extractText', async () => {
    mockExtractText.mockRejectedValue({ type: 'image-only-pdf' })
    const filePath = makeUploadedFile('scanned.pdf')

    const err = await docsIngest(filePath, 'resume').catch((e: unknown) => e)

    expect(err).toEqual({ type: 'image-only-pdf' })
  })

  it('propagates a corrupt IngestionError from extractText', async () => {
    mockExtractText.mockRejectedValue({ type: 'corrupt' })
    const filePath = makeUploadedFile('bad.docx')

    const err = await docsIngest(filePath, 'cover_letter').catch((e: unknown) => e)

    expect(err).toEqual({ type: 'corrupt' })
  })

  it('throws when the API key is not configured in the keychain', async () => {
    vi.mocked(keytar.getPassword).mockResolvedValue(null)
    mockExtractText.mockResolvedValue('Resume text')
    const filePath = makeUploadedFile('resume.pdf')

    const err = await docsIngest(filePath, 'resume').catch((e: Error) => e)

    expect(err).toBeInstanceOf(Error)
    expect((err as Error).message).toContain('API key not configured')
  })
})
