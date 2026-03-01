// Sidebar: persistent left-hand navigation.
// Top section: Application List and Master CV nav items (Phase 2/3).
// Middle section: scrollable list of open sessions.
// Footer: Writing Profile nav item (Phase 5) and Settings icon.
//
// STUB: Phase 1 — renders nav structure with placeholder items.
// TODO:
//   - Populate session list from sessionsSlice
//   - Wire nav items to dispatch setActivePage(...)
//   - Show Draft/Final badge per session
//   - Show close (×) button on session item hover
//   - Show yellow unincorporated-count badge on Master CV and Writing Profile nav items (Phase 3/5)

import { Box, Typography, ButtonBase, Divider } from '@mui/material'
import ListAltIcon from '@mui/icons-material/ListAlt'
import ArticleIcon from '@mui/icons-material/Article'
import EditNoteIcon from '@mui/icons-material/EditNote'
import SettingsIcon from '@mui/icons-material/Settings'

const SIDEBAR_BG = '#1a2332'
const SIDEBAR_TEXT = '#8fa3b5'

export default function Sidebar(): JSX.Element {
  // TODO: const sessions = useAppSelector(state => state.sessions.sessions)
  // TODO: const activeSessionId = useAppSelector(state => state.sessions.activeSessionId)
  // TODO: const activePage = useAppSelector(state => state.ui.activePage)
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
      {/* TODO: active state, dispatch setActivePage('masterList') */}
      <NavItem icon={<ListAltIcon sx={{ fontSize: 15 }} />} label="Applications" />

      {/* TODO: active state, dispatch setActivePage('masterCV'), yellow badge */}
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
        {/* TODO: sessions.map(session => <SessionItem key={session.id} session={session} />) */}
        <Typography sx={{ fontSize: 12, color: SIDEBAR_TEXT, px: 1, py: 1, opacity: 0.5 }}>
          No sessions yet
        </Typography>
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
        {/* TODO: Writing Profile nav — dispatch setActivePage('writingProfile') (Phase 5) */}
        <NavItem icon={<EditNoteIcon sx={{ fontSize: 15 }} />} label="Writing Profile" compact />

        {/* TODO: dispatch setActivePage('settings') */}
        <NavItem icon={<SettingsIcon sx={{ fontSize: 15 }} />} label="Settings" compact />
      </Box>
    </Box>
  )
}

// ─── Internal sub-components ─────────────────────────────────────────────────

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
