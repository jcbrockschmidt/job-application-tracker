// Settings page: API key, model picker, contact info, theme, spending limit, backup.
// Accessible from the sidebar footer icon and the topbar settings icon.
//
// STUB: Phase 1 — section structure is scaffolded; all inputs are uncontrolled placeholders.
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
//   - Backup Location: directory path picker (Phase 6)

import { Box, Typography, Divider, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material'

export default function SettingsPage(): JSX.Element {
  // TODO: const settings = useAppSelector(state => state.settings)
  // TODO: const dispatch = useAppDispatch()
  // TODO: const [models, setModels] = useState<string[]>([])
  // TODO: useEffect(() => { window.api.settings.getAvailableModels().then(setModels) }, [])

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Configure your API key, model, and preferences.
      </Typography>

      <SettingsSection title="Anthropic API Key">
        {/* TODO: masked input; Validate button; inline success/error feedback */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <TextField
            label="API Key"
            type="password"
            size="small"
            sx={{ flex: 1 }}
            placeholder="sk-ant-…"
          />
          <Button variant="outlined" size="medium">
            Validate
          </Button>
        </Box>
      </SettingsSection>

      <SettingsSection title="Claude Model">
        {/* TODO: populate from getAvailableModels(); show model name */}
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Model</InputLabel>
          <Select label="Model" value="">
            <MenuItem value="" disabled>Loading models…</MenuItem>
          </Select>
        </FormControl>
      </SettingsSection>

      <SettingsSection title="Contact Info">
        {/* TODO: pre-populate from settingsSlice.contactInfo; Save button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 400 }}>
          <TextField label="Full name" size="small" required />
          <TextField label="Phone" size="small" required />
          <TextField label="Email" size="small" required type="email" />
          <TextField label="LinkedIn URL" size="small" />
          <TextField label="GitHub URL" size="small" />
          <Button variant="contained" disableElevation sx={{ alignSelf: 'flex-start' }}>
            Save
          </Button>
        </Box>
      </SettingsSection>

      <SettingsSection title="Theme">
        {/* TODO: dispatch setTheme and apply to ThemeProvider */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Theme</InputLabel>
          <Select label="Theme" value="system">
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="system">System default</MenuItem>
          </Select>
        </FormControl>
      </SettingsSection>

      <SettingsSection title="Daily Spending Limit">
        {/* TODO: number input; 0 = disabled; dispatch setSpendingLimit */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            label="Limit (USD)"
            size="small"
            type="number"
            sx={{ width: 140 }}
            inputProps={{ min: 0, step: 0.5 }}
            placeholder="0"
          />
          <Typography variant="caption" color="text.secondary">
            Set to 0 to disable. Costs shown are estimates.
          </Typography>
        </Box>
      </SettingsSection>

      <SettingsSection title="Backup Location">
        {/* TODO: directory picker; save to settings; Phase 6 */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            label="Backup directory"
            size="small"
            sx={{ flex: 1, maxWidth: 400 }}
            placeholder="Not set"
            disabled
          />
          <Button variant="outlined" size="medium" disabled>
            Browse…
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Incremental backups run automatically on app close. (Phase 6)
        </Typography>
      </SettingsSection>
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
