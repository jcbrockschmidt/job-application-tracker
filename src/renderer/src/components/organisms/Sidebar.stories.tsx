// STUB: Phase 8 — Storybook stories for Sidebar (session sidebar items).
//
// SessionItem is an internal component of Sidebar.tsx. To write focused stories
// for the Draft vs. Final badge states, we render the full Sidebar with the
// Redux store pre-populated with mock sessions.
//
// TODO (Phase 2): once SessionItem is wired to show the real Draft/Final badge
//   based on application.resumeStatus, update the mock sessions here to use
//   a proper resumeStatus field (currently the badge is hardcoded to "Draft").
//
// TODO (Phase 8 — extract SessionItem): if isolated stories for SessionItem are
//   needed (e.g. for fine-grained axe testing), extract it to
//   src/renderer/src/components/molecules/SessionItem.tsx and import it directly.
//
// TODO (Phase 8 — addon-a11y): run the Accessibility panel and verify:
//   - Close (×) buttons have aria-label including the session name.
//   - Nav items have aria-label in compact mode (Writing Profile, Settings).
//   - "New Session" ButtonBase has aria-label="New session".

import type { Meta, StoryObj } from '@storybook/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import type { ComponentType } from 'react'
import type { Session } from '@shared/types'
import Sidebar from './Sidebar'

// Import the real slice reducers to build a pre-populated test store.
// TODO: adjust import paths if the slice files are renamed during implementation.
import sessionsReducer from '../../store/slices/sessionsSlice'
import settingsReducer from '../../store/slices/settingsSlice'
import uiReducer from '../../store/slices/uiSlice'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SESSION_DRAFT: Session = {
  id: 'sess_draft',
  applicationId: 'app_draft',
  companyName: 'Acme Corp',
  roleTitle: 'Senior Software Engineer',
  jobDescription: 'We are looking for a senior software engineer...',
  resume: null,
  coverLetter: null,
  matchReport: null,
  lastSaved: '2026-03-01T09:00:00Z'
}

const SESSION_FINAL: Session = {
  id: 'sess_final',
  applicationId: 'app_final',
  companyName: 'Tech Startup',
  roleTitle: 'Staff Engineer',
  jobDescription: 'Join our team as a staff engineer...',
  resume: null,
  coverLetter: null,
  matchReport: null,
  lastSaved: '2026-02-28T15:30:00Z'
}

// ── Store factory ─────────────────────────────────────────────────────────────

function makeStore(sessions: Session[], activeSessionId: string | null) {
  return configureStore({
    reducer: {
      sessions: sessionsReducer,
      settings: settingsReducer,
      ui: uiReducer
    },
    preloadedState: {
      sessions: {
        sessions,
        activeSessionId
      }
    }
  })
}

// ── Decorator factory ─────────────────────────────────────────────────────────

function withStore(sessions: Session[], activeSessionId: string | null) {
  const store = makeStore(sessions, activeSessionId)
  return function StoreDecorator(Story: ComponentType) {
    return (
      <Provider store={store}>
        <div style={{ width: 220, height: 600 }}>
          <Story />
        </div>
      </Provider>
    )
  }
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Sidebar> = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  parameters: { layout: 'centered' }
}

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

/** Empty sidebar — no sessions, shows the "No sessions yet" empty state. */
export const NoSessions: Story = {
  decorators: [withStore([], null)]
}

/**
 * Single session in Draft state.
 * TODO (Phase 2): badge currently hardcoded to "Draft" regardless of data.
 *   Once wired to resumeStatus, the badge here should read "Draft".
 */
export const SingleSessionDraft: Story = {
  decorators: [withStore([SESSION_DRAFT], SESSION_DRAFT.id)]
}

/**
 * Single session in Final state.
 * TODO (Phase 2): badge will show "Final" once wired to resumeStatus: 'finalized'.
 *   Update SESSION_FINAL or pass resumeStatus once the SessionItem reads it.
 */
export const SingleSessionFinal: Story = {
  decorators: [withStore([SESSION_FINAL], SESSION_FINAL.id)]
}

/**
 * Multiple sessions: one active (Draft), one inactive (Final).
 * Verifies active highlight styling and scroll behavior with multiple entries.
 */
export const MultipleSessions: Story = {
  decorators: [withStore([SESSION_DRAFT, SESSION_FINAL], SESSION_DRAFT.id)]
}
