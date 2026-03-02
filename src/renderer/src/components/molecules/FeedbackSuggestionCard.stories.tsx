// STUB: Phase 8 — Storybook stories for FeedbackSuggestionCard.
//
// Covers all four FeedbackType values: Strengthen, Add, Remove, Reframe.
// Also covers the with/without proposedText variants (diff view shown or hidden).
//
// TODO (Phase 8 — addon-a11y): run the Accessibility panel once the addon is
//   installed and fix any reported axe violations.
// TODO (Phase 4): the Before row of the diff view shows a placeholder string
//   ("wire to document state in Phase 4"). Update stories once that is wired.

import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import FeedbackSuggestionCard from './FeedbackSuggestionCard'
import type { FeedbackItem } from '@shared/types'

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof FeedbackSuggestionCard> = {
  title: 'Molecules/FeedbackSuggestionCard',
  component: FeedbackSuggestionCard,
  parameters: { layout: 'centered' },
  args: {
    onAccept: fn(),
    onDismiss: fn()
  },
  argTypes: {
    item: { control: false }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// ── Fixtures ──────────────────────────────────────────────────────────────────

const STRENGTHEN: FeedbackItem = {
  id: 'fb_001',
  type: 'Strengthen',
  target: 'Senior Software Engineer · Acme Corp — bullet 1',
  suggestion: 'Add a specific metric to quantify the impact of the caching redesign.',
  justification:
    'The JD emphasizes measurable outcomes. Quantifying latency improvements (e.g. "reduced P99 by 40%") will signal direct alignment with the performance focus.',
  proposedText:
    'Reduced API P99 latency by 40% by redesigning the caching layer, cutting database load by 60% during peak traffic.'
}

const ADD: FeedbackItem = {
  id: 'fb_002',
  type: 'Add',
  target: 'Skills — Languages',
  suggestion:
    'Add GraphQL to the Languages / Web section. The JD mentions GraphQL four times and it is a key requirement.',
  justification:
    'GraphQL appears in the top three requirements in the JD but is absent from the resume. Adding it signals direct fit.'
  // No proposedText — "Add" suggestions describe what to add, not an exact replacement.
}

const REMOVE: FeedbackItem = {
  id: 'fb_003',
  type: 'Remove',
  target: 'Skills — Methodologies: "On-call"',
  suggestion: 'Consider removing "On-call" from the skills list.',
  justification:
    'The JD does not mention on-call responsibilities, and listing it as a skill may imply a preference that could concern the hiring team for a non-infrastructure role.'
}

const REFRAME: FeedbackItem = {
  id: 'fb_004',
  type: 'Reframe',
  target: 'Software Engineer · Some Company — bullet 1',
  suggestion: 'Reframe the API bullet to emphasize reliability and scale rather than just volume.',
  justification:
    'The JD emphasizes "high reliability" and "SLA guarantees". Leading with uptime rather than request count better mirrors the JD language.',
  proposedText:
    'Maintained REST APIs at 99.95% uptime over two years, serving 2M+ daily requests across six microservices.'
}

// ── Stories ───────────────────────────────────────────────────────────────────

/** Strengthen: has proposedText — the diff view (Before/After) is shown. */
export const TypeStrengthen: Story = {
  args: { item: STRENGTHEN }
}

/** Add: no proposedText — diff view is hidden; action is to add new content. */
export const TypeAdd: Story = {
  args: { item: ADD }
}

/** Remove: no proposedText — suggestion is to delete an existing item. */
export const TypeRemove: Story = {
  args: { item: REMOVE }
}

/** Reframe: has proposedText — diff view shows the old and new phrasing. */
export const TypeReframe: Story = {
  args: { item: REFRAME }
}
