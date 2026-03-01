// Sidebar: persistent left-hand navigation.
// Top section: Application List and Master CV nav items.
// Middle section: scrollable list of open sessions.
// Footer: Writing Profile nav item (Phase 5) and Settings icon.
//
// STUB: Phase 1 — nav structure and new-session button rendered.
// STUB: Phase 2 — session list populated from Redux; SessionItem stub below.
// TODO:
//   - Wire all nav items to dispatch setActivePage(...)
//   - SessionItem close (×) button: call window.api.sessions.close(id), dispatch removeSession
//   - Show Draft/Final badge per session (requires resumeStatus from applications table —
//     either join into Session or store separately in sessionsSlice)
//   - Show yellow unincorporated-count badge on Master CV and Writing Profile items (Phase 3/5)

import { Box, Typography, ButtonBase, Chip, Divider, IconButton } from '@mui/material'
import ListAltIcon from '@mui/icons-material/ListAlt'
import ArticleIcon from '@mui/icons-material/Article'
import EditNoteIcon from '@mui/icons-material/EditNote'
import SettingsIcon from '@mui/icons-material/Settings'
import CloseIcon from '@mui/icons-material/Close'
import { useAppSelector } from '../../hooks'
import type { Session } from '@shared/types'

const SIDEBAR_BG = '#1a2332'
const SIDEBAR_TEXT = '#8fa3b5'

export default function Sidebar(): JSX.Element {
  const sessions = useAppSelector((state) => state.sessions.sessions)
  const activeSessionId = useAppSelector((state) => state.sessions.activeSessionId)
  // TODO: const activePage = useAppSelector((state) => state.ui.activePage)
  // TODO: const dispatch = useAppDispatch()

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: SIDEBAR_BG,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(0,0,0,0.25)'
      }}
    >
      {/* Top nav: Application List */}
      {/* TODO: active={activePage === 'masterList'}, onClick={() => dispatch(setActivePage('masterList'))} */}
      <NavItem icon={<ListAltIcon sx={{ fontSize: 15 }} />} label="Applications" />

      {/* TODO: active={activePage === 'masterCV'}, onClick, yellow unincorporated badge (Phase 3) */}
      <NavItem icon={<ArticleIcon sx={{ fontSize: 15 }} />} label="Master CV" />

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mt: 1 }} />

      {/* Sessions section label */}
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: SIDEBAR_TEXT,
          px: 2,
          pt: 1.5,
          pb: 1,
          opacity: 0.65
        }}
      >
        Sessions
      </Typography>

      {/* Scrollable session list */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
        {sessions.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: SIDEBAR_TEXT, px: 1, py: 1, opacity: 0.5 }}>
            No sessions yet
          </Typography>
        ) : (
          sessions.map((session) => (
            // STUB: Phase 2 — renders company/role; badge and close not yet wired
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              // TODO: onClick={() => { dispatch(setActiveSessionId(session.id)); dispatch(setActivePage('session')) }}
              onSelect={() => {}}
              // TODO: call window.api.sessions.close(session.id), dispatch removeSession(session.id)
              onClose={() => {}}
            />
          ))
        )}
      </Box>

      {/* "+ New Session" button */}
      {/* TODO: onClick opens NewSessionDialog */}
      <Box sx={{ px: 1, pb: 0.5 }}>
        <ButtonBase
          sx={{
            width: '100%',
            bgcolor: 'rgba(255,255,255,0.07)',
            border: '1px dashed rgba(255,255,255,0.2)',
            color: SIDEBAR_TEXT,
            borderRadius: 2,
            py: 1,
            fontSize: 12.5,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.13)', color: 'white' }
          }}
        >
          + New Session
        </ButtonBase>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

      {/* Footer */}
      <Box sx={{ px: 1, py: 1.5, display: 'flex', gap: 0.5 }}>
        {/* TODO: active state, onClick, yellow unincorporated badge (Phase 5) */}
        <NavItem icon={<EditNoteIcon sx={{ fontSize: 15 }} />} label="Writing Profile" compact />

        {/* TODO: active={activePage === 'settings'}, onClick */}
        <NavItem icon={<SettingsIcon sx={{ fontSize: 15 }} />} label="Settings" compact />
      </Box>
    </Box>
  )
}

// ─── Internal sub-components ─────────────────────────────────────────────────

// STUB: Phase 2 — renders company + role; close button visible on hover.
// TODO:
//   - Draft/Final badge: source resumeStatus from the application row
//   - Close button: calls window.api.sessions.close(session.id) then dispatches removeSession
//   - Active state highlight styling
interface SessionItemProps {
  session: Session
  isActive: boolean
  onSelect: () => void
  onClose: () => void
}

function SessionItem({ session, isActive, onSelect, onClose }: SessionItemProps): JSX.Element {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        mb: 0.25,
        bgcolor: isActive ? 'rgba(255,255,255,0.13)' : 'transparent',
        '&:hover': { bgcolor: isActive ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)' },
        '&:hover .close-btn': { opacity: 1 }
      }}
    >
      <ButtonBase
        onClick={onSelect}
        sx={{
          width: '100%',
          px: 1.5,
          py: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderRadius: 2,
          pr: 4
        }}
      >
        <Typography
          noWrap
          sx={{
            fontSize: 12.5,
            fontWeight: 600,
            color: isActive ? 'white' : SIDEBAR_TEXT,
            width: '100%'
          }}
        >
          {session.companyName || 'Unknown Company'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%', mt: 0.25 }}>
          <Typography noWrap sx={{ fontSize: 11, color: SIDEBAR_TEXT, opacity: 0.7, flex: 1 }}>
            {session.roleTitle || 'Unknown Role'}
          </Typography>
          {/* TODO: show Draft/Final badge based on application.resumeStatus */}
          <Chip
            label="Draft"
            size="small"
            sx={{
              height: 14,
              fontSize: 9,
              fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.12)',
              color: SIDEBAR_TEXT,
              '& .MuiChip-label': { px: 0.75 }
            }}
          />
        </Box>
      </ButtonBase>

      {/* Close button — visible on row hover */}
      {/* TODO: onClick={onClose} */}
      <IconButton
        className="close-btn"
        size="small"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        sx={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0,
          transition: 'opacity 0.15s',
          color: SIDEBAR_TEXT,
          p: 0.25,
          '&:hover': { color: 'white' }
        }}
      >
        <CloseIcon sx={{ fontSize: 13 }} />
      </IconButton>
    </Box>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  compact?: boolean
}

function NavItem({ icon, label, active, compact }: NavItemProps): JSX.Element {
  return (
    <ButtonBase
      sx={{
        mx: 1,
        mt: compact ? 0 : 0.5,
        px: 1.5,
        py: compact ? 0.75 : 1.125,
        borderRadius: 2,
        width: compact ? 'auto' : 'calc(100% - 16px)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        color: active ? 'white' : SIDEBAR_TEXT,
        bgcolor: active ? 'rgba(255,255,255,0.13)' : 'transparent',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'left',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: 'white' }
      }}
    >
      {icon}
      {!compact && <Box sx={{ flex: 1 }}>{label}</Box>}
    </ButtonBase>
  )
}
