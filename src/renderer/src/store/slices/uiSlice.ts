import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { LastAiOp } from '@shared/types'

// STUB: Phase 5 — 'writingProfile' added.
export type Page =
  | 'onboarding'
  | 'masterList'
  | 'session'
  | 'settings'
  | 'masterCV'
  | 'writingProfile'

export type SaveState = 'saved' | 'saving' | 'error'

export interface UIState {
  activePage: Page
  isSidebarOpen: boolean
  // STUB: Phase 3 — null until the first AI call completes in the current session.
  lastAiOp: LastAiOp | null
  saveState: SaveState
}

const initialState: UIState = {
  activePage: 'masterList',
  isSidebarOpen: true,
  lastAiOp: null,
  saveState: 'saved'
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActivePage(state, action: PayloadAction<Page>) {
      state.activePage = action.payload
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload
    },
    // STUB: Phase 3 — dispatch after each successful AI call to update the token usage display.
    setLastAiOp(state, action: PayloadAction<LastAiOp | null>) {
      state.lastAiOp = action.payload
    },
    setSaveState(state, action: PayloadAction<SaveState>) {
      state.saveState = action.payload
    }
  }
})

export const { setActivePage, setSidebarOpen, setLastAiOp, setSaveState } = uiSlice.actions

export default uiSlice.reducer
