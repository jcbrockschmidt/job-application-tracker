// STUB: Phase 8 — Storybook stories for CoverLetterPaper.
//
// TODO (Phase 8 — addon-a11y): run the Accessibility panel once the addon is
//   installed and fix any reported axe violations.

import type { Meta, StoryObj } from '@storybook/react'
import CoverLetterPaper from './CoverLetterPaper'
import type { CoverLetterJson, ContactInfo } from '@shared/types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CONTACT: ContactInfo = {
  fullName: 'Jane Smith',
  phone: '(555) 123-4567',
  email: 'jane@example.com',
  linkedin: 'linkedin.com/in/jane-smith',
  github: 'github.com/janesmith'
}

const CONTACT_MINIMAL: ContactInfo = {
  fullName: 'Jane Smith',
  phone: '(555) 123-4567',
  email: 'jane@example.com'
}

const COVER_LETTER_STANDARD: CoverLetterJson = {
  date: 'March 1, 2026',
  salutation: 'Dear Hiring Manager,',
  paragraphs: [
    'I am writing to express my strong interest in the Senior Software Engineer role at Acme Corp. With five years of experience building high-throughput APIs and leading cross-functional engineering teams, I am confident I can contribute meaningfully from day one.',
    'At Some Company, I designed and maintained REST APIs serving over two million daily requests at 99.95% uptime, and led the migration of a monolithic application to a microservices architecture that reduced our release cycle from two weeks to two days. Most recently at Acme Corp, I reduced API response times by 40% through a targeted caching redesign and led a four-engineer team to ship a new customer dashboard on schedule.',
    "I am excited by Acme Corp's focus on developer tooling and the opportunity to work on systems at scale. I would welcome the chance to discuss how my background aligns with your team's goals. Thank you for your consideration."
  ],
  signoff: 'Sincerely,'
}

const COVER_LETTER_SHORT: CoverLetterJson = {
  date: 'March 1, 2026',
  salutation: 'Dear Hiring Manager,',
  paragraphs: [
    'Opening paragraph with a compelling hook.',
    'Body paragraph highlighting a key achievement.',
    'Closing with a call to action.'
  ],
  signoff: 'Best regards,'
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof CoverLetterPaper> = {
  title: 'Organisms/CoverLetterPaper',
  component: CoverLetterPaper,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    coverLetter: { control: false },
    contact: { control: 'object' }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

/** Standard three-paragraph cover letter with all contact fields. */
export const Standard: Story = {
  args: {
    coverLetter: COVER_LETTER_STANDARD,
    contact: CONTACT
  }
}

/** Cover letter with short placeholder paragraphs — verifies minimal rendering. */
export const ShortParagraphs: Story = {
  args: {
    coverLetter: COVER_LETTER_SHORT,
    contact: CONTACT
  }
}

/** Contact without optional LinkedIn / GitHub. */
export const NoOptionalContactLinks: Story = {
  args: {
    coverLetter: COVER_LETTER_STANDARD,
    contact: CONTACT_MINIMAL
  }
}
