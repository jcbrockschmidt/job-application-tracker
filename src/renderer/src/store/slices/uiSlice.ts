import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Page = 'onboarding' | 'masterList' | 'session' | 'settings' | 'masterCV'

// STUB: Phase 3 — token usage recorded after an AI call completes.
// Dispatched by SessionPage / MasterCVPage after each generate:* or masterCV:regenerate IPC call.
// The generate:* IPC handlers must return token counts alongside the document for this to work;
// or a separate IPC channel can return the last spend log entry.
// TODO: decide whether to embed token info in generate:* return types or use a separate channel.
export interface LastAiOp {
  model: string
  inputTokens: number
  outputTokens: number
  // Estimated cost in USD based on published model pricing.
  estimatedCostUsd: number
}

export interface UIState {
  activePage: Page
  isSidebarOpen: boolean
  // STUB: Phase 3 — null until the first AI call completes in the current session.
  lastAiOp: LastAiOp | null
}

const initialState: UIState = {
  activePage: 'onboarding',
  isSidebarOpen: true,
  lastAiOp: null
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
    }
  }
})

export const { setActivePage, setSidebarOpen, setLastAiOp } = uiSlice.actions

export default uiSlice.reducer
