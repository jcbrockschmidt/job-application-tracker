// Unit tests for sessions:create, sessions:get, sessions:getAll, generate:resume,
// and settings:getAvailableModels IPC handlers.
//
// Strategy: mock electron so ipcMain.handle() captures each handler, then call
// handlers directly. app.getPath is pointed at a real temporary directory so
// directory creation and JSON file reads/writes run against the actual filesystem.
// External services (keytar, Anthropic, DB) are mocked.

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import type { Session, ResumeJson } from '@shared/types'

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
  mockMessagesCreate,
  mockListAvailableModels,
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
  mockDelete
} = vi.hoisted(() => {
  const mockMessagesCreate = vi.fn()
  const mockListAvailableModels = vi.fn()

  // DB query builder chain mocks — assembled bottom-up so each level can reference
  // the level below.
  const mockAll = vi.fn().mockReturnValue([])
  const mockWhere = vi.fn().mockReturnValue({ all: mockAll })
  const mockOrderBy = vi.fn().mockReturnValue({ all: mockAll, where: mockWhere })
  const mockInnerJoin = vi.fn().mockReturnValue({
    where: mockWhere,
    orderBy: mockOrderBy,
    all: mockAll
  })
  const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
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
    mockMessagesCreate,
    mockListAvailableModels,
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
    mockDelete
  }
})

vi.mock('../../../main/ai', () => ({
  isPlaceholderMode: vi.fn().mockReturnValue(false),
  getAnthropicClient: vi.fn().mockReturnValue({
    messages: { create: mockMessagesCreate }
  }),
  validateApiKey: vi.fn(),
  resetAnthropicClient: vi.fn(),
  listAvailableModels: mockListAvailableModels
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

// extractText is not exercised in sessions tests.
vi.mock('../../../main/ingestion', () => ({
  extractText: vi.fn()
}))

// nanoid is mocked with a default; individual tests set return-value queues as needed.
vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('default-nanoid-id')
}))

import { registerIpcHandlers } from '../../../main/ipc/index'
import keytar from 'keytar'
import { nanoid } from 'nanoid'

beforeAll(() => {
  registerIpcHandlers()
})

// ── Helpers ────────────────────────────────────────────────────────────────────

function rebuildDbChain(): void {
  mockAll.mockReturnValue([])
  mockWhere.mockReturnValue({ all: mockAll })
  mockOrderBy.mockReturnValue({ all: mockAll, where: mockWhere })
  mockInnerJoin.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy, all: mockAll })
  mockFrom.mockReturnValue({ innerJoin: mockInnerJoin })
  mockSelect.mockReturnValue({ from: mockFrom })
  mockValues.mockReturnValue({ run: vi.fn() })
  mockInsert.mockReturnValue({ values: mockValues })
  mockUpdateWhere.mockReturnValue({ run: vi.fn() })
  mockSet.mockReturnValue({ where: mockUpdateWhere })
  mockUpdate.mockReturnValue({ set: mockSet })
  mockDelete.mockReturnValue({ where: vi.fn().mockReturnValue({ run: vi.fn() }) })
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'job-app-sessions-test-'))
  vi.clearAllMocks()
  rebuildDbChain()

  // Default: API key is set in keychain.
  vi.mocked(keytar.getPassword).mockResolvedValue('sk-test-key')
  // Default: nanoid returns a stable value.
  vi.mocked(nanoid).mockReturnValue('default-nanoid-id')
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

// Call a captured handler directly.
const callHandler = <T>(channel: string, ...args: unknown[]): Promise<T> =>
  capturedHandlers[channel](null, ...args) as Promise<T>

// A minimal valid AI response for resume generation.
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
  usage: { input_tokens: 1500, output_tokens: 600 }
}

// The extraction response (company/role from JD).
const EXTRACTION_AI_RESPONSE = {
  content: [
    {
      type: 'text',
      text: JSON.stringify({ company: 'Acme Corp', role: 'Senior Engineer' })
    }
  ],
  usage: { input_tokens: 200, output_tokens: 50 }
}

