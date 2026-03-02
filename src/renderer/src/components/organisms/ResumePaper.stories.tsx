// STUB: Phase 8 — Storybook stories for ResumePaper.
//
// Covers the three data-shape variants called out in the plan:
//   - Full:    multiple experience entries, education, all skill categories
//   - Minimal: single entry with one bullet; no education, no skills
//   - Empty sections: experience only (education and skills omitted)
//
// TODO (Phase 8 — addon-a11y): once @storybook/addon-a11y is installed, run the
//   Accessibility panel for each story and fix any reported axe violations.

import type { Meta, StoryObj } from '@storybook/react'
import ResumePaper from './ResumePaper'
import type { ResumeJson, ContactInfo } from '@shared/types'

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
  // linkedin and github intentionally omitted — optional fields
}

const RESUME_FULL: ResumeJson = {
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Acme Corp',
      startDate: 'Jan 2023',
      endDate: 'Present',
      bullets: [
        'Reduced API response times by 40% by redesigning the caching layer and eliminating N+1 query patterns across core service endpoints.',
        'Led a team of 4 engineers to deliver a new customer-facing dashboard on time, coordinating across design, product, and backend teams.',
        'Introduced contract testing with Pact, cutting cross-team integration bugs by 60% over six months.'
      ]
    },
    {
      title: 'Software Engineer',
      company: 'Some Company',
      startDate: 'June 2020',
      endDate: 'Dec 2022',
      bullets: [
        'Built and maintained REST APIs serving 2M+ daily requests, with 99.95% uptime over two years.',
        'Migrated a monolithic application to a microservices architecture, enabling independent deployments and reducing release cycle from 2 weeks to 2 days.'
      ]
    }
  ],
  education: [
    {
      degree: "Bachelor's in Computer Science",
      institution: 'State University',
      graduationDate: 'June 2020'
    }
  ],
  skills: [
    {
      category: 'Languages',
      items: ['TypeScript (5 yrs)', 'Python (4 yrs)', 'SQL (5 yrs)', 'Go (2 yrs)', 'Bash']
    },
    {
      category: 'Cloud / Infrastructure',
      items: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'PostgreSQL', 'Redis']
    },
    {
      category: 'Web / App',
      items: ['React', 'Redux', 'Node.js', 'REST APIs', 'GraphQL']
    },
    {
      category: 'Methodologies',
      items: ['Agile', 'CI/CD', 'DevOps', 'Microservices', 'TDD']
    }
  ]
}

const RESUME_MINIMAL: ResumeJson = {
  experience: [
    {
      title: 'Software Engineer',
      company: 'Single Corp',
      startDate: 'Jan 2024',
      endDate: 'Present',
      bullets: ['Maintained internal tooling used by 20+ engineers.']
    }
  ],
  education: [],
  skills: []
}

const RESUME_EXPERIENCE_ONLY: ResumeJson = {
  experience: RESUME_FULL.experience,
  education: [],
  skills: []
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ResumePaper> = {
  title: 'Organisms/ResumePaper',
  component: ResumePaper,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    resume: { control: false },
    contact: { control: 'object' }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

/** Full resume: two experience entries, education, four skill categories. */
export const Full: Story = {
  args: {
    resume: RESUME_FULL,
    contact: CONTACT
  }
}

/** Minimal resume: single entry with one bullet, no education or skills. */
export const Minimal: Story = {
  args: {
    resume: RESUME_MINIMAL,
    contact: CONTACT_MINIMAL
  }
}

/** Experience section only — education and skills sections are hidden when empty. */
export const ExperienceOnly: Story = {
  args: {
    resume: RESUME_EXPERIENCE_ONLY,
    contact: CONTACT
  }
}

/** Contact info without optional LinkedIn / GitHub links. */
export const NoOptionalContactLinks: Story = {
  args: {
    resume: RESUME_FULL,
    contact: CONTACT_MINIMAL
  }
}
