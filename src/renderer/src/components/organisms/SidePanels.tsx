// Right-hand side panels shown in the session view alongside every tab.
// Contains two stacked panels: Match Rating (condensed) and Job Description.
//
// STUB: Phase 1 — JD panel renders the job description text.
// STUB: Phase 2 — MatchRatingCard renders condensed rating + key points;
//   JD inline editing not yet wired.
// TODO:
//   - JD panel: clicking Edit shows a resizable textarea; Save calls
//     window.api.sessions.update(session.id, { jobDescription }) then dispatches;
//     show note "Editing the JD does not automatically regenerate documents."
//   - Show "Saved" notice after JD is saved

import { Box, Chip, Typography, Paper, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import type { Session, MatchReport, MatchRating } from '@shared/types'

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
      {/* Match Rating panel — condensed view always visible */}
      <Panel title="Match Rating">
        {session.matchReport == null ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            Generate a Match Report to see alignment.
          </Typography>
        ) : (
          // STUB: Phase 2 — renders condensed rating + first 2–3 points
          <MatchRatingCard report={session.matchReport} />
        )}
      </Panel>

      {/* Job Description panel */}
      <Panel
        title="Job Description"
        action={
          // TODO: onClick={() => setIsEditingJd(true)}
          <IconButton size="small" aria-label="Edit job description">
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        }
      >
        {/* TODO: when isEditingJd, render TextField multiline + Save / Cancel + note */}
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

const RATING_COLORS: Record<MatchRating, { bg: string; text: string }> = {
  Strong: { bg: '#dcfce7', text: '#15803d' },
  Good: { bg: '#dbeafe', text: '#1d4ed8' },
  Fair: { bg: '#fef9c3', text: '#a16207' },
  Weak: { bg: '#fee2e2', text: '#b91c1c' }
}

// STUB: Phase 2 — condensed match report: rating badge + up to 3 key points.
// Shows strengths first; falls back to gaps if strengths are exhausted.
// TODO: determine the right truncation heuristic once designs are finalized
function MatchRatingCard({ report }: { report: MatchReport }): JSX.Element {
  const { bg, text } = RATING_COLORS[report.rating]
  const keyPoints = [...report.strengths, ...report.gaps].slice(0, 3)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Chip
        label={report.rating}
        size="small"
        sx={{ bgcolor: bg, color: text, fontWeight: 700, alignSelf: 'flex-start', fontSize: 12 }}
      />
      {keyPoints.map((point, i) => {
        const isStrength = i < report.strengths.length
        return (
          <Box key={i} sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
            {isStrength ? (
              <CheckCircleOutlineIcon sx={{ fontSize: 13, color: '#16a34a', mt: 0.2, flexShrink: 0 }} />
            ) : (
              <WarningAmberIcon sx={{ fontSize: 13, color: '#d97706', mt: 0.2, flexShrink: 0 }} />
            )}
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.5 }}>
              {point}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

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
