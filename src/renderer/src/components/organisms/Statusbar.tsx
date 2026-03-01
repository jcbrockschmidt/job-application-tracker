// Status bar: thin bar pinned to the bottom of the window.
// Shows save-state indicator, active context, and last-saved timestamp.
//
// STUB: Phase 1 — renders static placeholder text.
// TODO:
//   - Read save state from a uiSlice field (e.g. saveState: 'saved' | 'saving' | 'error')
//   - Read last-saved timestamp from the active session in sessionsSlice
//   - Show the active session name or page name as the current context
//   - Update saveState to 'saving' when sessions:update is in-flight, 'saved' on success

import { Box, Typography } from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

export default function Statusbar(): JSX.Element {
  // TODO: const saveState = useAppSelector(state => state.ui.saveState)
  // TODO: const lastSaved = useAppSelector(state => ...)
  // TODO: const context = useAppSelector(state => ...)

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: '#f0f1f3',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        px: 1.75,
        gap: 1.75
      }}
    >
      {/* Save-state indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <FiberManualRecordIcon sx={{ fontSize: 8, color: '#4caf50' }} />
        {/* TODO: show "Saving…" when save is in flight */}
        <StatusText>All changes saved</StatusText>
      </Box>

      <StatusSep />

      {/* Active context */}
      {/* TODO: show active session company + role, or page name */}
      <StatusText>—</StatusText>

      <Box sx={{ flex: 1 }} />

      {/* Last-saved timestamp */}
      {/* TODO: show human-readable relative time, e.g. "Saved just now" */}
      <StatusText>—</StatusText>
    </Box>
  )
}

function StatusText({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <Typography sx={{ fontSize: 11.5, color: '#5f6b7c' }}>
      {children}
    </Typography>
  )
}

function StatusSep(): JSX.Element {
  return <Typography sx={{ fontSize: 11.5, color: '#cdd0d4' }}>|</Typography>
}
