// Placeholder data returned in place of real Claude API responses when
// AI_PLACEHOLDER=true is set (e.g. via `just dev-placeholder`).
// Shapes must match what the real Claude responses produce for each prompt.

import type { ResumeJson, MatchReport } from '@shared/types'

export const PLACEHOLDER_COMPANY_ROLE = {
  company: 'Acme Corp',
  role: 'Senior Software Engineer'
}

// Matches the RawExtractedCV shape consumed by rawToMasterCV() in ipc/index.ts.
export const PLACEHOLDER_RAW_CV = {
  experience: [
    {
      title: 'Software Engineer',
      company: 'Acme Corp',
      startDate: 'Jan 2022',
      endDate: 'Present',
      bullets: [
        'Developed and maintained scalable web applications using React and TypeScript',
        'Collaborated with cross-functional teams to ship features on schedule',
        'Reduced page load time by 40% through targeted performance optimizations'
      ]
    },
    {
      title: 'Junior Developer',
      company: 'StartupCo',
      startDate: 'Jun 2020',
      endDate: 'Dec 2021',
      bullets: [
        'Built RESTful APIs with Node.js and Express',
        'Wrote unit tests achieving 85% code coverage',
        'Migrated legacy codebase to TypeScript'
      ]
    }
  ],
  education: [
    {
      degree: 'B.S. Computer Science',
      institution: 'State University',
      graduationDate: 'May 2020'
    }
  ],
  skills: [
    { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Python'] },
    { category: 'Tools', items: ['React', 'Node.js', 'Git', 'Docker'] }
  ]
}

export const PLACEHOLDER_RESUME: ResumeJson = {
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Acme Corp',
      startDate: 'Jan 2022',
      endDate: 'Present',
      bullets: [
        'Built scalable web applications with React and TypeScript',
        'Led cross-functional delivery of key product features on schedule',
        'Reduced page load time by 40% through targeted performance work'
      ]
    },
    {
      title: 'Junior Developer',
      company: 'StartupCo',
      startDate: 'Jun 2020',
      endDate: 'Dec 2021',
      bullets: [
        'Built RESTful APIs with Node.js and Express',
        'Achieved 85% unit test coverage',
        'Migrated legacy codebase to TypeScript'
      ]
    }
  ],
  education: [
    {
      degree: 'B.S. Computer Science',
      institution: 'State University',
      graduationDate: 'May 2020'
    }
  ],
  skills: [
    { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Python'] },
    { category: 'Tools', items: ['React', 'Node.js', 'Git', 'Docker'] }
  ]
}

export const PLACEHOLDER_MODELS = [
  'claude-opus-4-6',
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001'
]

export const PLACEHOLDER_MATCH_REPORT: MatchReport = {
  rating: 'Good',
  strengths: [
    'Strong experience with React and TypeScript aligns perfectly with the role.',
    'Demonstrated track record of delivering features on schedule.',
    'Solid background in performance optimization.'
  ],
  gaps: [
    'Missing explicit experience with cloud infrastructure (AWS/Azure).',
    'No mention of leadership or mentoring experience requested in the JD.',
    'Could benefit from more specific metrics on impact in earlier roles.'
  ],
  generatedAt: new Date().toISOString()
}