// In sessions:create, nanoid is called in this order:
//   1. extraction spendLog id
//   2. applicationId
//   3. sessionId
//   4. resume spendLog id (inside generateResumeFromCV)
function setupNanoidForCreate(
  spendExtractId = 'spend-extract-id',
  applicationId = 'app-id-1',
  sessionId = 'sess-id-1',
  spendResumeId = 'spend-resume-id'
): void {
  vi.mocked(nanoid)
    .mockReturnValueOnce(spendExtractId)
    .mockReturnValueOnce(applicationId)
    .mockReturnValueOnce(sessionId)
    .mockReturnValue(spendResumeId)
}

// A mock DB row matching the Drizzle join result shape for sessions.
function makeMockDbRow(overrides: {
  sessionId?: string
  applicationId?: string
  companyName?: string
  roleTitle?: string
  jobDescription?: string
  directoryPath?: string | null
  matchReport?: string | null
}) {
  const {
    sessionId = 'sess-id-1',
    applicationId = 'app-id-1',
    companyName = 'Acme Corp',
    roleTitle = 'Senior Engineer',
    jobDescription = 'We need a senior engineer.',
    directoryPath = join(
      tempDir,
      'data',
      'applications',
      'acme-corp',
      'senior-engineer_2026-03_sess-id-1'
    ),
    matchReport = null
  } = overrides
  return {
    sessions: {
      id: sessionId,
      applicationId,
      jobDescription,
      matchReport,
      lastSaved: new Date().toISOString(),
      createdAt: new Date()
    },
    applications: {
      id: applicationId,
      companyName,
      roleTitle,
      briefSummary: null,
      dateGenerated: new Date().toISOString(),
      resumeStatus: 'draft',
      coverLetterStatus: 'none',
      applicationStatus: 'not_applied',
      notes: null,
      submittedDate: null,
      directoryPath,
      resumeLastFinalizedAt: null,
      resumeIncorporatedAt: null,
      coverLetterLastFinalizedAt: null,
      coverLetterIncorporatedAt: null,
      coverLetterWritingProfileIncorporatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

// ── settings:getAvailableModels ────────────────────────────────────────────────
//
// NOTE: The handler caches the model list for the process lifetime. Tests in this
// describe block run in order: the "throws when null" test must run first (before
// the cache is populated) because vi.clearAllMocks() resets mock call counts but
// NOT the module-level cachedModels variable inside ipc/index.ts.

describe('settings:getAvailableModels', () => {
  // This test MUST run first — the cache is empty at this point.
  it('throws when no API key is in the keychain', async () => {
    vi.mocked(keytar.getPassword).mockResolvedValue(null)

    await expect(callHandler('settings:getAvailableModels')).rejects.toThrow(
      'API key not configured'
    )
  })

  // After the test above, cache is still null (threw before setting it).
  it('returns model IDs and caches the result — listAvailableModels called once', async () => {
    const models = ['claude-opus-4-6', 'claude-sonnet-4-6']
    mockListAvailableModels.mockResolvedValue(models)

    const result1 = await callHandler<string[]>('settings:getAvailableModels')
    const result2 = await callHandler<string[]>('settings:getAvailableModels')

    expect(result1).toEqual(models)
    expect(result2).toEqual(models)
    // Second call should hit the cache without calling listAvailableModels again.
    expect(mockListAvailableModels).toHaveBeenCalledTimes(1)
    expect(mockListAvailableModels).toHaveBeenCalledWith('sk-test-key')
  })
})

// ── sessions:create ────────────────────────────────────────────────────────────

describe('sessions:create', () => {
  const JD = 'We are looking for a Senior Engineer at Acme Corp to build distributed systems.'

  beforeEach(() => {
    // Set up the two Claude calls: extraction then resume generation.
    mockMessagesCreate
      .mockResolvedValueOnce(EXTRACTION_AI_RESPONSE)
      .mockResolvedValueOnce(RESUME_AI_RESPONSE)
    // Set up nanoid in the exact call order used by sessions:create.
    setupNanoidForCreate()
  })

  it('returns a Session with the correct shape', async () => {
    const session = await callHandler<Session>('sessions:create', JD)

    expect(session.id).toBe('sess-id-1')
    expect(session.applicationId).toBe('app-id-1')
    expect(session.companyName).toBe('Acme Corp')
    expect(session.roleTitle).toBe('Senior Engineer')
    expect(session.jobDescription).toBe(JD)
    expect(session.coverLetter).toBeNull()
    expect(session.matchReport).toBeNull()
    expect(typeof session.lastSaved).toBe('string')
  })

  it('includes the generated resume in the returned Session', async () => {
    const session = await callHandler<Session>('sessions:create', JD)

    expect(session.resume).not.toBeNull()
    expect(session.resume?.experience[0].company).toBe('Acme Corp')
    expect(session.resume?.education[0].degree).toBe('B.S. CS')
  })

  it('calls Claude twice — once for extraction, once for resume generation', async () => {
    await callHandler<Session>('sessions:create', JD)

    expect(mockMessagesCreate).toHaveBeenCalledTimes(2)
  })

  it('inserts an applications row and a sessions row into the DB', async () => {
    await callHandler<Session>('sessions:create', JD)

    // Collect all inserted row objects.
    const insertedRows = mockValues.mock.calls.map(
      (c: unknown[]) => c[0] as Record<string, unknown>
    )
    const insertedIds = insertedRows.map((r) => r.id)
    expect(insertedIds).toContain('app-id-1')
    expect(insertedIds).toContain('sess-id-1')
  })

  it('writes resume.json to the session directory', async () => {
    await callHandler<Session>('sessions:create', JD)

    // Walk two levels under data/applications to find any resume.json.
    const { readdirSync } = await import('fs')
    const dataDir = join(tempDir, 'data', 'applications')
    let found = false
    for (const company of readdirSync(dataDir)) {
      for (const sessionDir of readdirSync(join(dataDir, company))) {
        const resumePath = join(dataDir, company, sessionDir, 'resume.json')
        if (existsSync(resumePath)) {
          found = true
          const resume = JSON.parse(readFileSync(resumePath, 'utf-8')) as ResumeJson
          expect(resume.experience[0].company).toBe('Acme Corp')
        }
      }
    }
    expect(found).toBe(true)
  })

  it('reads the API key from the OS keychain', async () => {
    await callHandler<Session>('sessions:create', JD)

    expect(keytar.getPassword).toHaveBeenCalledWith('job-application-kit', 'anthropic-api-key')
  })

  it('throws when the API key is not configured', async () => {
    vi.mocked(keytar.getPassword).mockResolvedValue(null)

    await expect(callHandler('sessions:create', JD)).rejects.toThrow('API key not configured')
  })

  it('uses regex fallback for company/role when Claude extraction returns invalid JSON', async () => {
    mockMessagesCreate.mockReset()
    // Extraction call returns non-JSON; resume call returns valid resume.
    mockMessagesCreate
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'not json at all' }],
        usage: { input_tokens: 10, output_tokens: 5 }
      })
      .mockResolvedValueOnce(RESUME_AI_RESPONSE)

    const session = await callHandler<Session>('sessions:create', JD)

    // The session is created without throwing — regex fallback supplies defaults.
    expect(session.id).toBeTruthy()
    expect(session.resume).not.toBeNull()
  })

  it('logs spend for the AI calls', async () => {
    await callHandler<Session>('sessions:create', JD)

    // spendLog rows have an inputTokens field (unlike applications/sessions rows).
    const spendRows = mockValues.mock.calls
      .map((c: unknown[]) => c[0] as Record<string, unknown>)
      .filter((row) => 'inputTokens' in row)
    expect(spendRows.length).toBeGreaterThan(0)
  })
})

