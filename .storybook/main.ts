// STUB: Phase 8 — Storybook configuration.
//
// Run `npx storybook@latest init` to scaffold the full Storybook setup before
// editing this file. The init command installs required peer dependencies and
// generates the default preview assets.
//
// TODO (Phase 8 — init):
//   npx storybook@latest init
//   → choose framework: React (Vite)
//   → say yes to the essentials addon
//   Then install the a11y addon:
//   npm install --save-dev @storybook/addon-a11y
//
// TODO (Phase 8 — vitest-axe): after installing `vitest-axe`, register its
// matchers in src/test/setup.ts and reference it in vitest.config.ts:
//   setupFiles: ['./src/test/setup.ts']

import type { StorybookConfig } from '@storybook/react-vite'
import { resolve } from 'path'

const config: StorybookConfig = {
  // Discover all story files colocated with renderer components.
  stories: ['../src/renderer/src/components/**/*.stories.@(ts|tsx)'],

  addons: [
    '@storybook/addon-essentials',
    // TODO: install before enabling — npm install --save-dev @storybook/addon-a11y
    // '@storybook/addon-a11y',
  ],

  framework: {
    // TODO: install before building — npm install --save-dev @storybook/react-vite
    name: '@storybook/react-vite',
    options: {}
  },

  viteFinal: (viteConfig) => {
    // Mirror the path aliases from electron.vite.config.ts so that @shared/*
    // and @renderer/* imports resolve correctly inside Storybook.
    viteConfig.resolve = viteConfig.resolve ?? {}
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias ?? {}),
      '@shared': resolve(__dirname, '../src/shared'),
      '@renderer': resolve(__dirname, '../src/renderer/src')
    }
    return viteConfig
  }
}

export default config
