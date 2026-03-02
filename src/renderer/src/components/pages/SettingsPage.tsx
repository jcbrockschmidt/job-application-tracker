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

import {
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
// STUB: Phase 6 — import ready; uncomment when wiring backup success toast.
// import ErrorToast from '../molecules/ErrorToast'

export default function SettingsPage(): JSX.Element {
  // TODO: const settings = useAppSelector(state => state.settings)
  // TODO: const dispatch = useAppDispatch()
  // TODO: const [models, setModels] = useState<string[]>([])
  // TODO: useEffect(() => { window.api.settings.getAvailableModels().then(setModels) }, [])

  // STUB: Phase 6 — backup toast state. Uncomment when wiring backup actions.
  // TODO: const [backupToast, setBackupToast] = useState<string | null>(null)

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
            <MenuItem value="" disabled>
              Loading models…
            </MenuItem>
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

      {/* Backup section — STUB: Phase 6 */}
      <BackupSection />

      {/* Backup success toast — STUB: Phase 6 */}
      {/* TODO: render ErrorToast when wiring backup actions:
          <ErrorToast
            message={backupToast}
            onClose={() => setBackupToast(null)}
          /> */}
    </Box>
  )
}

// ─── Backup Section ───────────────────────────────────────────────────────────

// STUB: Phase 6 — full backup section layout rendered; no actions are wired.
// TODO (Phase 6):
//   - Browse button: a new IPC handler is needed to open the OS folder picker.
//       Add 'backup:chooseDirectory' to the IPC surface (ipc/index.ts) and preload:
//         ipcMain.handle('backup:chooseDirectory', async () => {
//           const { filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
//           return filePaths[0] ?? null
//         })
//       On click: path = await window.api.backup.chooseDirectory()
//         → dispatch setBackupLocation(path) + window.api.settings.save({ backupLocation: path })
//   - "Export full backup now" button:
//       Call window.api.backup.trigger(). On success show a toast with the path.
//       Update backup:trigger return type from Promise<void> to Promise<string>
//       so the destination path can be shown in the toast. Add loading state.
//   - "Import backup…" button:
//       Call window.api.backup.import('') — the IPC opens the file picker internally.
//       Warn the user that current data will be overwritten before calling the IPC.
//       After import, prompt the user to restart the app for changes to take effect.
//   - Inline error: show an Alert below the buttons if trigger/import throws.

function BackupSection(): JSX.Element {
  // TODO: const backupLocation = useAppSelector(state => state.settings.backupLocation)
  // TODO: const dispatch = useAppDispatch()
  // TODO: const [isBackingUp, setIsBackingUp] = useState(false)
  // TODO: const [backupError, setBackupError] = useState<string | null>(null)

  // TODO: async function handleBrowse() {
  //   const path = await window.api.backup.chooseDirectory()  // IPC not yet added — see TODO above
  //   if (path) {
  //     dispatch(setBackupLocation(path))
  //     await window.api.settings.save({ backupLocation: path })
  //   }
  // }

  // TODO: async function handleExportNow() {
  //   setIsBackingUp(true)
  //   setBackupError(null)
  //   try {
  //     const path = await window.api.backup.trigger()  // update return type to Promise<string>
  //     setBackupToast(`Backup saved to ${path}`)       // lifted to parent via prop or uiSlice
  //   } catch (err) {
  //     setBackupError(String(err))
  //   } finally {
  //     setIsBackingUp(false)
  //   }
  // }

  // TODO: async function handleImport() {
  //   // Warn the user before proceeding — current data will be overwritten.
  //   await window.api.backup.import('')  // IPC opens file picker internally
  //   // TODO: prompt user to restart the app after import
  // }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
        Backup
      </Typography>

      {/* Backup location picker */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
        <TextField
          label="Backup directory"
          size="small"
          sx={{ flex: 1, maxWidth: 400 }}
          placeholder="Not set"
          // TODO: value={backupLocation || ''}; remove disabled when wiring Browse button
          disabled
        />
        {/* TODO: onClick={handleBrowse} */}
        <Button variant="outlined" size="medium">
          Browse…
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Incremental backups run automatically on app close. Only files changed since the last
        backup are copied.
      </Typography>

      {/* Manual backup and import actions */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {/* TODO: onClick={handleExportNow}, disabled={!backupLocation || isBackingUp} */}
        {/* TODO: show CircularProgress inside button when isBackingUp */}
        <Button variant="contained" disableElevation size="small">
          Export full backup now
        </Button>

        {/* TODO: onClick={handleImport} */}
        <Button variant="outlined" size="small">
          Import backup…
        </Button>
      </Box>

      {/* Inline backup error — STUB: Phase 6 */}
      {/* TODO: shown when backupError !== null */}
      {/* <Alert severity="error" sx={{ mt: 1.5, fontSize: 12.5 }}>{backupError}</Alert> */}

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
