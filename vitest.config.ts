// STUB: Phase 8 — Vitest configuration.
// TODO: Once Storybook is initialized, add a separate Vitest workspace config
//   (vitest.workspace.ts) so Vitest can share Storybook's Vite config for
//   component tests. For now, a single vitest.config.ts covers unit tests.

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Unit tests run in Node by default. Component tests that need a DOM
    // annotate their file with: // @vitest-environment jsdom
    environment: 'node',

    // Covers unit tests and any component-level tests outside Storybook.
    // Excludes node_modules and Playwright E2E tests.
    include: ['src/test/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', 'e2e/**'],

    // Provide vi globals (describe, it, expect, vi) without explicit imports.
    globals: true,

    // TODO (Phase 8 — vitest-axe): once `vitest-axe` is installed, import its
    // matchers here so every test file can use toHaveNoViolations():
    //   setupFiles: ['./src/test/setup.ts']
    // and in src/test/setup.ts:
    //   import * as matchers from 'vitest-axe/matchers'
    //   expect.extend(matchers)
  },
  resolve: {
    alias: {
      // Mirror the aliases defined in electron.vite.config.ts.
      '@shared': resolve(__dirname, 'src/shared'),
      '@renderer': resolve(__dirname, 'src/renderer/src')
    }
  }
})
