// Full match report: header card (rating badge + Regenerate), then a two-column
// Strengths / Gaps panel with icon-prefixed items.
//
// STUB: Phase 2 — layout and rating display complete; Regenerate not yet wired.
// TODO:
//   - Wire Regenerate button: call window.api.generate.matchReport(sessionId),
//     dispatch updateSession({ matchReport }), show loading spinner on the button
//   - Strengths/Gaps: already renders items; add icon-prefixed formatting if icons change

import { Box, Chip, Button, Divider, Typography } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import type { MatchReport, MatchRating } from '@shared/types'

interface MatchReportViewProps {
  report: MatchReport
  // TODO: used when Regenerate button is wired
  sessionId: string
}

export default function MatchReportView({ report }: MatchReportViewProps): JSX.Element {
  // TODO: const [isRegenerating, setIsRegenerating] = useState(false)
  // TODO: const dispatch = useAppDispatch()
  // TODO: async function handleRegenerate() {
  //   setIsRegenerating(true)
  //   try {
  //     const newReport = await window.api.generate.matchReport(sessionId)
  //     dispatch(updateSession({ matchReport: newReport }))
  //   } finally {
  //     setIsRegenerating(false)
  //   }
  // }

  return (
    <Box sx={{ width: 720, minWidth: 720, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header card: rating badge + Regenerate */}
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: '2px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)',
          px: 4,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <RatingBadge rating={report.rating} />
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={600} sx={{ fontSize: 15, color: '#111827' }}>
            {report.rating} Match
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
            Generated {new Date(report.generatedAt).toLocaleString()}
          </Typography>
        </Box>
        {/* TODO: onClick={handleRegenerate}, disabled={isRegenerating}, show spinner */}
        <Button variant="outlined" size="small">
          Regenerate
        </Button>
      </Box>

      {/* Two-column body: Strengths / Gaps */}
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: '2px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
          {/* Strengths column */}
          <Box sx={{ px: 4, py: 3 }}>
            <Typography
              fontWeight={700}
              sx={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#374151',
                mb: 2
              }}
            >
              Strengths
            </Typography>
            {report.strengths.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.25, alignItems: 'flex-start' }}>
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 15, color: '#16a34a', mt: 0.25, flexShrink: 0 }}
                />
                <Typography sx={{ fontSize: '9.5pt', color: '#374151', lineHeight: 1.5 }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Column divider */}
          <Divider orientation="vertical" flexItem />

          {/* Gaps column */}
          <Box sx={{ px: 4, py: 3 }}>
            <Typography
              fontWeight={700}
              sx={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#374151',
                mb: 2
              }}
            >
              Gaps
            </Typography>
            {report.gaps.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.25, alignItems: 'flex-start' }}>
                <WarningAmberIcon
                  sx={{ fontSize: 15, color: '#d97706', mt: 0.25, flexShrink: 0 }}
                />
                <Typography sx={{ fontSize: '9.5pt', color: '#374151', lineHeight: 1.5 }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
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

function RatingBadge({ rating }: { rating: MatchRating }): JSX.Element {
  const { bg, text } = RATING_COLORS[rating]
  return (
    <Chip
      label={rating}
      sx={{ bgcolor: bg, color: text, fontWeight: 700, fontSize: 13, px: 0.5 }}
    />
  )
}
