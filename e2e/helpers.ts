// STUB: Phase 8 — Shared helpers for Playwright E2E tests.
//
// Provides a typed wrapper around Electron launch so each test file doesn't
// need to repeat the launch boilerplate.
//
// TODO (Phase 8): implement launchApp once the Electron build output exists at
//   out/main/index.js. The function should:
//   1. Launch Electron via _electron.launch({ args: ['out/main/index.js'] })
//   2. Set a TEST_MODE environment variable so the main process can bypass the
//      OS keychain and use an in-memory settings stub (avoids system dialogs).
//   3. Return the ElectronApplication and the first BrowserWindow page.
//   4. Called in beforeEach; closed in afterEach via app.close().

import { _electron as electron, type ElectronApplication, type Page } from '@playwright/test'
import * as path from 'path'

export interface AppHandle {
  app: ElectronApplication
  page: Page
}

// STUB — implementation is a placeholder until the build output exists.
export async function launchApp(): Promise<AppHandle> {
  // TODO: remove the error and implement once `npm run build` produces out/main/index.js
  // TODO: pass TEST_MODE=1 via env so the app skips real keychain and file dialogs.

  const app = await electron.launch({
    args: [path.join(__dirname, '..', 'out', 'main', 'index.js')],
    env: {
      ...process.env,
      // TODO: replace with a real TEST_MODE flag once the main process reads it.
      E2E_TEST_MODE: '1'
    }
  })

  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')

  return { app, page }
}
