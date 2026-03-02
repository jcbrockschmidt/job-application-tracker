// Unit tests for src/main/ingestion/index.ts — extractText()
//
// pdf-parse, mammoth, and fs/promises are mocked so no real files are read.
// Tests verify that the correct text is returned on success and that the
// correct typed IngestionError is thrown for each known failure mode.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IngestionError } from '../../../main/ingestion/index'

vi.mock('fs/promises', () => ({
  readFile: vi.fn()
}))

vi.mock('pdf-parse', () => ({
  default: vi.fn()
}))

vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn()
  }
}))

import { extractText } from '../../../main/ingestion/index'
import { readFile } from 'fs/promises'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

const mockReadFile = vi.mocked(readFile)
const mockPdfParse = vi.mocked(pdfParse)
const mockMammoth = vi.mocked(mammoth.extractRawText)

beforeEach(() => {
  vi.clearAllMocks()
})

// ── PDF ───────────────────────────────────────────────────────────────────────

describe('extractText — PDF', () => {
  it('returns extracted text from a valid PDF', async () => {
    mockReadFile.mockResolvedValue(Buffer.from('pdf bytes') as never)
    mockPdfParse.mockResolvedValue({ numpages: 2, text: 'Jane Doe\nSoftware Engineer' } as never)

    const text = await extractText('/uploads/resume.pdf')

    expect(text).toBe('Jane Doe\nSoftware Engineer')
  })

  it('throws image-only-pdf when numpages > 0 but extracted text is empty', async () => {
    mockReadFile.mockResolvedValue(Buffer.from('scanned') as never)
    mockPdfParse.mockResolvedValue({ numpages: 3, text: '   \n  ' } as never)

    const err = await extractText('/uploads/scan.pdf').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'image-only-pdf' })
  })

  it('throws password-protected when pdfParse reports a password error', async () => {
    mockReadFile.mockResolvedValue(Buffer.from('locked') as never)
    mockPdfParse.mockRejectedValue(new Error('PDF requires a password to open'))

    const err = await extractText('/uploads/locked.pdf').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'password-protected' })
  })

  it('throws password-protected when pdfParse reports an encrypted file', async () => {
    mockReadFile.mockResolvedValue(Buffer.from('enc') as never)
    mockPdfParse.mockRejectedValue(new Error('file is encrypted'))

    const err = await extractText('/uploads/enc.pdf').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'password-protected' })
  })

  it('throws corrupt when readFile fails (e.g. file not found)', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'))

    const err = await extractText('/uploads/missing.pdf').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'corrupt' })
  })

  it('throws corrupt when pdfParse throws a generic (non-password) error', async () => {
    mockReadFile.mockResolvedValue(Buffer.from('bad') as never)
    mockPdfParse.mockRejectedValue(new Error('unexpected token'))

    const err = await extractText('/uploads/bad.pdf').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'corrupt' })
  })

  it('re-throws an IngestionError thrown inside pdfParse unchanged', async () => {
    mockReadFile.mockResolvedValue(Buffer.from('pdf') as never)
    // Simulate a path where pdfParse itself throws our typed error (e.g. after a nested call).
    mockPdfParse.mockRejectedValue({ type: 'image-only-pdf' } as IngestionError)

    const err = await extractText('/uploads/any.pdf').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'image-only-pdf' })
  })
})

// ── DOCX ──────────────────────────────────────────────────────────────────────

describe('extractText — DOCX', () => {
  it('returns extracted text from a valid DOCX', async () => {
    mockMammoth.mockResolvedValue({ value: 'Alice Smith\nProduct Manager', messages: [] })

    const text = await extractText('/uploads/resume.docx')

    expect(text).toBe('Alice Smith\nProduct Manager')
  })

  it('throws corrupt when mammoth fails to parse the file', async () => {
    mockMammoth.mockRejectedValue(new Error('Not a valid docx file'))

    const err = await extractText('/uploads/broken.docx').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'corrupt' })
  })
})

// ── TXT ───────────────────────────────────────────────────────────────────────

describe('extractText — TXT', () => {
  it('returns the raw contents of a plain text file', async () => {
    mockReadFile.mockResolvedValue('Plain text resume content' as never)

    const text = await extractText('/uploads/resume.txt')

    expect(text).toBe('Plain text resume content')
  })

  it('throws corrupt when the txt file cannot be read', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'))

    const err = await extractText('/uploads/missing.txt').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'corrupt' })
  })
})

// ── Unsupported formats ───────────────────────────────────────────────────────

describe('extractText — unsupported formats', () => {
  it('throws unsupported-format for a .png file', async () => {
    const err = await extractText('/uploads/photo.png').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'unsupported-format', ext: '.png' })
  })

  it('throws unsupported-format for a .doc file (old Word format)', async () => {
    const err = await extractText('/uploads/old.doc').catch((e: IngestionError) => e)

    expect(err).toEqual({ type: 'unsupported-format', ext: '.doc' })
  })

  it('includes the actual extension in the error', async () => {
    const err = await extractText('/uploads/file.xlsx').catch((e: IngestionError) => e)

    expect((err as { type: string; ext: string }).ext).toBe('.xlsx')
  })
})