// ── sessions:get ───────────────────────────────────────────────────────────────

describe('sessions:get', () => {
  it('returns the session assembled from DB rows', async () => {
    mockAll.mockReturnValue([makeMockDbRow({})])

    const session = await callHandler<Session>('sessions:get', 'sess-id-1')

    expect(session.id).toBe('sess-id-1')
    expect(session.companyName).toBe('Acme Corp')
    expect(session.roleTitle).toBe('Senior Engineer')
    expect(session.jobDescription).toBe('We need a senior engineer.')
  })

  it('reads resume.json from the session directory when it exists', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'acme', 'role_2026-03_sess')
    mkdirSync(sessionDir, { recursive: true })
    const resumeData: ResumeJson = {
      experience: [
        {
          title: 'PM',
          company: 'Beta',
          startDate: '2022',
          endDate: '2024',
          bullets: ['Shipped v2.']
        }
      ],
      education: [],
      skills: []
    }
    writeFileSync(join(sessionDir, 'resume.json'), JSON.stringify(resumeData))
    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])

    const session = await callHandler<Session>('sessions:get', 'sess-id-1')

    expect(session.resume?.experience[0].company).toBe('Beta')
  })

  it('returns null resume when resume.json does not exist', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'corp', 'eng_2026-03_sess')
    mkdirSync(sessionDir, { recursive: true })
    // No resume.json written.
    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])

    const session = await callHandler<Session>('sessions:get', 'sess-id-1')

    expect(session.resume).toBeNull()
  })

  it('returns null coverLetter when no directory is set', async () => {
    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: null })])

    const session = await callHandler<Session>('sessions:get', 'sess-id-1')

    expect(session.coverLetter).toBeNull()
  })

  it('deserializes matchReport from the sessions row', async () => {
    const matchReport = {
      rating: 'Strong' as const,
      strengths: ['TypeScript'],
      gaps: [],
      generatedAt: new Date().toISOString()
    }
    mockAll.mockReturnValue([makeMockDbRow({ matchReport: JSON.stringify(matchReport) })])

    const session = await callHandler<Session>('sessions:get', 'sess-id-1')

    expect(session.matchReport?.rating).toBe('Strong')
    expect(session.matchReport?.strengths).toEqual(['TypeScript'])
  })

  it('throws when the session does not exist in the DB', async () => {
    mockAll.mockReturnValue([]) // No rows returned.

    await expect(callHandler('sessions:get', 'nonexistent')).rejects.toThrow(
      'Session not found: nonexistent'
    )
  })
})

