// Document ingestion: extract raw text from uploaded resume and cover letter files.
//
// STUB: Phase 1 — all functions throw "Not implemented".
//
// Dependencies to install before implementing:
//   npm install pdf-parse mammoth
//   npm install --save-dev @types/pdf-parse @types/mammoth
//
// Typed errors are used instead of thrown strings so IPC handlers can map each
// case to a specific user-facing message (see docs/design.md § Error Handling).

export type IngestionError =
  | { type: 'image-only-pdf' } // scanned PDF with no extractable text
  | { type: 'password-protected' } // PDF requires a password
  | { type: 'corrupt' } // file cannot be read or parsed
  | { type: 'unsupported-format'; ext: string } // extension not in allowed list

// Extracts the full plain text from a file.
// Supported extensions: .pdf, .docx, .txt
// Throws an IngestionError (as a plain object) for known failure modes so callers
// can display a specific error message rather than a generic one.
export async function extractText(_filePath: string): Promise<string> {
  // TODO:
  // 1. Read the file extension to determine which parser to use.
  // 2. For .pdf: use pdf-parse. If numpages > 0 but text is empty, throw { type: 'image-only-pdf' }.
  //    If pdf-parse throws with a password error, throw { type: 'password-protected' }.
  //    If pdf-parse throws for any other reason, throw { type: 'corrupt' }.
  // 3. For .docx: use mammoth.extractRawText(). If mammoth throws, throw { type: 'corrupt' }.
  // 4. For .txt: use fs.readFile with 'utf-8'. If it throws, throw { type: 'corrupt' }.
  // 5. For any other extension: throw { type: 'unsupported-format', ext }.
  throw new Error('Not implemented')
}
