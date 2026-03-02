// Top bar: app brand, "+ New Session" button, settings icon.
// Spans the full window width above the sidebar and main area.
//
// STUB: Phase 1.4 — "+ New Session" button not yet wired to NewSessionDialog.
// TODO: Wire "+ New Session" button to open NewSessionDialog

import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AddIcon from '@mui/icons-material/Add'
import SettingsIcon from '@mui/icons-material/Settings'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { setActivePage, setSidebarOpen } from '../../store/slices/uiSlice'

export default function Topbar(): JSX.Element {
  const dispatch = useAppDispatch()
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen)

  return (
    <AppBar position="static" elevation={2} sx={{ height: '100%', justifyContent: 'center' }}>
      <Toolbar variant="dense" sx={{ gap: 1 }}>
        <IconButton
          color="inherit"
          size="small"
          aria-label="Toggle sidebar"
          onClick={() => dispatch(setSidebarOpen(!isSidebarOpen))}
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, letterSpacing: '0.01em' }}>
          Job Application Kit
        </Typography>

        {/* TODO: Phase 1.4 — onClick opens NewSessionDialog */}
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<AddIcon />}
          sx={{ borderColor: 'rgba(255,255,255,0.4)', fontSize: 13 }}
        >
          New Session
        </Button>

        <IconButton
          color="inherit"
          size="small"
          aria-label="Settings"
          onClick={() => dispatch(setActivePage('settings'))}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
