// Unit tests for HTML generation for PDF export.

import { describe, it, expect, vi } from 'vitest'
import { generateResumeHtml, generateCoverLetterHtml } from '../../../main/export'
import type { ResumeJson, CoverLetterJson, ContactInfo } from '../../../shared/types'

// Mock electron BrowserWindow to avoid issues if imported (though not used in these specific functions)
vi.mock('electron', () => ({
  BrowserWindow: vi.fn()
}))

describe('HTML Generation', () => {
  const contact: ContactInfo = {
    fullName: 'Jane Doe',
    phone: '555-1234',
    email: 'jane@example.com',
    linkedin: 'linkedin.com/in/janedoe',
    github: 'github.com/janedoe'
  }

  describe('generateResumeHtml', () => {
    it('includes contact info in the HTML', () => {
      const resume: ResumeJson = { experience: [], education: [], skills: [] }
      const html = generateResumeHtml(resume, contact)

      expect(html).toContain('Jane Doe')
      expect(html).toContain('555-1234')
      expect(html).toContain('jane@example.com')
      expect(html).toContain('linkedin.com/in/janedoe')
      expect(html).toContain('github.com/janedoe')
    })

    it('includes experience entries', () => {
      const resume: ResumeJson = {
        experience: [
          {
            title: 'Software Engineer',
            company: 'Acme Corp',
            startDate: 'Jan 2023',
            endDate: 'Present',
            bullets: ['Built cool things.']
          }
        ],
        education: [],
        skills: []
      }
      const html = generateResumeHtml(resume, contact)

      expect(html).toContain('Software Engineer · Acme Corp')
      expect(html).toContain('Jan 2023 – Present')
      expect(html).toContain('Built cool things.')
    })
  })

  describe('generateCoverLetterHtml', () => {
    it('includes cover letter content', () => {
      const coverLetter: CoverLetterJson = {
        salutation: 'Dear Hiring Manager,',
        paragraphs: ['I am interested in the role.', 'I have great skills.'],
        signoff: 'Sincerely,'
      }
      const html = generateCoverLetterHtml(coverLetter, contact)

      expect(html).toContain('Dear Hiring Manager,')
      expect(html).toContain('I am interested in the role.')
      expect(html).toContain('I have great skills.')
      expect(html).toContain('Sincerely,')
      expect(html).toContain('Jane Doe') // Signature
    })
  })
})
