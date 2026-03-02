// STUB: Phase 8 — Playwright E2E tests for core session management flows.
//
// All tests assume onboarding has already been completed (the app starts
// directly in the main view). In practice this means either:
//   a. Running onboarding.spec.ts first (test ordering), or
//   b. Seeding the userData directory with a completed settings.json before launch.
//
// TODO (Phase 8 — test isolation): implement a helper that seeds settings and
//   master-cv.json into a temporary userData directory before each test, then
//   points the Electron app at that directory via app.getPath('userData') override
//   or a --user-data-dir CLI flag. This avoids cross-test state pollution.
//
// Claude API calls must be mocked in TEST_MODE — the main process should return
// a deterministic fixture ResumeJson without making a real Anthropic API call.
//
// Critical flows covered (per plan.md Phase 8):
//   ✓ Create a new session and generate a resume
//   ✓ Edit a bullet manually
//   ✓ Export as PDF
//   ✓ Close and reopen a session
//   ✓ Navigate to Master CV and Application List

import { test, expect } from '@playwright/test'
import { launchApp } from './helpers'
import type { AppHandle } from './helpers'

// ── Suite ─────────────────────────────────────────────────────────────────────

test.describe('Session management', () => {
  let handle: AppHandle

  test.beforeEach(async () => {
    // TODO: seed a completed userData (settings.json + master-cv.json) and launch.
    // handle = await launchApp()
    void handle
  })

  test.afterEach(async () => {
    // TODO: await handle.app.close()
  })

  // ── Create session / generate resume ──────────────────────────────────────

  test.skip('clicking "New Session" opens the New Session dialog', async () => {
    // TODO:
    // const { page } = handle
    // await page.getByRole('button', { name: '+ New Session' }).click()
    // await expect(page.getByRole('dialog')).toBeVisible()
    // await expect(page.getByPlaceholder(/paste.*job description/i)).toBeVisible()
  })

  test.skip('submitting a job description generates a resume and opens the session view', async () => {
    // TODO: In TEST_MODE the generate:resume IPC handler should return a fixture
    //   ResumeJson without calling Claude.
    // const { page } = handle
    // await page.getByRole('button', { name: '+ New Session' }).click()
    // await page.getByPlaceholder(/paste.*job description/i).fill('We need a senior engineer...')
    // await page.getByRole('button', { name: 'Generate' }).click()
    // await page.waitForSelector('[data-testid="resume-paper"]', { timeout: 30_000 })
    // await expect(page.getByRole('heading', { level: 1 })).toContainText('Senior')
  })

  // ── Edit a bullet ─────────────────────────────────────────────────────────

  test.skip('hovering a bullet reveals the Edit and Revise with AI toolbar', async () => {
    // TODO: hover over a bullet → verify dark toolbar appears
  })

  test.skip('clicking Edit on a bullet makes it editable; Save persists the change', async () => {
    // TODO:
    // await page.locator('.bullet-item').first().hover()
    // await page.getByLabel('Edit bullet').click()
    // await page.keyboard.type(' (additional text)')
    // await page.getByRole('button', { name: 'Save' }).click()
    // await expect(page.locator('.bullet-item').first()).toContainText('additional text')
  })

  test.skip('pressing Escape while editing a bullet cancels without saving', async () => {
    // TODO: enter edit mode → type → press Escape → verify original text is restored
  })

  // ── Export ────────────────────────────────────────────────────────────────

  test.skip('clicking Export opens the export dialog with PDF and DOCX options', async () => {
    // TODO: click Export → verify dialog appears with PDF/DOCX options
  })

  test.skip('exporting as PDF calls the export:pdf IPC and writes a file', async () => {
    // TODO: in TEST_MODE, export:pdf should write to a temp path and return it.
    //   Verify the returned path exists on disk.
  })

  // ── Close and reopen ──────────────────────────────────────────────────────

  test.skip('closing a session via the × button removes it from the sidebar', async () => {
    // TODO:
    // await page.locator('.session-item').first().hover()
    // await page.getByLabel(/close.*session/i).click()
    // await expect(page.locator('.session-item')).toHaveCount(0)
  })

  test.skip('closing and relaunching the app restores the most recently active session', async () => {
    // TODO: close the app (app.close()); relaunch; verify the session is in the sidebar
    //   and the resume paper is visible.
  })

  // ── Navigation ────────────────────────────────────────────────────────────

  test.skip('clicking "Applications" in the sidebar navigates to the Master List view', async () => {
    // TODO:
    // await page.getByRole('button', { name: 'Applications' }).click()
    // await expect(page.getByRole('heading', { name: /application/i })).toBeVisible()
  })

  test.skip('clicking "Master CV" in the sidebar navigates to the Master CV view', async () => {
    // TODO:
    // await page.getByRole('button', { name: 'Master CV' }).click()
    // await expect(page.getByRole('heading', { name: /master cv/i })).toBeVisible()
  })
})
