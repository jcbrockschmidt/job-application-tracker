// STUB: Phase 8 — Storybook global decorators and parameters.
//
// All stories are automatically wrapped with:
//   1. MUI ThemeProvider — so components use the correct palette, typography, and spacing.
//   2. Redux Provider    — so components that call useAppSelector / useAppDispatch work
//                          in isolation without crashing.
//
// TODO (Phase 8): after running `npx storybook@latest init`, replace the theme
//   import with the actual theme created in src/renderer/src/theme.ts (or wherever
//   the MUI theme is defined once Phase 1 wires up the ThemeProvider in AppShell).
//
// TODO (Phase 8 — addon-a11y): once @storybook/addon-a11y is installed, add:
//   parameters: { a11y: { config: {}, options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } } } }
//   This automatically runs axe on every story and surfaces violations in the
//   Accessibility panel. Fix all reported issues before marking this task done.

import React from 'react'
import type { Preview, Decorator } from '@storybook/react'
// TODO: install before building — npm install --save-dev @storybook/react
import { Provider } from 'react-redux'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { store } from '../src/renderer/src/store'

// TODO: replace with the real app theme from src/renderer/src/theme.ts once created.
const theme = createTheme()

// Wraps every story with the MUI ThemeProvider and the Redux store.
const withProviders: Decorator = (Story) => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  </Provider>
)

const preview: Preview = {
  decorators: [withProviders],

  parameters: {
    // Default layout — individual stories can override with layout: 'fullscreen'.
    layout: 'centered',

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }

    // TODO (Phase 8 — addon-a11y): uncomment once @storybook/addon-a11y is installed:
    // a11y: {
    //   config: {},
    //   options: {
    //     runOnly: {
    //       type: 'tag',
    //       values: ['wcag2a', 'wcag2aa']
    //     }
    //   }
    // }
  }
}

export default preview
