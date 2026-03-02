// Unit tests for the Master CV merge logic in src/main/utils/masterCVMerge.ts
//
// When a resume is ingested (docs:ingest), its structured content is merged into
// the existing master-cv.json. The merge must:
//   - Match existing experience entries by company + title (case-insensitive).
//   - Append bullets from the incoming data that are not already present
//     (deduplicate by exact text match; fuzzy matching is out of scope for now).
//   - Never duplicate an existing entry.
//   - Append entirely new entries that have no match in the existing CV.
//   - Merge education entries (match on degree + institution, case-insensitive).
//   - Merge skill categories (match on category name, case-insensitive; union items).
//   - Preserve all existing IDs, sources, and usedIn arrays.
//   - Assign new nanoid IDs to newly added entries and bullets.
//
// All Claude API calls are mocked — the merge logic itself is pure / synchronous.

import { describe, it, expect, vi } from 'vitest'
import type { MasterCV } from '@shared/types'

// Mock the nanoid dependency so IDs are deterministic in tests.
vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('test-id')
}))

import { mergeMasterCV } from '../../../main/utils/masterCVMerge'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EXISTING_CV: MasterCV = {
  experience: [
    {
      id: 'exp_existing',
      title: 'Software Engineer',
      company: 'Acme Corp',
      startDate: 'Jan 2023',
      endDate: 'Present',
      bullets: [
        {
          id: 'bul_existing',
          text: 'Built scalable APIs serving 1M+ requests per day.',
          source: 'ingested',
          sourceLabel: 'Resume uploaded Jan 2026',
          usedIn: ['sess_abc']
        }
      ]
    }
  ],
  education: [
    {
      id: 'edu_existing',
      degree: "Bachelor's in Computer Science",
      institution: 'State University',
      graduationDate: 'May 2020'
    }
  ],
  skills: [
    {
      id: 'skill_existing',
      category: 'Languages',
      items: ['TypeScript', 'Python']
    }
  ]
}

const INCOMING_CV_SAME_ENTRY: MasterCV = {
  experience: [
    {
      id: 'exp_incoming', // new ID — should be merged, not appended
      title: 'Software Engineer', // same title
      company: 'Acme Corp', // same company
      startDate: 'Jan 2023',
      endDate: 'Present',
      bullets: [
        {
          id: 'bul_incoming_dup',
          text: 'Built scalable APIs serving 1M+ requests per day.', // duplicate
          source: 'ingested',
          sourceLabel: 'Resume uploaded Feb 2026',
          usedIn: []
        },
        {
          id: 'bul_incoming_new',
          text: 'Reduced p99 latency by 40% by redesigning the caching layer.',
          source: 'ingested',
          sourceLabel: 'Resume uploaded Feb 2026',
          usedIn: []
        }
      ]
    }
  ],
  education: [],
  skills: [
    {
      id: 'skill_incoming',
      category: 'Languages',
      items: ['TypeScript', 'Go'] // TypeScript is a duplicate; Go is new
    }
  ]
}

const INCOMING_CV_NEW_ENTRY: MasterCV = {
  experience: [
    {
      id: 'exp_new',
      title: 'Senior Software Engineer',
      company: 'New Corp',
      startDate: 'Feb 2024',
      endDate: 'Present',
      bullets: [
        {
          id: 'bul_new',
          text: 'Led a team of 4 engineers to deliver a customer dashboard.',
          source: 'ingested',
          sourceLabel: 'Resume uploaded Feb 2026',
          usedIn: []
        }
      ]
    }
  ],
  education: [],
  skills: []
}