// ── sessions:getAll ────────────────────────────────────────────────────────────

describe('sessions:getAll', () => {
  it('returns an empty array when no sessions exist', async () => {
    mockAll.mockReturnValue([])

    const sessions = await callHandler<Session[]>('sessions:getAll')

    expect(sessions).toEqual([])
  })

  it('returns all sessions assembled from DB rows', async () => {
    const dir1 = join(tempDir, 'data', 'applications', 'alpha', 'eng_sess-1')
    const dir2 = join(tempDir, 'data', 'applications', 'beta', 'dev_sess-2')
    mkdirSync(dir1, { recursive: true })
    mkdirSync(dir2, { recursive: true })
    const emptyResume: ResumeJson = { experience: [], education: [], skills: [] }
    writeFileSync(join(dir1, 'resume.json'), JSON.stringify(emptyResume))
    writeFileSync(join(dir2, 'resume.json'), JSON.stringify(emptyResume))
    const row1 = makeMockDbRow({ sessionId: 'sess-1', companyName: 'Alpha Corp', directoryPath: dir1 })
    const row2 = makeMockDbRow({ sessionId: 'sess-2', companyName: 'Beta Inc', directoryPath: dir2 })
    mockAll.mockReturnValue([row1, row2])

    const sessions = await callHandler<Session[]>('sessions:getAll')

    expect(sessions).toHaveLength(2)
    expect(sessions[0].companyName).toBe('Alpha Corp')
    expect(sessions[1].companyName).toBe('Beta Inc')
  })

  it('reads resume.json from the session directory for each session', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'alpha', 'eng_2026-03_s1')
    mkdirSync(sessionDir, { recursive: true })
    const resumeData: ResumeJson = {
      experience: [
        {
          title: 'SWE',
          company: 'Alpha',
          startDate: '2021',
          endDate: '2024',
          bullets: ['Shipped.']
        }
      ],
      education: [],
      skills: []
    }
    writeFileSync(join(sessionDir, 'resume.json'), JSON.stringify(resumeData))
    mockAll.mockReturnValue([
      makeMockDbRow({ sessionId: 'sess-1', companyName: 'Alpha Corp', directoryPath: sessionDir })
    ])

    const sessions = await callHandler<Session[]>('sessions:getAll')

    expect(sessions[0].resume?.experience[0].company).toBe('Alpha')
  })

  it('cleans up and excludes sessions whose directory has no resume.json', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'acme', 'eng_abandoned')
    mkdirSync(sessionDir, { recursive: true })
    // No resume.json created — simulates abandoned mid-generation session.
    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])

    const sessions = await callHandler<Session[]>('sessions:getAll')

    expect(sessions).toHaveLength(0)
  })
})

