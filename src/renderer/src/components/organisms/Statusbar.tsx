// Status bar: thin bar pinned to the bottom of the window.
// Shows save-state indicator, active context, and last-saved timestamp.

import { Box, Typography, Tooltip } from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { useAppSelector } from '../../hooks'

export default function Statusbar(): JSX.Element {
  const saveState = useAppSelector((state) => state.ui.saveState)
  const activePage = useAppSelector((state) => state.ui.activePage)
  const activeSessionId = useAppSelector((state) => state.sessions.activeSessionId)
  const session = useAppSelector((state) =>
    state.sessions.sessions.find((s) => s.id === activeSessionId)
  )

  let saveLabel = 'All changes saved'
  let saveColor = '#4caf50' // Green
  if (saveState === 'saving') {
    saveLabel = 'Saving…'
    saveColor = '#ffb74d' // Amber
  } else if (saveState === 'error') {
    saveLabel = 'Error saving'
    saveColor = '#f44336' // Red
  }

  // Determine active context text
  let contextText = '—'
  if (activePage === 'session' && session) {
    contextText = `${session.companyName} · ${session.roleTitle}`
  } else if (activePage === 'onboarding') {
    contextText = 'Onboarding'
  } else if (activePage === 'masterList') {
    contextText = 'Application List'
  } else if (activePage === 'settings') {
    contextText = 'Settings'
  } else if (activePage === 'masterCV') {
    contextText = 'Master CV'
  } else if (activePage === 'writingProfile') {
    contextText = 'Writing Profile'
  }

  // Format last saved time
  const lastSavedText = session?.lastSaved
    ? `Saved at ${new Date(session.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : '—'

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
        <FiberManualRecordIcon
          sx={{
            fontSize: 8,
            color: saveColor,
            animation: saveState === 'saving' ? 'pulse 1.5s infinite ease-in-out' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.4 },
              '100%': { opacity: 1 }
            }
          }}
        />
        <StatusText>{saveLabel}</StatusText>
      </Box>

      <StatusSep />

      {/* Active context */}
      <Tooltip title="Current Context" arrow>
        <Box
          sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          <StatusText>{contextText}</StatusText>
        </Box>
      </Tooltip>

      <Box sx={{ flex: 1 }} />

      {/* Last-saved timestamp */}
      <StatusText>{lastSavedText}</StatusText>
    </Box>
  )
}

function StatusText({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <Typography sx={{ fontSize: 11.5, color: '#5f6b7c', whiteSpace: 'nowrap' }}>
      {children}
    </Typography>
  )
}

function StatusSep(): JSX.Element {
  return <Typography sx={{ fontSize: 11.5, color: '#cdd0d4' }}>|</Typography>
}
