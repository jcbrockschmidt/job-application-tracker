// Settings page: API key, model picker, contact info, theme, spending limit, backup.
// Accessible from the sidebar footer icon and the topbar settings icon.
//
// STUB: Phase 1 — section structure is scaffolded; all inputs are uncontrolled placeholders.
// STUB: Phase 6 — Backup section expanded with Browse button, "Export full backup now",
//   and "Import backup…" stubs. ErrorToast stub placed for backup success feedback.
//   None of the backup actions are wired yet.
// TODO:
//   - API Key section: masked input + Validate button
//     → window.api.settings.validateApiKey(key); persist to keychain on success
//   - Model section: dropdown from window.api.settings.getAvailableModels()
//     → dispatch setModel(id); window.api.settings.save({ model })
//   - Contact Info: form pre-populated from settingsSlice
//     → dispatch setContactInfo(...); window.api.settings.save({ contactInfo })
//   - Theme: Light / Dark / System radio/select
//     → dispatch setTheme(theme); apply to MUI ThemeProvider
//   - Spending Limit: number input (0 = disabled)
//     → dispatch setSpendingLimit(n); window.api.settings.save({ spendingLimit })
//   - Backup section (Phase 6): see BackupSection TODO below

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../hooks'
import {
  setContactInfo,
  setModel,
  setTheme,
  setSpendingLimit
} from '../../store/slices/settingsSlice'
import type { ContactInfo, Theme } from '@shared/types'
import ErrorToast from '../molecules/ErrorToast'

