// Document ingestion: extract raw text from uploaded resume and cover letter files.
//
// Typed errors are used instead of thrown strings so IPC handlers can map each
// case to a specific user-facing message (see docs/design.md § Error Handling).

import { extname } from 'path'
import { readFile } from 'fs/promises'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export type IngestionError =
  | { type: 'image-only-pdf' } // scanned PDF with no extractable text
  | { type: 'password-protected' } // PDF requires a password
  | { type: 'corrupt' } // file cannot be read or parsed
  | { type: 'unsupported-format'; ext: string } // extension not in allowed list

// Extracts the full plain text from a file.
// Supported extensions: .pdf, .docx, .txt
// Throws an IngestionError (as a plain object) for known failure modes so callers
// can display a specific error message rather than a generic one.
export async function extractText(filePath: string): Promise<string> {
  const ext = extname(filePath).toLowerCase()

  if (ext === '.pdf') {
    let buffer: Buffer
    try {
      buffer = await readFile(filePath)
    } catch {
      throw { type: 'corrupt' } as IngestionError
    }
    try {
      const data = await pdfParse(buffer)
      if (data.numpages > 0 && data.text.trim() === '') {
        throw { type: 'image-only-pdf' } as IngestionError
      }
      return data.text
    } catch (err) {
      // Re-throw our own typed errors unchanged.
      if (err && typeof err === 'object' && 'type' in err) throw err
      const msg = String((err as Error).message ?? '').toLowerCase()
      if (msg.includes('password') || msg.includes('encrypted')) {
        throw { type: 'password-protected' } as IngestionError
      }
      throw { type: 'corrupt' } as IngestionError
    }
  }

  if (ext === '.docx') {
    try {
      const result = await mammoth.extractRawText({ path: filePath })
      return result.value
    } catch {
      throw { type: 'corrupt' } as IngestionError
    }
  }

  if (ext === '.txt') {
    try {
      return await readFile(filePath, 'utf-8')
    } catch {
      throw { type: 'corrupt' } as IngestionError
    }
  }

  throw { type: 'unsupported-format', ext } as IngestionError
}
