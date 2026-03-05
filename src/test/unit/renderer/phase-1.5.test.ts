import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer, { setSaveState, setLastAiOp } from '../../../renderer/src/store/slices/uiSlice'
import sessionsReducer, {
  updateSession,
  addSession
} from '../../../renderer/src/store/slices/sessionsSlice'
import type { Session } from '@shared/types'

describe('Phase 1.5 - UI and Session State', () => {
  describe('uiSlice', () => {
    it('should update saveState', () => {
      const store = configureStore({ reducer: { ui: uiReducer } })

      store.dispatch(setSaveState('saving'))
      expect(store.getState().ui.saveState).toBe('saving')

      store.dispatch(setSaveState('saved'))
      expect(store.getState().ui.saveState).toBe('saved')

      store.dispatch(setSaveState('error'))
      expect(store.getState().ui.saveState).toBe('error')
    })

    it('should update lastAiOp', () => {
      const store = configureStore({ reducer: { ui: uiReducer } })
      const mockOp = {
        model: 'claude-3-sonnet',
        inputTokens: 100,
        outputTokens: 50,
        estimatedCostUsd: 0.01
      }

      store.dispatch(setLastAiOp(mockOp))
      expect(store.getState().ui.lastAiOp).toEqual(mockOp)
    })
  })

  describe('sessionsSlice', () => {
    const mockSession: Session = {
      id: 'sess_1',
      applicationId: 'app_1',
      companyName: 'Acme',
      roleTitle: 'Dev',
      jobDescription: 'Stuff',
      resume: null,
      coverLetter: null,
      matchReport: null,
      lastSaved: new Date().toISOString(),
      isGenerating: false,
      generationError: null
    }

    it('should update session fields', () => {
      const store = configureStore({ reducer: { sessions: sessionsReducer } })
      store.dispatch(addSession(mockSession))

      const newJd = 'New job description'
      const now = new Date().toISOString()

      store.dispatch(
        updateSession({
          id: 'sess_1',
          updates: { jobDescription: newJd, lastSaved: now }
        })
      )

      const updated = store.getState().sessions.sessions.find((s) => s.id === 'sess_1')
      expect(updated?.jobDescription).toBe(newJd)
      expect(updated?.lastSaved).toBe(now)
    })
  })
})
