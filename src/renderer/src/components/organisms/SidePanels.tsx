// Right-hand side panels shown in the session view alongside every tab.
// Contains two stacked panels: Match Rating (condensed) and Job Description.
//
// STUB: Phase 1 — renders the JD panel; Match Rating panel is an empty state stub.
// TODO:
//   - Match Rating panel: populate rating badge and key points from session.matchReport
//   - JD panel: wire Edit button to an inline textarea; call sessions:update on Save
//   - Show saved notice after JD is saved, with note that documents won't auto-regenerate

import { Box, Typography, Paper, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import type { Session } from '@shared/types'

interface SidePanelsProps {
  session: Session
}

export default function SidePanels({ session }: SidePanelsProps): JSX.Element {
  // TODO: const [isEditingJd, setIsEditingJd] = useState(false)
  // TODO: const [jdDraft, setJdDraft] = useState(session.jobDescription)

  return (
    <Box
      sx={{
        width: 272,
        minWidth: 272,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flexShrink: 0
      }}
    >
      {/* Match Rating panel */}
      <Panel title="Match Rating">
        {session.matchReport == null ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {/* TODO: show rating badge + key points once matchReport is set */}
            Generate a Match Report to see alignment.
          </Typography>
        ) : (
          // TODO: render MatchRatingCard with session.matchReport
          <Typography sx={{ fontSize: 12 }}>Rating loaded — render here</Typography>
        )}
      </Panel>

      {/* Job Description panel */}
      <Panel
        title="Job Description"
        action={
          // TODO: onClick sets isEditingJd(true)
          <IconButton size="small" aria-label="Edit job description">
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        }
      >
        {/* TODO: when isEditingJd, show textarea + Save/Cancel */}
        <Typography
          sx={{
            fontSize: 12,
            color: 'text.secondary',
            lineHeight: 1.65,
            maxHeight: 300,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap'
          }}
        >
          {session.jobDescription || '—'}
        </Typography>
      </Panel>
    </Box>
  )
}

// ─── Internal sub-components ─────────────────────────────────────────────────

interface PanelProps {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

function Panel({ title, action, children }: PanelProps): JSX.Element {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2,
          py: 1.375,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            flex: 1
          }}
        >
          {title}
        </Typography>
        {action}
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Paper>
  )
}
