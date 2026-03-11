// Implementation of PDF and DOCX export
//
// Responsibilities:
// - Render a ResumeJson / CoverLetterJson to the fixed visual template
// - Export as PDF (Letter / A4, standard page sizing)
// - Export as DOCX matching the PDF layout (same fonts, spacing, structure)
// - Default file name: "<Full Name> - <Company Name> - Resume" (or Cover Letter)

import { BrowserWindow } from 'electron'
import { writeFileSync } from 'fs'
import type { ResumeJson, CoverLetterJson, ContactInfo } from '../../shared/types'

/**
 * Generates the HTML for a resume based on the template in docs/resume-template-preview.html
 */
export function generateResumeHtml(resume: ResumeJson, contact: ContactInfo): string {
  const { fullName, phone, email, linkedin, github } = contact

  const experienceHtml = resume.experience
    .map(
      (exp) => `
      <div class="experience-entry">
        <div class="entry-header">
          <span class="entry-title">${exp.title} · ${exp.company}</span>
          <span class="entry-date">${exp.startDate} – ${exp.endDate}</span>
        </div>
        <ul class="entry-bullets">
          ${exp.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
        </ul>
      </div>
    `
    )
    .join('')

  const educationHtml = resume.education
    .map(
      (edu) => `
      <div class="education-entry">
        <span class="education-title">${edu.degree} · ${edu.institution}</span>
        <span class="education-date">${edu.graduationDate}</span>
      </div>
    `
    )
    .join('')

  const skillsHtml = resume.skills
    .map(
      (skill) => `
      <div class="skills-row"><strong>${skill.category}:</strong> ${skill.items.join(', ')}</div>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; }
    .page { width: 8.5in; min-height: 11in; padding: 0.85in 0.9in; margin: 0 auto; }
    .header { text-align: left; margin-bottom: 18px; }
    .header-name { font-size: 22pt; font-weight: 600; color: #111827; margin-bottom: 5px; }
    .header-name .last-name { font-weight: 800; color: #1e3a5f; }
    .header-contact { font-size: 9.5pt; color: #374151; }
    .header-contact .sep { margin: 0 6px; color: #9ca3af; }
    .section { margin-top: 16px; }
    .section-heading { font-size: 10.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #1e3a5f; background: #e8edf5; padding: 3px 6px 4px; margin-bottom: 10px; }
    .experience-entry { margin-bottom: 13px; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-size: 10.5pt; font-weight: 600; color: #111827; }
    .entry-date { font-size: 9.5pt; color: #6b7280; white-space: nowrap; margin-left: 12px; }
    .entry-bullets { margin-top: 4px; padding-left: 14px; list-style: none; }
    .entry-bullets li { font-size: 9.5pt; color: #374151; line-height: 1.5; margin-bottom: 2px; position: relative; }
    .entry-bullets li::before { content: '•'; position: absolute; left: -12px; color: #374151; }
    .education-entry { display: flex; justify-content: space-between; align-items: baseline; }
    .education-title { font-size: 10.5pt; font-weight: 600; color: #111827; }
    .education-date { font-size: 9.5pt; color: #6b7280; white-space: nowrap; margin-left: 12px; }
    .skills-list { display: flex; flex-direction: column; gap: 3px; }
    .skills-row { font-size: 9.5pt; color: #374151; line-height: 1.5; }
    .skills-row strong { color: #111827; font-weight: 600; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-name">${fullName}</div>
      <div class="header-contact">
        ${phone}
        <span class="sep">·</span>
        ${email}
        ${linkedin ? `<span class="sep">·</span> ${linkedin}` : ''}
        ${github ? `<span class="sep">·</span> ${github}` : ''}
      </div>
    </div>
    <div class="section">
      <div class="section-heading">Experience</div>
      ${experienceHtml}
    </div>
    <div class="section">
      <div class="section-heading">Education</div>
      ${educationHtml}
    </div>
    <div class="section">
      <div class="section-heading">Skills</div>
      <div class="skills-list">${skillsHtml}</div>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Generates the HTML for a cover letter based on the template in docs/cover-letter-template-preview.html
 */
export function generateCoverLetterHtml(
  coverLetter: CoverLetterJson,
  contact: ContactInfo
): string {
  const { fullName, phone, email, linkedin, github } = contact

  const paragraphsHtml = coverLetter.paragraphs.map((p) => `<p>${p}</p>`).join('')

  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; }
    .page { width: 8.5in; min-height: 11in; padding: 0.85in 0.9in; margin: 0 auto; }
    .header { text-align: left; margin-bottom: 18px; }
    .header-name { font-size: 22pt; font-weight: 600; color: #111827; margin-bottom: 5px; }
    .header-name .last-name { font-weight: 800; color: #1e3a5f; }
    .header-contact { font-size: 9.5pt; color: #374151; }
    .header-contact .sep { margin: 0 6px; color: #9ca3af; }
    .date { margin-top: 32px; font-size: 11pt; color: #111827; }
    .salutation { margin-top: 24px; font-size: 11pt; color: #111827; }
    .content { margin-top: 16px; font-size: 11pt; color: #374151; line-height: 1.6; }
    .content p { margin-bottom: 16px; }
    .signoff { margin-top: 32px; font-size: 11pt; color: #111827; }
    .signature { margin-top: 8px; font-size: 11pt; font-weight: 600; color: #111827; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-name">${fullName}</div>
      <div class="header-contact">
        ${phone}
        <span class="sep">·</span>
        ${email}
        ${linkedin ? `<span class="sep">·</span> ${linkedin}` : ''}
        ${github ? `<span class="sep">·</span> ${github}` : ''}
      </div>
    </div>
    <div class="date">${date}</div>
    <div class="salutation">${coverLetter.salutation}</div>
    <div class="content">${paragraphsHtml}</div>
    <div class="signoff">${coverLetter.signoff}</div>
    <div class="signature">${fullName}</div>
  </div>
</body>
</html>
  `
}

async function printToPdf(html: string, destPath: string): Promise<void> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      offscreen: true
    }
  })

  // We need to wait for the font to load if it's external, or just wait a bit.
  // Using a data URL is fine for small HTML.
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

  // Wait for fonts to be ready
  await win.webContents.executeJavaScript('document.fonts.ready')

  const pdf = await win.webContents.printToPDF({
    printBackground: true,
    margins: {
      marginType: 'none'
    },
    pageSize: 'Letter'
  })

  writeFileSync(destPath, pdf)
  win.destroy()
}

export async function exportResumePdf(
  resume: ResumeJson,
  contact: ContactInfo,
  destPath: string
): Promise<void> {
  const html = generateResumeHtml(resume, contact)
  await printToPdf(html, destPath)
}

export async function exportCoverLetterPdf(
  coverLetter: CoverLetterJson,
  contact: ContactInfo,
  destPath: string
): Promise<void> {
  const html = generateCoverLetterHtml(coverLetter, contact)
  await printToPdf(html, destPath)
}

export async function exportResumeDocx(
  _resume: ResumeJson,
  _contact: ContactInfo,
  _destPath: string
): Promise<void> {
  // STUB: Phase 6.1
  throw new Error('DOCX export not implemented yet (Phase 6.1)')
}

export async function exportCoverLetterDocx(
  _coverLetter: CoverLetterJson,
  _contact: ContactInfo,
  _destPath: string
): Promise<void> {
  // STUB: Phase 6.1
  throw new Error('DOCX export not implemented yet (Phase 6.1)')
}
