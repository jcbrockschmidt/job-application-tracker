// Top bar: app brand, "+ New Session" button, settings icon.
// Spans the full window width above the sidebar and main area.
//
// STUB: Phase 1 — renders placeholder layout; NewSessionDialog not yet wired.
// TODO:
//   - Wire "+ New Session" button to open NewSessionDialog
//   - Wire settings icon to navigate to settings page (dispatch setActivePage('settings'))
//   - Add hamburger to toggle sidebar (dispatch setSidebarOpen)

import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AddIcon from '@mui/icons-material/Add'
import SettingsIcon from '@mui/icons-material/Settings'

export default function Topbar(): JSX.Element {
  // TODO: dispatch(setSidebarOpen(!isSidebarOpen)) on hamburger click
  // TODO: open NewSessionDialog on "+ New Session" click
  // TODO: dispatch(setActivePage('settings')) on settings click

  return (
    <AppBar position="static" elevation={2} sx={{ height: '100%', justifyContent: 'center' }}>
      <Toolbar variant="dense" sx={{ gap: 1 }}>
        <IconButton color="inherit" size="small" aria-label="Toggle sidebar">
          <MenuIcon fontSize="small" />
        </IconButton>

        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, letterSpacing: '0.01em' }}>
          Resume Builder
        </Typography>

        {/* TODO: onClick opens NewSessionDialog */}
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<AddIcon />}
          sx={{ borderColor: 'rgba(255,255,255,0.4)', fontSize: 13 }}
        >
          New Session
        </Button>

        {/* TODO: onClick dispatches setActivePage('settings') */}
        <IconButton color="inherit" size="small" aria-label="Settings">
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
