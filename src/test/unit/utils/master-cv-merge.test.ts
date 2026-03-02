// STUB: Phase 8 — Unit tests for the Master CV merge logic.
//
// When a resume is ingested (docs:ingest), its structured content is merged into
// the existing master-cv.json. The merge must:
//   - Match existing experience entries by company + title + approximate dates.
//   - Append bullets from the incoming data that are not already present
//     (deduplicate by exact text match; fuzzy matching is out of scope for now).
//   - Never duplicate an existing entry.
//   - Append entirely new entries that have no match in the existing CV.
//   - Merge education entries (match on degree + institution).
//   - Merge skill categories (match on category name; union items).
//   - Preserve all existing IDs, sources, and usedIn arrays.
//   - Assign new nanoid IDs to newly added entries and bullets.
//
// All Claude API calls are mocked — the merge logic itself is pure / synchronous.
//
// TODO (Phase 8): implement the merge utility before enabling these tests.
//   Expected location: src/main/utils/masterCVMerge.ts
//   Exports expected:
//     mergeMasterCV(existing: MasterCV, incoming: MasterCV) → MasterCV

import { describe, it, expect, vi } from 'vitest'

// Mock the nanoid dependency so IDs are deterministic in tests.
// TODO: adjust the mock path to match the actual nanoid import used in the merge module.
vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('test-id')
}))

// TODO: replace with real import once the module exists:
//   import { mergeMasterCV } from '../../../main/utils/masterCVMerge'
//   import type { MasterCV, MasterCVExperienceEntry } from '@shared/types'
const mergeMasterCV: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((existing: any, incoming: any) => any) | null = null // STUB

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EXISTING_CV = {
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

const INCOMING_CV_SAME_ENTRY = {
  experience: [
    {
      id: 'exp_incoming', // new ID — should be replaced/merged
      title: 'Software Engineer', // same title
      company: 'Acme Corp', // same company
      startDate: 'Jan 2023',
      endDate: 'Present',
      bullets: [
        {
          id: 'bul_incoming_dup',
          text: 'Built scalable APIs serving 1M+ requests per day.', // duplicate
          source: 'ingested' as const,
          sourceLabel: 'Resume uploaded Feb 2026',
          usedIn: []
        },
        {
          id: 'bul_incoming_new',
          text: 'Reduced p99 latency by 40% by redesigning the caching layer.',
          source: 'ingested' as const,
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

const INCOMING_CV_NEW_ENTRY = {
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
          source: 'ingested' as const,
          sourceLabel: 'Resume uploaded Feb 2026',
          usedIn: []
        }
      ]
    }
  ],
  education: [],
  skills: []
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('mergeMasterCV', () => {
  it.todo('returns the existing CV unchanged when the incoming CV has no new content')

  it.todo('appends new bullets to a matched entry without duplicating existing bullets (same text)')

  it.todo('does not duplicate a bullet whose text already exists in the matched entry')

  it.todo('appends an entirely new experience entry when no match is found')

  it.todo('preserves the existing entry id, source, and usedIn when merging bullets')

  it.todo('assigns a new id to newly appended bullets')

  it.todo('merges education entries: same degree+institution does not create a duplicate row')

  it.todo('appends a new education entry when no match is found')

  it.todo('merges skill categories: union of items with no duplicates within a category')

  it.todo('appends a new skill category when no match for that category name exists')

  it.todo('returns a new MasterCV object and does not mutate the existing one')

  it('placeholder: test file loads without errors', () => {
    expect(mergeMasterCV).toBeNull() // remove once implemented
    expect(EXISTING_CV.experience).toHaveLength(1)
    expect(INCOMING_CV_SAME_ENTRY.experience[0].bullets).toHaveLength(2)
    expect(INCOMING_CV_NEW_ENTRY.experience[0].company).toBe('New Corp')
  })

  // TODO: sample test to enable once mergeMasterCV is implemented:
  //
  //   it('appends new bullets without duplicating existing ones', () => {
  //     const result = mergeMasterCV(EXISTING_CV, INCOMING_CV_SAME_ENTRY)
  //     const entry = result.experience[0]
  //     expect(entry.id).toBe('exp_existing') // original ID preserved
  //     expect(entry.bullets).toHaveLength(2)  // 1 original + 1 new; duplicate excluded
  //     expect(entry.bullets[1].text).toContain('latency')
  //   })
  //
  //   it('appends a new experience entry', () => {
  //     const result = mergeMasterCV(EXISTING_CV, INCOMING_CV_NEW_ENTRY)
  //     expect(result.experience).toHaveLength(2)
  //     expect(result.experience[1].company).toBe('New Corp')
  //   })
})
