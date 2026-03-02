// STUB: Phase 8 — Storybook stories for OnboardingPage.
//
// OnboardingPage is a full-screen overlay rendered over the app shell.
// The current implementation always shows step 1 (activeStep is hardcoded to 0).
//
// TODO (Phase 1): Once OnboardingPage implements all four step components and
//   the activeStep state is wired up, add separate stories for each step:
//   StepApiKey, StepContactInfo, StepUploadResume, StepUploadCoverLetter.
//   Use Storybook's `play` function (with @storybook/test) to simulate user
//   interactions that advance through steps.
//
// TODO (Phase 8 — addon-a11y):
//   - The overlay renders as role="dialog" (or similar) — verify the modal has
//     aria-labelledby pointing to the "Welcome to Job Application Kit" heading.
//   - All icon-only buttons (Back, Next) must have aria-label.
//   - Run the Accessibility panel and fix all violations.

import type { Meta, StoryObj } from '@storybook/react'
import OnboardingPage from './OnboardingPage'

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof OnboardingPage> = {
  title: 'Pages/OnboardingPage',
  component: OnboardingPage,
  parameters: {
    // Render at full screen so the modal overlay looks correct.
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Step 1 — API Key.
 * Currently the only rendered step (activeStep is hardcoded to 0 in the stub).
 *
 * TODO (Phase 1): wire activeStep; split into per-step stories.
 */
export const Step1ApiKey: Story = {}

// The stories below are stubs for future steps. Enable once Phase 1 implements
// the step components and exposes a way to set the initial step in the story.

/**
 * Step 2 — Contact Info.
 * TODO (Phase 1): enable once StepContactInfo is implemented.
 */
// export const Step2ContactInfo: Story = {
//   play: async ({ canvasElement }) => {
//     // Simulate advancing from step 1 to step 2 via the Next button.
//   }
// }

/**
 * Step 3 — Upload Resume.
 * TODO (Phase 1): enable once StepUploadResume is implemented.
 */
// export const Step3UploadResume: Story = {}

/**
 * Step 4 — Upload Cover Letter (optional).
 * TODO (Phase 1): enable once StepUploadCoverLetter is implemented.
 *   This step has a Skip button — verify it can be activated via keyboard.
 */
// export const Step4UploadCoverLetter: Story = {}
