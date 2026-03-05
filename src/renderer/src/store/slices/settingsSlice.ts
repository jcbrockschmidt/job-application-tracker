import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ContactInfo, Settings, Theme } from '@shared/types'

export interface SettingsState extends Settings {
  initialized: boolean
}

const initialState: SettingsState = {
  contactInfo: {
    fullName: '',
    phone: '',
    email: '',
    linkedin: '',
    github: ''
  },
  model: 'claude-opus-4-6',
  theme: 'system',
  backupLocation: '',
  spendingLimit: 0,
  onboardingComplete: false,
  initialized: false
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setContactInfo(state, action: PayloadAction<Partial<ContactInfo>>) {
      state.contactInfo = { ...state.contactInfo, ...action.payload }
    },
    setModel(state, action: PayloadAction<string>) {
      state.model = action.payload
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
    setBackupLocation(state, action: PayloadAction<string>) {
      state.backupLocation = action.payload
    },
    setSpendingLimit(state, action: PayloadAction<number>) {
      state.spendingLimit = action.payload
    },
    setOnboardingComplete(state, action: PayloadAction<boolean>) {
      state.onboardingComplete = action.payload
    },
    hydrate(_state, action: PayloadAction<Settings>) {
      return { ...action.payload, initialized: true }
    }
  }
})

export const {
  setContactInfo,
  setModel,
  setTheme,
  setBackupLocation,
  setSpendingLimit,
  setOnboardingComplete,
  hydrate
} = settingsSlice.actions

export default settingsSlice.reducer
