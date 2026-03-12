// Sidebar: persistent left-hand navigation.
// Top section: Application List and Master CV nav items.
// Middle section: scrollable list of open sessions.
// Footer: Writing Profile nav item (Phase 5) and Settings icon.
//
// STUB: Phase 1 — nav structure and new-session button rendered.
// STUB: Phase 2 — session list populated from Redux; SessionItem stub below.
// STUB: Phase 5 — Writing Profile nav item wired to activePage; badge count is a stub (always 0).
// STUB: Phase 7 — accessibility stubs identified below; not yet implemented.
// TODO:
//   - Wire all nav items to dispatch setActivePage(...)
//   - SessionItem close (×) button: call window.api.sessions.close(id), dispatch removeSession
//   - Show Draft/Final badge per session (requires resumeStatus from applications table —
//     either join into Session or store separately in sessionsSlice)
//   - Show yellow unincorporated-count badge on Master CV item (Phase 3)
//   - Writing Profile badge (Phase 5): load unincorporated cover letter count from
//     WritingProfilePage data or a shared Redux slice; pass as badgeCount to NavItem
// TODO (Phase 7 — ARIA labels):
//   - NavItem in compact mode (Writing Profile, Settings footer icons): these show only an
//     icon; pass an aria-label to the ButtonBase so screen readers announce the destination.
//   - "New Session" ButtonBase: add aria-label="New session" for screen reader clarity.
//   - SessionItem close IconButton: add aria-label that includes the session name,
//     e.g. aria-label={`Close ${session.companyName} – ${session.roleTitle}`}.
// TODO (Phase 7 — keyboard navigation):
//   - SessionItem close button is opacity:0 until hover. The button is in the DOM and
//     already keyboard-focusable; add an :focus-visible rule (or inline sx) so it becomes
//     visible when focused via keyboard, not just on mouse hover.

import {
  Box,
  Typography,
  ButtonBase,
  Chip,
  Divider,
  IconButton,
  Badge,
  CircularProgress
} from '@mui/material'
import ListAltIcon from '@mui/icons-material/ListAlt'
import ArticleIcon from '@mui/icons-material/Article'
import EditNoteIcon from '@mui/icons-material/EditNote'
import SettingsIcon from '@mui/icons-material/Settings'
import CloseIcon from '@mui/icons-material/Close'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { setActivePage } from '../../store/slices/uiSlice'
import { setActiveSession, removeSession, setSessions } from '../../store/slices/sessionsSlice'
import type { Session } from '@shared/types'

const SIDEBAR_BG = '#1a2332'
const SIDEBAR_TEXT = '#8fa3b5'

interface SidebarProps {
  onNewSession: () => void
}

