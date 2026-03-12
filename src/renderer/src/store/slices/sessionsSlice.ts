import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Session } from '@shared/types'

export interface SessionsState {
  sessions: Session[]
  activeSessionId: string | null
}

const initialState: SessionsState = {
  sessions: [],
  activeSessionId: null
}

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    addSession(state, action: PayloadAction<Session>) {
      state.sessions.push(action.payload)
      state.activeSessionId = action.payload.id
    },
    removeSession(state, action: PayloadAction<string>) {
      state.sessions = state.sessions.filter((s) => s.id !== action.payload)
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = state.sessions.at(-1)?.id ?? null
      }
    },
    setActiveSession(state, action: PayloadAction<string | null>) {
      state.activeSessionId = action.payload
    },
    updateSession(state, action: PayloadAction<{ id: string; updates: Partial<Session> }>) {
      const { id, updates } = action.payload
      const session = state.sessions.find((s) => s.id === id)
      if (session) {
        Object.assign(session, updates)
      }
    },
    setSessions(state, action: PayloadAction<Session[]>) {
      state.sessions = action.payload
    },
    hydrate(_state, action: PayloadAction<SessionsState>) {
      return action.payload
    }
  }
})

export const { addSession, removeSession, setActiveSession, updateSession, setSessions, hydrate } =
  sessionsSlice.actions

export default sessionsSlice.reducer