// ── generate:resume ────────────────────────────────────────────────────────────

describe('generate:resume', () => {
  it('calls Claude with the job description and returns a ResumeJson', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'acme', 'eng_2026-03_sess')
    mkdirSync(sessionDir, { recursive: true })
    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])
    mockMessagesCreate.mockResolvedValue(RESUME_AI_RESPONSE)

    const resume = await callHandler<ResumeJson>('generate:resume', 'sess-id-1')

    expect(resume.experience[0].company).toBe('Acme Corp')
    expect(resume.education[0].degree).toBe('B.S. CS')
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)
    // The job description must appear in the prompt sent to Claude.
    const callArgs = mockMessagesCreate.mock.calls[0][0] as { messages: { content: string }[] }
    expect(callArgs.messages[0].content).toContain('We need a senior engineer.')
  })

  it('writes resume.json to the session directory', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'acme', 'eng_2026-03_sess')
    mkdirSync(sessionDir, { recursive: true })
    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])
    mockMessagesCreate.mockResolvedValue(RESUME_AI_RESPONSE)

    await callHandler<ResumeJson>('generate:resume', 'sess-id-1')

    const resumePath = join(sessionDir, 'resume.json')
    expect(existsSync(resumePath)).toBe(true)
    const resume = JSON.parse(readFileSync(resumePath, 'utf-8')) as ResumeJson
    expect(resume.experience[0].company).toBe('Acme Corp')
  })

  it('logs a spendLog entry with the correct token counts', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'acme', 'eng_2026-03_sess')
    mkdirSync(sessionDir, { recursive: true })
    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])
    mockMessagesCreate.mockResolvedValue(RESUME_AI_RESPONSE)

    await callHandler<ResumeJson>('generate:resume', 'sess-id-1')

    const spendRows = mockValues.mock.calls
      .map((c: unknown[]) => c[0] as Record<string, unknown>)
      .filter((row) => 'inputTokens' in row)
    expect(spendRows.length).toBeGreaterThan(0)
    expect(spendRows[0].inputTokens).toBe(1500)
    expect(spendRows[0].outputTokens).toBe(600)
  })

  it('handles Claude responses wrapped in a markdown code fence', async () => {
    const sessionDir = join(tempDir, 'data', 'applications', 'acme', 'eng_2026-03_sess')
    mkdirSync(sessionDir, { recursive: true })
    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])
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
                  startDate: '2022',
                  endDate: '2024',
                  bullets: ['Led roadmap.']
                }
              ],
              education: [],
              skills: []
            }) +
            '\n```'
        }
      ],
      usage: { input_tokens: 500, output_tokens: 200 }
    })

    const resume = await callHandler<ResumeJson>('generate:resume', 'sess-id-1')

    expect(resume.experience[0].company).toBe('Beta')
  })

  it('throws when the session is not found in the DB', async () => {
    mockAll.mockReturnValue([])

    await expect(callHandler('generate:resume', 'nonexistent')).rejects.toThrow('Session not found')
  })

  it('throws when the API key is not configured', async () => {
    vi.mocked(keytar.getPassword).mockResolvedValue(null)
    const sessionDir = join(tempDir, 'data', 'applications', 'acme', 'eng_2026-03_sess')
    mkdirSync(sessionDir, { recursive: true })
    mockAll.mockReturnValue([makeMockDbRow({ directoryPath: sessionDir })])

    await expect(callHandler('generate:resume', 'sess-id-1')).rejects.toThrow(
      'API key not configured'
    )
  })
})