const EMPTY_CV: MasterCV = { experience: [], education: [], skills: [] }

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('mergeMasterCV', () => {
  it('returns the existing CV unchanged when the incoming CV has no new content', () => {
    const result = mergeMasterCV(EXISTING_CV, EMPTY_CV)

    expect(result.experience).toHaveLength(1)
    expect(result.experience[0].id).toBe('exp_existing')
    expect(result.experience[0].bullets).toHaveLength(1)
    expect(result.education).toHaveLength(1)
    expect(result.skills).toHaveLength(1)
  })

  it('appends new bullets to a matched entry without duplicating existing bullets (same text)', () => {
    const result = mergeMasterCV(EXISTING_CV, INCOMING_CV_SAME_ENTRY)
    const entry = result.experience[0]

    // 1 original + 1 new bullet; the duplicate text is excluded.
    expect(entry.bullets).toHaveLength(2)
    expect(entry.bullets[0].text).toBe('Built scalable APIs serving 1M+ requests per day.')
    expect(entry.bullets[1].text).toContain('latency')
  })

  it('does not duplicate a bullet whose text already exists in the matched entry', () => {
    const result = mergeMasterCV(EXISTING_CV, INCOMING_CV_SAME_ENTRY)
    const texts = result.experience[0].bullets.map((b) => b.text)
    const unique = new Set(texts)

    expect(texts.length).toBe(unique.size)
  })

  it('appends an entirely new experience entry when no match is found', () => {
    const result = mergeMasterCV(EXISTING_CV, INCOMING_CV_NEW_ENTRY)

    expect(result.experience).toHaveLength(2)
    expect(result.experience[1].company).toBe('New Corp')
    expect(result.experience[1].title).toBe('Senior Software Engineer')
  })

  it('preserves the existing entry id, source, and usedIn when merging bullets', () => {
    const result = mergeMasterCV(EXISTING_CV, INCOMING_CV_SAME_ENTRY)
    const entry = result.experience[0]

    expect(entry.id).toBe('exp_existing')
    // Original bullet's metadata must be preserved.
    expect(entry.bullets[0].id).toBe('bul_existing')
    expect(entry.bullets[0].source).toBe('ingested')
    expect(entry.bullets[0].usedIn).toEqual(['sess_abc'])
  })

  it('assigns a new id to newly appended bullets', () => {
    const result = mergeMasterCV(EXISTING_CV, INCOMING_CV_SAME_ENTRY)
    const newBullet = result.experience[0].bullets[1]

    // New bullets get a nanoid() → 'test-id' from our mock.
    expect(newBullet.id).toBe('test-id')
  })

  it('merges education entries: same degree+institution does not create a duplicate row', () => {
    const incomingWithSameEdu: MasterCV = {
      experience: [],
      education: [
        {
          id: 'edu_incoming',
          degree: "Bachelor's in Computer Science",
          institution: 'State University',
          graduationDate: 'May 2020'
        }
      ],
      skills: []
    }

    const result = mergeMasterCV(EXISTING_CV, incomingWithSameEdu)

    expect(result.education).toHaveLength(1)
    expect(result.education[0].id).toBe('edu_existing')
  })

  it('appends a new education entry when no match is found', () => {
    const incomingWithNewEdu: MasterCV = {
      experience: [],
      education: [
        {
          id: 'edu_new',
          degree: 'Master of Science in Data Science',
          institution: 'Tech University',
          graduationDate: 'Dec 2022'
        }
      ],
      skills: []
    }

    const result = mergeMasterCV(EXISTING_CV, incomingWithNewEdu)

    expect(result.education).toHaveLength(2)
    expect(result.education[1].degree).toBe('Master of Science in Data Science')
  })

  it('merges skill categories: union of items with no duplicates within a category', () => {
    const result = mergeMasterCV(EXISTING_CV, INCOMING_CV_SAME_ENTRY)
    const languages = result.skills.find((s) => s.category === 'Languages')

    expect(languages).toBeDefined()
    expect(languages!.items).toContain('TypeScript')
    expect(languages!.items).toContain('Python')
    expect(languages!.items).toContain('Go')
    // TypeScript appears exactly once.
    expect(languages!.items.filter((i) => i === 'TypeScript')).toHaveLength(1)
  })

  it('appends a new skill category when no match for that category name exists', () => {
    const incomingWithNewCategory: MasterCV = {
      experience: [],
      education: [],
      skills: [{ id: 'sk_new', category: 'Databases', items: ['PostgreSQL', 'Redis'] }]
    }

    const result = mergeMasterCV(EXISTING_CV, incomingWithNewCategory)

    expect(result.skills).toHaveLength(2)
    expect(result.skills[1].category).toBe('Databases')
    expect(result.skills[1].items).toEqual(['PostgreSQL', 'Redis'])
  })

  it('returns a new MasterCV object and does not mutate the existing one', () => {
    const existingCopy = JSON.parse(JSON.stringify(EXISTING_CV)) as MasterCV

    mergeMasterCV(EXISTING_CV, INCOMING_CV_SAME_ENTRY)

    expect(EXISTING_CV).toEqual(existingCopy)
  })

  it('matches experience entries case-insensitively on company and title', () => {
    const incomingLowercase: MasterCV = {
      experience: [
        {
          id: 'exp_lower',
          title: 'software engineer', // lowercase
          company: 'acme corp', // lowercase
          startDate: 'Jan 2023',
          endDate: 'Present',
          bullets: [
            {
              id: 'bul_lower',
              text: 'New bullet from lowercase match.',
              source: 'ingested',
              sourceLabel: 'Resume uploaded Mar 2026',
              usedIn: []
            }
          ]
        }
      ],
      education: [],
      skills: []
    }

    const result = mergeMasterCV(EXISTING_CV, incomingLowercase)

    // Should merge into the existing entry, not create a second one.
    expect(result.experience).toHaveLength(1)
    expect(result.experience[0].id).toBe('exp_existing')
    expect(result.experience[0].bullets).toHaveLength(2)
  })

  it('matches skill categories case-insensitively and deduplicates items case-insensitively', () => {
    const incomingMixedCase: MasterCV = {
      experience: [],
      education: [],
      skills: [
        {
          id: 'sk_mc',
          category: 'languages', // lowercase — should match 'Languages'
          items: ['typescript', 'rust'] // 'typescript' is a case-insensitive dup; 'rust' is new
        }
      ]
    }

    const result = mergeMasterCV(EXISTING_CV, incomingMixedCase)
    const languages = result.skills.find((s) => s.category.toLowerCase() === 'languages')

    expect(languages).toBeDefined()
    // 'typescript' matches 'TypeScript' — must not be added again.
    expect(languages!.items.filter((i) => i.toLowerCase() === 'typescript')).toHaveLength(1)
    // 'rust' is genuinely new.
    expect(languages!.items.map((i) => i.toLowerCase())).toContain('rust')
  })
})
