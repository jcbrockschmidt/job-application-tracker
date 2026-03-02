// STUB: Phase 8 — Storybook stories for MatchReportView.
//
// Covers all four qualitative rating values: Strong, Good, Fair, Weak.
//
// TODO (Phase 8 — addon-a11y): run the Accessibility panel once the addon is
//   installed and fix any reported axe violations.

import type { Meta, StoryObj } from '@storybook/react'
import MatchReportView from './MatchReportView'
import type { MatchReport } from '@shared/types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_REPORT: Omit<MatchReport, 'rating'> = {
  generatedAt: '2026-03-01T10:00:00Z',
  strengths: [
    'Strong alignment with the TypeScript and React requirements in the JD.',
    'Demonstrated experience leading cross-functional teams matches the leadership expectation.',
    'API performance work (40% latency reduction) directly addresses the scalability focus.'
  ],
  gaps: [
    'No mention of GraphQL federation, which appears three times in the JD.',
    'JD requires Kubernetes experience; resume lists Docker but not Kubernetes.'
  ]
}

function makeReport(rating: MatchReport['rating']): MatchReport {
  return { ...BASE_REPORT, rating }
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof MatchReportView> = {
  title: 'Organisms/MatchReportView',
  component: MatchReportView,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    report: { control: false },
    sessionId: { control: false }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

/** Strong rating: resume aligns very well with the job description. */
export const StrongMatch: Story = {
  args: {
    report: makeReport('Strong'),
    sessionId: 'sess_story'
  }
}

/** Good rating: solid alignment with minor gaps. */
export const GoodMatch: Story = {
  args: {
    report: makeReport('Good'),
    sessionId: 'sess_story'
  }
}

/** Fair rating: moderate alignment; noticeable gaps. */
export const FairMatch: Story = {
  args: {
    report: makeReport('Fair'),
    sessionId: 'sess_story'
  }
}

/** Weak rating: significant misalignment with the job description. */
export const WeakMatch: Story = {
  args: {
    report: makeReport('Weak'),
    sessionId: 'sess_story'
  }
}

/** Report with many strengths and no gaps — verifies single-column layout. */
export const NoGaps: Story = {
  args: {
    report: {
      ...makeReport('Strong'),
      gaps: []
    },
    sessionId: 'sess_story'
  }
}

/** Report with no strengths identified. */
export const NoStrengths: Story = {
  args: {
    report: {
      ...makeReport('Weak'),
      strengths: []
    },
    sessionId: 'sess_story'
  }
}
