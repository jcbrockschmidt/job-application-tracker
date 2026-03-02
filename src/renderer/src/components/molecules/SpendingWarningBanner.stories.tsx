// STUB: Phase 8 — Storybook stories for SpendingWarningBanner.
//
// The banner only renders when limitUsd > 0 and spendUsd > limitUsd.
// Stories cover: visible (over limit), hidden (under/at limit), hidden (limit disabled).
//
// TODO (Phase 8 — addon-a11y): run the Accessibility panel once the addon is
//   installed and verify color contrast of the amber text meets WCAG AA.

import type { Meta, StoryObj } from '@storybook/react'
import SpendingWarningBanner from './SpendingWarningBanner'

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof SpendingWarningBanner> = {
  title: 'Molecules/SpendingWarningBanner',
  component: SpendingWarningBanner,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    spendUsd: { control: { type: 'number', step: 0.01 } },
    limitUsd: { control: { type: 'number', step: 0.01 } }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

/** Over limit — the amber banner is visible. */
export const OverLimit: Story = {
  args: {
    spendUsd: 3.75,
    limitUsd: 2.0
  }
}

/** Slightly over limit — verifies the banner renders even for a small overage. */
export const SlightlyOverLimit: Story = {
  args: {
    spendUsd: 2.01,
    limitUsd: 2.0
  }
}

/** At limit — renders nothing (component returns null when spendUsd === limitUsd). */
export const AtLimit: Story = {
  args: {
    spendUsd: 2.0,
    limitUsd: 2.0
  }
}

/** Under limit — renders nothing. */
export const UnderLimit: Story = {
  args: {
    spendUsd: 0.45,
    limitUsd: 2.0
  }
}

/** Limit disabled (limitUsd = 0) — renders nothing regardless of spend. */
export const LimitDisabled: Story = {
  args: {
    spendUsd: 9.99,
    limitUsd: 0
  }
}
