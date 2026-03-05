// Unit tests for settingsSlice — the Redux slice that backs the onboarding wizard.
//
// Strategy: configure a minimal Redux store with only the settings reducer and
// dispatch actions directly. No DOM, no IPC calls, no mocking required —
// these are pure synchronous reducer tests.
//
// Coverage for Phase 1.2:
//   - Initial state has onboardingComplete: false (overlay is shown on first launch)
//   - setOnboardingComplete: step 4 "Get Started" dismisses the overlay
//   - setContactInfo: step 2 saves contact fields and merges partial updates
//   - hydrate: on launch, settings:get response replaces the initial state so the
//     overlay is skipped for returning users (onboardingComplete: true)

import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import settingsReducer, {
  setContactInfo,
  setModel,
  setTheme,
  setSpendingLimit,
  setBackupLocation,
  setOnboardingComplete,
  hydrate
} from '@renderer/store/slices/settingsSlice'
import type { Settings } from '@shared/types'

function makeStore() {
  return configureStore({ reducer: { settings: settingsReducer } })
}

const DEFAULT_SETTINGS: Settings = {
  contactInfo: { fullName: '', phone: '', email: '', linkedin: '', github: '' },
  model: 'claude-opus-4-6',
  theme: 'system',
  backupLocation: '',
  spendingLimit: 0,
  onboardingComplete: false
}

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has onboardingComplete: false so the overlay is shown on first launch', () => {
    const store = makeStore()
    expect(store.getState().settings.onboardingComplete).toBe(false)
  })

  it('is not initialized by default', () => {
    const store = makeStore()
    expect(store.getState().settings.initialized).toBe(false)
  })

  it('starts with all contact fields empty', () => {
    const { contactInfo } = makeStore().getState().settings
    expect(contactInfo.fullName).toBe('')
    expect(contactInfo.phone).toBe('')
    expect(contactInfo.email).toBe('')
    expect(contactInfo.linkedin).toBe('')
    expect(contactInfo.github).toBe('')
  })

  it('defaults to the opus model', () => {
    expect(makeStore().getState().settings.model).toBe('claude-opus-4-6')
  })

  it('defaults to system theme', () => {
    expect(makeStore().getState().settings.theme).toBe('system')
  })

  it('defaults to spending limit of 0 (disabled)', () => {
    expect(makeStore().getState().settings.spendingLimit).toBe(0)
  })
})

// ── setOnboardingComplete ─────────────────────────────────────────────────────

describe('setOnboardingComplete', () => {
  it('sets onboardingComplete to true, dismissing the overlay after step 4', () => {
    const store = makeStore()
    store.dispatch(setOnboardingComplete(true))
    expect(store.getState().settings.onboardingComplete).toBe(true)
  })

  it('can be set back to false', () => {
    const store = makeStore()
    store.dispatch(setOnboardingComplete(true))
    store.dispatch(setOnboardingComplete(false))
    expect(store.getState().settings.onboardingComplete).toBe(false)
  })

  it('does not affect any other settings field', () => {
    const store = makeStore()
    store.dispatch(setOnboardingComplete(true))
    const { settings } = store.getState()
    expect(settings.model).toBe('claude-opus-4-6')
    expect(settings.theme).toBe('system')
    expect(settings.spendingLimit).toBe(0)
    expect(settings.contactInfo.fullName).toBe('')
  })
})

// ── setContactInfo ─────────────────────────────────────────────────────────────

describe('setContactInfo', () => {
  it('updates all provided contact fields', () => {
    const store = makeStore()
    store.dispatch(
      setContactInfo({ fullName: 'Alice', phone: '555-1234', email: 'alice@test.com' })
    )
    const { contactInfo } = store.getState().settings
    expect(contactInfo.fullName).toBe('Alice')
    expect(contactInfo.phone).toBe('555-1234')
    expect(contactInfo.email).toBe('alice@test.com')
  })

  it('merges a partial update without clearing other contact fields', () => {
    const store = makeStore()
    // Step 2: user fills in required fields
    store.dispatch(
      setContactInfo({ fullName: 'Alice', phone: '555-1234', email: 'alice@test.com' })
    )
    // Subsequent partial update adds linkedin without disturbing the rest
    store.dispatch(setContactInfo({ linkedin: 'alice-li' }))
    const { contactInfo } = store.getState().settings
    expect(contactInfo.fullName).toBe('Alice')
    expect(contactInfo.phone).toBe('555-1234')
    expect(contactInfo.email).toBe('alice@test.com')
    expect(contactInfo.linkedin).toBe('alice-li')
  })

  it('overwrites a previously set field when the same key is dispatched again', () => {
    const store = makeStore()
    store.dispatch(setContactInfo({ fullName: 'Alice' }))
    store.dispatch(setContactInfo({ fullName: 'Bob' }))
    expect(store.getState().settings.contactInfo.fullName).toBe('Bob')
  })

  it('does not touch settings fields outside contactInfo', () => {
    const store = makeStore()
    store.dispatch(setContactInfo({ fullName: 'Alice' }))
    const { settings } = store.getState()
    expect(settings.onboardingComplete).toBe(false)
    expect(settings.model).toBe('claude-opus-4-6')
    expect(settings.theme).toBe('system')
  })
})

