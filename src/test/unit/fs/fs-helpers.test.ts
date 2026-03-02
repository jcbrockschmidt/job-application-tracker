// Unit tests for src/main/fs/index.ts
//
// All tests run in Node (no Electron process) by mocking the `electron` module
// and using a real temporary directory on disk so the actual fs operations run.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import type { MasterCV } from '@shared/types'

// tempDir is updated in beforeEach. The electron mock reads it lazily via closure,
// so every function call during a test uses the current value.
let tempDir = ''

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => (name === 'userData' ? tempDir : '')
  }
}))

import {
  getDataPaths,
  getSessionDir,
  ensureDataDirectories,
  atomicWriteJson,
  readMasterCV,
  writeMasterCV
} from '../../../main/fs/index'

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'job-app-fs-test-'))
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

// ── getDataPaths ───────────────────────────────────────────────────────────────

describe('getDataPaths', () => {
  it('returns all well-known paths rooted under userData/data', () => {
    const paths = getDataPaths()
    const dataDir = join(tempDir, 'data')
    expect(paths.dataDir).toBe(dataDir)
    expect(paths.dbPath).toBe(join(dataDir, 'app.db'))
    expect(paths.masterCvPath).toBe(join(dataDir, 'master-cv.json'))
    expect(paths.writingProfilePath).toBe(join(dataDir, 'writing-profile.json'))
    expect(paths.applicationsDir).toBe(join(dataDir, 'applications'))
    expect(paths.sourceDocsDir).toBe(join(dataDir, 'source-documents'))
  })
})

// ── getSessionDir ──────────────────────────────────────────────────────────────

describe('getSessionDir', () => {
  it('produces a path of the form applicationsDir/<company>/<role>_<YYYY-MM>_<id>', () => {
    vi.setSystemTime(new Date('2026-03-15T10:00:00Z'))
    const dir = getSessionDir('acme-corp', 'senior-engineer', 'abc123')
    const { applicationsDir } = getDataPaths()
    expect(dir).toBe(join(applicationsDir, 'acme-corp', 'senior-engineer_2026-03_abc123'))
    vi.useRealTimers()
  })

  it('nests the role-slug segment inside the company-slug segment', () => {
    vi.setSystemTime(new Date('2026-03-01T00:00:00Z'))
    const dir = getSessionDir('globex', 'engineer', 'id1')
    const { applicationsDir } = getDataPaths()
    expect(dir.startsWith(join(applicationsDir, 'globex'))).toBe(true)
    vi.useRealTimers()
  })

  it('uses the YYYY-MM of the current date', () => {
    vi.setSystemTime(new Date('2025-12-01T00:00:00Z'))
    const dir = getSessionDir('corp', 'role', 'x')
    expect(dir).toContain('2025-12')
    vi.useRealTimers()
  })
})

// ── ensureDataDirectories ──────────────────────────────────────────────────────

describe('ensureDataDirectories', () => {
  it('creates data/, applications/, and source-documents/ under userData', () => {
    ensureDataDirectories()
    const { dataDir, applicationsDir, sourceDocsDir } = getDataPaths()
    expect(existsSync(dataDir)).toBe(true)
    expect(existsSync(applicationsDir)).toBe(true)
    expect(existsSync(sourceDocsDir)).toBe(true)
  })

  it('does not throw when called multiple times (idempotent)', () => {
    ensureDataDirectories()
    expect(() => ensureDataDirectories()).not.toThrow()
  })
})

// ── atomicWriteJson ────────────────────────────────────────────────────────────

describe('atomicWriteJson', () => {
  it('writes the serialized data to the target file', () => {
    const filePath = join(tempDir, 'out.json')
    const data = { key: 'value', nested: { n: 1 } }
    atomicWriteJson(filePath, data)
    expect(JSON.parse(readFileSync(filePath, 'utf-8'))).toEqual(data)
  })

  it('leaves no .tmp file after a successful write', () => {
    const filePath = join(tempDir, 'out.json')
    atomicWriteJson(filePath, { done: true })
    expect(existsSync(`${filePath}.tmp`)).toBe(false)
  })

  it('overwrites an existing file with new content', () => {
    const filePath = join(tempDir, 'out.json')
    writeFileSync(filePath, JSON.stringify({ old: true }), 'utf-8')
    atomicWriteJson(filePath, { new: true })
    expect(JSON.parse(readFileSync(filePath, 'utf-8'))).toEqual({ new: true })
  })

  it('produces valid JSON (pretty-printed, parseable)', () => {
    const filePath = join(tempDir, 'pretty.json')
    atomicWriteJson(filePath, { a: [1, 2, 3] })
    expect(() => JSON.parse(readFileSync(filePath, 'utf-8'))).not.toThrow()
  })
})

// ── readMasterCV ───────────────────────────────────────────────────────────────

describe('readMasterCV', () => {
  it('returns an empty MasterCV when master-cv.json does not exist', () => {
    // data/ dir is not created — masterCvPath will not exist
    const cv = readMasterCV()
    expect(cv).toEqual({ experience: [], education: [], skills: [] })
  })

  it('reads and returns the parsed MasterCV from an existing file', () => {
    ensureDataDirectories()
    const { masterCvPath } = getDataPaths()
    const testCv: MasterCV = {
      experience: [
        {
          id: 'e1',
          title: 'Engineer',
          company: 'Acme',
          startDate: '2020-01',
          endDate: '2022-01',
          bullets: [
            { id: 'b1', text: 'Built things', source: 'manual', sourceLabel: 'manual', usedIn: [] }
          ]
        }
      ],
      education: [],
      skills: []
    }
    writeFileSync(masterCvPath, JSON.stringify(testCv), 'utf-8')
    expect(readMasterCV()).toEqual(testCv)
  })
})

// ── writeMasterCV ──────────────────────────────────────────────────────────────

describe('writeMasterCV', () => {
  it('round-trips through writeMasterCV then readMasterCV', () => {
    ensureDataDirectories()
    const testCv: MasterCV = {
      experience: [],
      education: [{ id: 'ed1', degree: 'B.S.', institution: 'MIT', graduationDate: '2019' }],
      skills: [{ id: 'sk1', category: 'Languages', items: ['TypeScript', 'Go'] }]
    }
    writeMasterCV(testCv)
    expect(readMasterCV()).toEqual(testCv)
  })

  it('overwrites a previously written MasterCV', () => {
    ensureDataDirectories()
    const first: MasterCV = { experience: [], education: [], skills: [] }
    const second: MasterCV = {
      experience: [],
      education: [],
      skills: [{ id: 'sk1', category: 'Tools', items: ['Docker'] }]
    }
    writeMasterCV(first)
    writeMasterCV(second)
    expect(readMasterCV()).toEqual(second)
  })
})
