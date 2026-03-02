// STUB: Phase 8 — Playwright E2E configuration with Electron support.
//
// Playwright drives the full Electron app in a real window. There is no separate
// package needed: @playwright/test (already installed) includes Electron support
// via the `_electron` API.
//
// Setup order before running E2E tests:
//   1. Build the app:  npm run build
//   2. Install Playwright browsers:  npx playwright install
//   3. Run tests:  npx playwright test  (or: just e2e)
//
// TODO (Phase 8 — CI): add a justfile target:
//   e2e:
//     npm run build && npx playwright test
//
// TODO (Phase 8 — Electron launch): each test file uses `_electron.launch()` to
//   start the app. The main entry point is `./out/main/index.js` (the electron-vite
//   build output). Pass `--test-mode` (or a TEST_MODE env var) to the app so it
//   can skip the OS keychain and use an in-memory settings mock, avoiding prompts
//   and system dialogs that would block the tests.

import { defineConfig } from '@playwright/test'

export default defineConfig({
  // All E2E tests live in the e2e/ directory.
  testDir: './e2e',

  // Give each test enough time for the Electron app to launch and pages to load.
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // Run tests serially — Electron app instances may conflict when parallelized.
  // TODO: explore using separate userData directories per worker to allow parallelism.
  workers: 1,
  fullyParallel: false,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  use: {
    // Capture a screenshot and trace on test failure for easier debugging.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },

  // No `projects` block — all tests run against the same Electron build.
  // TODO: add a CI project if we want to run a subset of tests per environment.
})