export default function SettingsPage(): JSX.Element {
  const settings = useAppSelector((state) => state.settings)
  const dispatch = useAppDispatch()

  // API Key validation state
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Models state
  const [models, setModels] = useState<string[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  // Contact Info form state (local to avoid excessive re-renders/dispatch)
  const [contactForm, setContactForm] = useState<ContactInfo>(settings.contactInfo)

  // Success toast for various actions
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    setIsLoadingModels(true)
    window.api.settings
      .getAvailableModels()
      .then((availableModels) => {
        setModels(availableModels)
      })
      .catch((err) => {
        console.error('Failed to fetch models:', err)
      })
      .finally(() => {
        setIsLoadingModels(false)
      })
  }, [])

  const handleValidateApiKey = async (): Promise<void> => {
    if (!apiKey.trim()) return
    setIsValidating(true)
    setValidationResult(null)
    try {
      const isValid = await window.api.settings.validateApiKey(apiKey)
      if (isValid) {
        setValidationResult({ success: true, message: 'API key is valid and saved.' })
        setApiKey('') // Clear after success
        // Refresh models as new key might have different access
        const availableModels = await window.api.settings.getAvailableModels()
        setModels(availableModels)
      } else {
        setValidationResult({
          success: false,
          message: 'Invalid API key. Please check and try again.'
        })
      }
    } catch (err) {
      setValidationResult({ success: false, message: `Validation error: ${String(err)}` })
    } finally {
      setIsValidating(false)
    }
  }

  const handleModelChange = async (newModel: string): Promise<void> => {
    dispatch(setModel(newModel))
    await window.api.settings.save({ model: newModel })
    setToastMessage(`Model updated to ${newModel}`)
  }

  const handleContactInfoChange = (field: keyof ContactInfo, value: string): void => {
    setContactForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveContactInfo = async (): Promise<void> => {
    dispatch(setContactInfo(contactForm))
    await window.api.settings.save({ contactInfo: contactForm })
    setToastMessage('Contact information saved')
  }

  const handleThemeChange = async (newTheme: Theme): Promise<void> => {
    dispatch(setTheme(newTheme))
    await window.api.settings.save({ theme: newTheme })
    setToastMessage(`Theme set to ${newTheme}`)
  }

  const handleSpendingLimitChange = async (value: string): Promise<void> => {
    const limit = parseFloat(value) || 0
    dispatch(setSpendingLimit(limit))
    await window.api.settings.save({ spendingLimit: limit })
    // No toast for every keystroke or small change, but maybe on blur or just let it be silent
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Configure your API key, model, and preferences.
      </Typography>

      <SettingsSection title="Anthropic API Key">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 500 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <TextField
              label="API Key"
              type="password"
              size="small"
              sx={{ flex: 1 }}
              placeholder="sk-ant-…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isValidating}
            />
            <Button
              variant="outlined"
              size="medium"
              onClick={handleValidateApiKey}
              disabled={isValidating || !apiKey.trim()}
              startIcon={isValidating ? <CircularProgress size={20} /> : null}
            >
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
          </Box>
          {validationResult && (
            <Alert
              severity={validationResult.success ? 'success' : 'error'}
              sx={{ py: 0, fontSize: '0.8125rem' }}
            >
              {validationResult.message}
            </Alert>
          )}
          <Typography variant="caption" color="text.secondary">
            Your key is stored securely in your system keychain.
          </Typography>
        </Box>
      </SettingsSection>

      <SettingsSection title="Claude Model">
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Model</InputLabel>
          <Select
            label="Model"
            value={settings.model}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={isLoadingModels}
          >
            {isLoadingModels && (
              <MenuItem value="" disabled>
                Loading models…
              </MenuItem>
            )}
            {!isLoadingModels && models.length === 0 && (
              <MenuItem value="" disabled>
                No models available. Validate your API key first.
              </MenuItem>
            )}
            {models.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </SettingsSection>

      <SettingsSection title="Contact Info">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 400 }}>
          <TextField
            label="Full name"
            size="small"
            required
            value={contactForm.fullName}
            onChange={(e) => handleContactInfoChange('fullName', e.target.value)}
          />
          <TextField
            label="Phone"
            size="small"
            required
            value={contactForm.phone}
            onChange={(e) => handleContactInfoChange('phone', e.target.value)}
          />
          <TextField
            label="Email"
            size="small"
            required
            type="email"
            value={contactForm.email}
            onChange={(e) => handleContactInfoChange('email', e.target.value)}
          />
          <TextField
            label="LinkedIn URL"
            size="small"
            value={contactForm.linkedin || ''}
            onChange={(e) => handleContactInfoChange('linkedin', e.target.value)}
          />
          <TextField
            label="GitHub URL"
            size="small"
            value={contactForm.github || ''}
            onChange={(e) => handleContactInfoChange('github', e.target.value)}
          />
          <Button
            variant="contained"
            disableElevation
            sx={{ alignSelf: 'flex-start' }}
            onClick={handleSaveContactInfo}
          >
            Save
          </Button>
        </Box>
      </SettingsSection>

      <SettingsSection title="Theme">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Theme</InputLabel>
          <Select
            label="Theme"
            value={settings.theme}
            onChange={(e) => handleThemeChange(e.target.value as Theme)}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="system">System default</MenuItem>
          </Select>
        </FormControl>
      </SettingsSection>

      <SettingsSection title="Daily Spending Limit">
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            label="Limit (USD)"
            size="small"
            type="number"
            sx={{ width: 140 }}
            inputProps={{ min: 0, step: 0.5 }}
            placeholder="0"
            value={settings.spendingLimit}
            onChange={(e) => handleSpendingLimitChange(e.target.value)}
          />
          <Typography variant="caption" color="text.secondary">
            Set to 0 to disable. Costs shown are estimates.
          </Typography>
        </Box>
      </SettingsSection>

      {/* Backup section — STUB: Phase 6 */}
      <BackupSection />

      <ErrorToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </Box>
  )
}

// ─── Backup Section ───────────────────────────────────────────────────────────

// STUB: Phase 6 — full backup section layout rendered; no actions are wired.
function BackupSection(): JSX.Element {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
        Backup
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
        <TextField
          label="Backup directory"
          size="small"
          sx={{ flex: 1, maxWidth: 400 }}
          placeholder="Not set"
          disabled
        />
        <Button variant="outlined" size="medium">
          Browse…
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Incremental backups run automatically on app close. Only files changed since the last backup
        are copied.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Button variant="contained" disableElevation size="small">
          Export full backup now
        </Button>

        <Button variant="outlined" size="small">
          Import backup…
        </Button>
      </Box>

      <Divider sx={{ mt: 4 }} />
    </Box>
  )
}

// ─── Internal sub-components ─────────────────────────────────────────────────

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

function SettingsSection({ title, children }: SettingsSectionProps): JSX.Element {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
      <Divider sx={{ mt: 4 }} />
    </Box>
  )
}