export default function Sidebar({ onNewSession }: SidebarProps): JSX.Element {
  const sessions = useAppSelector((state) => state.sessions.sessions)
  const activeSessionId = useAppSelector((state) => state.sessions.activeSessionId)
  const applicationsLastChanged = useAppSelector((state) => state.ui.applicationsLastChanged)
  // STUB: Phase 5
  const activePage = useAppSelector((state) => state.ui.activePage)
  const dispatch = useAppDispatch()
  // STUB: Phase 5 — unincorporated cover letter count for the Writing Profile badge.
  // TODO: derive from WritingProfilePage load or a dedicated Redux slice; 0 for now.
  const writingProfileUnincorporatedCount = 0

  useEffect(() => {
    window.api.sessions.getAll().then((allSessions) => {
      dispatch(setSessions(allSessions))
    })
  }, [applicationsLastChanged, dispatch])

  const handleCloseSession = async (id: string): Promise<void> => {
    try {
      await window.api.sessions.close(id)
      dispatch(removeSession(id))
    } catch (err) {
      console.error('Failed to close session:', err)
    }
  }

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
      <NavItem
        icon={<ListAltIcon sx={{ fontSize: 15 }} />}
        label="Applications"
        active={activePage === 'masterList'}
        onClick={() => dispatch(setActivePage('masterList'))}
      />

      {/* TODO: yellow unincorporated badge (Phase 3) */}
      <NavItem
        icon={<ArticleIcon sx={{ fontSize: 15 }} />}
        label="Master CV"
        active={activePage === 'masterCV'}
        onClick={() => dispatch(setActivePage('masterCV'))}
      />

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
            <SessionItem
              key={session.id}
              session={session}
              isActive={activePage === 'session' && session.id === activeSessionId}
              onSelect={() => {
                dispatch(setActiveSession(session.id))
                dispatch(setActivePage('session'))
              }}
              onClose={() => handleCloseSession(session.id)}
            />
          ))
        )}
      </Box>

      {/* "+ New Session" button */}
      <Box sx={{ px: 1, pb: 0.5 }}>
        <ButtonBase
          onClick={onNewSession}
          aria-label="New session"
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
        {/* STUB: Phase 5 — active state and onClick wired; badge count is a stub (always 0). */}
        {/* TODO: replace writingProfileUnincorporatedCount with a live value once data is loaded. */}
        <NavItem
          icon={
            <Badge
              badgeContent={writingProfileUnincorporatedCount}
              color="warning"
              sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 14, height: 14 } }}
            >
              <EditNoteIcon sx={{ fontSize: 15 }} />
            </Badge>
          }
          label="Writing Profile"
          compact
          active={activePage === 'writingProfile'}
          onClick={() => dispatch(setActivePage('writingProfile'))}
          aria-label="Writing Profile"
        />

        <NavItem
          icon={<SettingsIcon sx={{ fontSize: 15 }} />}
          label="Settings"
          compact
          active={activePage === 'settings'}
          onClick={() => dispatch(setActivePage('settings'))}
          aria-label="Settings"
        />
      </Box>
    </Box>
  )
}

// ─── Internal sub-components ─────────────────────────────────────────────────

interface SessionItemProps {
  session: Session
  isActive: boolean
  onSelect: () => void
  onClose: () => void
}

function SessionItem({ session, isActive, onSelect, onClose }: SessionItemProps): JSX.Element {
  const isLoading = session.isGenerating
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        mb: 0.25,
        bgcolor: isActive ? 'rgba(255,255,255,0.13)' : 'transparent',
        '&:hover': {
          bgcolor: isLoading || isActive ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)'
        },
        '&:hover .close-btn': { opacity: isLoading ? 0 : 1 },
        '& .close-btn:focus-visible': { opacity: 1, color: 'white' }
      }}
    >
      <ButtonBase
        onClick={isLoading ? undefined : onSelect}
        disabled={isLoading}
        sx={{
          width: '100%',
          px: 1.5,
          py: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderRadius: 2,
          pr: 4,
          cursor: isLoading ? 'default' : 'pointer'
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
            {session.isGenerating ? 'Generating…' : session.roleTitle || 'Unknown Role'}
          </Typography>
          {!session.isGenerating && (
            <Chip
              label={session.resumeStatus === 'finalized' ? 'Final' : 'Draft'}
              size="small"
              sx={{
                height: 14,
                fontSize: 9,
                fontWeight: 700,
                bgcolor:
                  session.resumeStatus === 'finalized'
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(255,255,255,0.12)',
                color: session.resumeStatus === 'finalized' ? '#81c784' : SIDEBAR_TEXT,
                '& .MuiChip-label': { px: 0.75 }
              }}
            />
          )}
          {session.isGenerating && (
            <CircularProgress
              size={10}
              thickness={5}
              sx={{ color: SIDEBAR_TEXT, opacity: 0.7, flexShrink: 0 }}
            />
          )}
        </Box>
      </ButtonBase>

      <IconButton
        className="close-btn"
        size="small"
        aria-label={`Close ${session.companyName || 'session'} – ${session.roleTitle || ''}`}
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
  onClick?: () => void
  'aria-label'?: string
}

function NavItem({
  icon,
  label,
  active,
  compact,
  onClick,
  'aria-label': ariaLabel
}: NavItemProps): JSX.Element {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={compact ? (ariaLabel ?? label) : undefined}
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
