// STUB: Phase 8 — Playwright E2E tests for the complete onboarding flow.
//
// Covers the critical path: first launch → onboarding wizard → app shell.
//
// All four steps must be completable without any external service calls:
//   - Step 1 (API key): TEST_MODE bypasses the real Anthropic API call and
//     treats any non-empty key as valid.
//   - Step 3/4 (file upload): use fixture files from e2e/fixtures/.
//
// TODO (Phase 8): implement each test once:
//   - The Electron build exists (out/main/index.js)
//   - The app reads E2E_TEST_MODE to stub the API key validation and file ingestion
//   - Fixture PDF/DOCX files exist in e2e/fixtures/
//
// TODO (Phase 8 — fixtures): create e2e/fixtures/ with:
//   - sample-resume.pdf    — a minimal single-page text-based PDF
//   - sample-resume.docx   — same content as DOCX
//   - sample-cover-letter.pdf

import { test, expect } from '@playwright/test'
import { launchApp } from './helpers'
import type { AppHandle } from './helpers'

// ── Suite ─────────────────────────────────────────────────────────────────────

test.describe('Onboarding flow', () => {
  let handle: AppHandle

  test.beforeEach(async () => {
    // TODO: enable once launchApp works against a real build.
    // handle = await launchApp()
    // Suppress "handle is declared but never read" until tests are enabled.
    void handle
  })

  test.afterEach(async () => {
    // TODO: await handle.app.close()
  })

  // ── Step 1 — API Key ───────────────────────────────────────────────────────

  test.skip('shows the onboarding overlay on first launch', async () => {
    // TODO:
    // const { page } = handle
    // await expect(page.getByText('Welcome to Job Application Kit')).toBeVisible()
    // await expect(page.getByRole('heading', { name: 'Welcome to Job Application Kit' })).toBeVisible()
  })

  test.skip('step 1: entering a valid API key and clicking Validate advances to step 2', async () => {
    // TODO:
    // const { page } = handle
    // await page.getByPlaceholder('sk-ant-...').fill('sk-ant-test-key')
    // await page.getByRole('button', { name: 'Validate' }).click()
    // await expect(page.getByText('Contact Info')).toBeVisible()
  })

  test.skip('step 1: an invalid API key shows an inline error and does not advance', async () => {
    // TODO: requires TEST_MODE to simulate a 401 response for a specific key value.
  })

  // ── Step 2 — Contact Info ──────────────────────────────────────────────────

  test.skip('step 2: submitting required contact fields advances to step 3', async () => {
    // TODO: fill fullName, phone, email → click Next
  })

  test.skip('step 2: Next is disabled when required fields are empty', async () => {
    // TODO: clear fullName → verify Next button is disabled
  })

  // ── Step 3 — Upload Resume ────────────────────────────────────────────────

  test.skip('step 3: uploading a valid PDF advances to step 4', async () => {
    // TODO:
    // const { page } = handle
    // await page.getByRole('button', { name: /upload/i }).click()
    // // Playwright file chooser API for Electron
    // const [fileChooser] = await Promise.all([
    //   page.waitForEvent('filechooser'),
    //   page.getByRole('button', { name: /choose file/i }).click()
    // ])
    // await fileChooser.setFiles('./e2e/fixtures/sample-resume.pdf')
    // await expect(page.getByText('Upload Cover Letter')).toBeVisible()
  })

  test.skip('step 3: Next is disabled until a file is selected', async () => {
    // TODO: verify Next is disabled before a file is picked
  })

  test.skip('step 3: uploading an image-only PDF shows an inline error', async () => {
    // TODO: requires a fixture file that triggers the image-only PDF error path
  })

  // ── Step 4 — Upload Cover Letter ──────────────────────────────────────────

  test.skip('step 4: clicking Skip completes onboarding and shows the app shell', async () => {
    // TODO: click Skip → verify the onboarding overlay is gone and the app shell is visible
  })

  test.skip('step 4: uploading a cover letter and clicking Get Started completes onboarding', async () => {
    // TODO: upload fixture cover letter → click Get Started → verify app shell
  })

  // ── Post-onboarding ────────────────────────────────────────────────────────

  test.skip('onboarding overlay is not shown on subsequent launches', async () => {
    // TODO: after completing onboarding, close and relaunch the app;
    //   verify the overlay does not appear.
  })
})
