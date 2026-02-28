// TODO: Implement PDF and DOCX export
//
// Responsibilities:
// - Render a ResumeJson / CoverLetterJson to the fixed visual template
// - Export as PDF (Letter / A4, standard page sizing)
// - Export as DOCX matching the PDF layout (same fonts, spacing, structure)
// - Default file name: "<Full Name> - <Company Name> - Resume" (or Cover Letter)

import type { ResumeJson, CoverLetterJson, ContactInfo } from '../../shared/types'

export async function exportResumePdf(
  _resume: ResumeJson,
  _contact: ContactInfo,
  _destPath: string
): Promise<void> {
  throw new Error('Not implemented')
}

export async function exportCoverLetterPdf(
  _coverLetter: CoverLetterJson,
  _contact: ContactInfo,
  _destPath: string
): Promise<void> {
  throw new Error('Not implemented')
}

export async function exportResumeDocx(
  _resume: ResumeJson,
  _contact: ContactInfo,
  _destPath: string
): Promise<void> {
  throw new Error('Not implemented')
}

export async function exportCoverLetterDocx(
  _coverLetter: CoverLetterJson,
  _contact: ContactInfo,
  _destPath: string
): Promise<void> {
  throw new Error('Not implemented')
}