// ── setModel ──────────────────────────────────────────────────────────────────

describe('setModel', () => {
  it('updates the selected model', () => {
    const store = makeStore()
    store.dispatch(setModel('claude-sonnet-4-6'))
    expect(store.getState().settings.model).toBe('claude-sonnet-4-6')
  })

  it('can switch back to a different model', () => {
    const store = makeStore()
    store.dispatch(setModel('claude-sonnet-4-6'))
    store.dispatch(setModel('claude-haiku-4-5-20251001'))
    expect(store.getState().settings.model).toBe('claude-haiku-4-5-20251001')
  })
})

// ── setTheme ──────────────────────────────────────────────────────────────────

describe('setTheme', () => {
  it('updates to dark theme', () => {
    const store = makeStore()
    store.dispatch(setTheme('dark'))
    expect(store.getState().settings.theme).toBe('dark')
  })

  it('updates to light theme', () => {
    const store = makeStore()
    store.dispatch(setTheme('light'))
    expect(store.getState().settings.theme).toBe('light')
  })
})

// ── setSpendingLimit ──────────────────────────────────────────────────────────

describe('setSpendingLimit', () => {
  it('sets a positive spending limit', () => {
    const store = makeStore()
    store.dispatch(setSpendingLimit(10))
    expect(store.getState().settings.spendingLimit).toBe(10)
  })

  it('setting limit to 0 disables it', () => {
    const store = makeStore()
    store.dispatch(setSpendingLimit(10))
    store.dispatch(setSpendingLimit(0))
    expect(store.getState().settings.spendingLimit).toBe(0)
  })
})

// ── setBackupLocation ─────────────────────────────────────────────────────────

describe('setBackupLocation', () => {
  it('updates the backup location path', () => {
    const store = makeStore()
    store.dispatch(setBackupLocation('/Users/alice/Backups'))
    expect(store.getState().settings.backupLocation).toBe('/Users/alice/Backups')
  })

  it('clearing the path stores an empty string', () => {
    const store = makeStore()
    store.dispatch(setBackupLocation('/backups'))
    store.dispatch(setBackupLocation(''))
    expect(store.getState().settings.backupLocation).toBe('')
  })
})

// ── hydrate ───────────────────────────────────────────────────────────────────
// hydrate is called on launch with the result of settings:get to restore persisted
// settings. When onboardingComplete is true the overlay is skipped entirely.

describe('hydrate', () => {
  it('replaces the entire settings state with the loaded value', () => {
    const store = makeStore()
    const loaded: Settings = {
      contactInfo: {
        fullName: 'Alice',
        phone: '555-1234',
        email: 'alice@test.com',
        linkedin: 'alice-li',
        github: 'alice-gh'
      },
      model: 'claude-haiku-4-5-20251001',
      theme: 'dark',
      backupLocation: '/backups',
      spendingLimit: 10,
      onboardingComplete: true
    }
    store.dispatch(hydrate(loaded))
    expect(store.getState().settings).toEqual({ ...loaded, initialized: true })
  })

  it('does not show the onboarding overlay when onboardingComplete: true is hydrated', () => {
    const store = makeStore()
    store.dispatch(hydrate({ ...DEFAULT_SETTINGS, onboardingComplete: true }))
    expect(store.getState().settings.onboardingComplete).toBe(true)
  })

  it('shows the onboarding overlay when onboardingComplete: false is hydrated (first launch)', () => {
    const store = makeStore()
    // First simulate a completed onboarding, then hydrate with false to confirm it's overwritten
    store.dispatch(setOnboardingComplete(true))
    store.dispatch(hydrate({ ...DEFAULT_SETTINGS, onboardingComplete: false }))
    expect(store.getState().settings.onboardingComplete).toBe(false)
  })

  it('restores contact info from persisted settings', () => {
    const store = makeStore()
    store.dispatch(
      hydrate({
        ...DEFAULT_SETTINGS,
        contactInfo: { fullName: 'Bob', phone: '999', email: 'bob@test.com' }
      })
    )
    const { contactInfo } = store.getState().settings
    expect(contactInfo.fullName).toBe('Bob')
    expect(contactInfo.phone).toBe('999')
    expect(contactInfo.email).toBe('bob@test.com')
  })
})
