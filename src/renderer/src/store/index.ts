import { configureStore } from '@reduxjs/toolkit'
import settingsReducer from './slices/settingsSlice'
import sessionsReducer from './slices/sessionsSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    sessions: sessionsReducer,
    ui: uiReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
