import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ContactInfo, Settings, Theme } from '@shared/types'

interface SettingsState extends Settings {
  onboardingComplete: boolean
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
  onboardingComplete: false
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
    setOnboardingComplete(state, action: PayloadAction<boolean>) {
      state.onboardingComplete = action.payload
    },
    hydrate(_state, action: PayloadAction<SettingsState>) {
      return action.payload
    }
  }
})

export const {
  setContactInfo,
  setModel,
  setTheme,
  setBackupLocation,
  setOnboardingComplete,
  hydrate
} = settingsSlice.actions

export default settingsSlice.reducer
