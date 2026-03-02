// STUB: Phase 8 — Storybook stories for the Master CV experience entry card.
//
// The MasterCVEntryCard component does not exist yet — it will be implemented
// in Phase 3 as part of the Master CV page.
//
// TODO (Phase 3): implement MasterCVEntryCard and export it from
//   src/renderer/src/components/molecules/MasterCVEntryCard.tsx
//   It should display:
//     - Entry header: title · company, date range, Edit and Delete icon buttons
//     - Bullet list: each bullet's text, source tag, and "Used in N sessions" label
//     - Hover interactions: inline edit on click; delete icon per bullet on hover
//     - "+ Add bullet" button at the bottom
//
// TODO (Phase 8): once the component exists:
//   1. Uncomment the import below.
//   2. Remove the placeholder JSX.
//   3. Enable all the stories.
//   4. Run the Accessibility panel (addon-a11y) and fix any violations.

import type { Meta, StoryObj } from '@storybook/react'
// TODO: uncomment once the component is implemented:
//   import MasterCVEntryCard from '../molecules/MasterCVEntryCard'
import type { MasterCVExperienceEntry } from '@shared/types'
import { Box, Typography } from '@mui/material'

// ── Placeholder (remove once MasterCVEntryCard exists) ────────────────────────

function MasterCVEntryCardPlaceholder({ entry }: { entry: MasterCVExperienceEntry }) {
  return (
    <Box sx={{ p: 3, border: '1px dashed #ccc', borderRadius: 2, width: 600 }}>
      <Typography color="text.secondary" fontSize={12}>
        MasterCVEntryCard — STUB (Phase 3)
      </Typography>
      <Typography fontWeight={600} mt={1}>
        {entry.title} · {entry.company}
      </Typography>
      <Typography fontSize={12} color="text.secondary">
        {entry.startDate} – {entry.endDate}
      </Typography>
      {entry.bullets.map((b) => (
        <Box key={b.id} sx={{ mt: 1, pl: 2 }}>
          <Typography fontSize={12}>{b.text}</Typography>
          <Typography fontSize={11} color="text.secondary">
            Source: {b.source} · Used in {b.usedIn.length} session(s)
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ENTRY_INGESTED: MasterCVExperienceEntry = {
  id: 'exp_001',
  title: 'Senior Software Engineer',
  company: 'Acme Corp',
  startDate: 'Jan 2023',
  endDate: 'Present',
  bullets: [
    {
      id: 'bul_001',
      text: 'Reduced API response times by 40% by redesigning the caching layer.',
      source: 'ingested',
      sourceLabel: 'Resume uploaded Feb 2026',
      usedIn: ['sess_abc', 'sess_xyz']
    },
    {
      id: 'bul_002',
      text: 'Led a team of 4 engineers to deliver a customer analytics dashboard.',
      source: 'ingested',
      sourceLabel: 'Resume uploaded Feb 2026',
      usedIn: ['sess_abc']
    }
  ]
}

const ENTRY_MANUAL: MasterCVExperienceEntry = {
  id: 'exp_002',
  title: 'Software Engineer',
  company: 'Some Company',
  startDate: 'June 2020',
  endDate: 'Dec 2022',
  bullets: [
    {
      id: 'bul_003',
      text: 'Maintained REST APIs serving 2M+ daily requests.',
      source: 'manual',
      sourceLabel: 'Entered manually',
      usedIn: []
    }
  ]
}

const ENTRY_FINALIZED: MasterCVExperienceEntry = {
  id: 'exp_003',
  title: 'Engineering Manager',
  company: 'Startup Inc',
  startDate: 'Mar 2019',
  endDate: 'May 2020',
  bullets: [
    {
      id: 'bul_004',
      text: 'Grew the engineering team from 3 to 12 engineers over 14 months.',
      source: 'finalized',
      sourceLabel: 'Startup Inc — Engineering Manager (Feb 27)',
      usedIn: ['sess_xyz']
    }
  ]
}

const ENTRY_REGENERATED: MasterCVExperienceEntry = {
  id: 'exp_004',
  title: 'Junior Developer',
  company: 'Early Co',
  startDate: 'Aug 2018',
  endDate: 'Feb 2019',
  bullets: [
    {
      id: 'bul_005',
      text: 'Contributed to internal CI pipeline improvements, reducing build times by 25%.',
      source: 'regenerated',
      sourceLabel: 'AI regeneration run — Mar 1 2026',
      usedIn: []
    }
  ]
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof MasterCVEntryCardPlaceholder> = {
  title: 'Molecules/MasterCVEntryCard',
  // TODO: replace with:  component: MasterCVEntryCard
  component: MasterCVEntryCardPlaceholder,
  parameters: { layout: 'centered' },
  argTypes: { entry: { control: false } }
}

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

/** Bullets with source: "ingested" — extracted from an uploaded resume file. */
export const SourceIngested: Story = {
  args: { entry: ENTRY_INGESTED }
}

/** Bullets with source: "manual" — entered directly by the user. */
export const SourceManual: Story = {
  args: { entry: ENTRY_MANUAL }
}

/** Bullets with source: "finalized" — accepted from a finalized session resume. */
export const SourceFinalized: Story = {
  args: { entry: ENTRY_FINALIZED }
}

/** Bullets with source: "regenerated" — accepted from an AI regeneration suggestion. */
export const SourceRegenerated: Story = {
  args: { entry: ENTRY_REGENERATED }
}
