import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Page = 'onboarding' | 'masterList' | 'session' | 'settings'

interface UIState {
  activePage: Page
  isSidebarOpen: boolean
}

const initialState: UIState = {
  activePage: 'onboarding',
  isSidebarOpen: true
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
    }
  }
})

export const { setActivePage, setSidebarOpen } = uiSlice.actions

export default uiSlice.reducer
