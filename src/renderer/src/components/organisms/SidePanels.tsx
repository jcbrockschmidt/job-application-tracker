// Right-hand side panels shown in the session view alongside every tab.
// Contains two stacked panels: Match Rating (condensed) and Job Description.

import { useState } from 'react'
import { Box, Chip, Typography, Paper, IconButton, TextField, Button } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useAppDispatch } from '../../hooks'
import { updateSession } from '../../store/slices/sessionsSlice'
import { setSaveState } from '../../store/slices/uiSlice'
import type { Session, MatchReport, MatchRating } from '@shared/types'

interface SidePanelsProps {
  session: Session
}

export default function SidePanels({ session }: SidePanelsProps): JSX.Element {
  const [isEditingJd, setIsEditingJd] = useState(false)
  const [jdDraft, setJdDraft] = useState(session.jobDescription)
  const dispatch = useAppDispatch()

  const handleEditClick = (): void => {
    setJdDraft(session.jobDescription)
    setIsEditingJd(true)
  }

  const handleSaveJd = async (): Promise<void> => {
    try {
      dispatch(setSaveState('saving'))
      const lastSaved = new Date().toISOString()
      await window.api.sessions.update(session.id, { jobDescription: jdDraft, lastSaved })
      dispatch(updateSession({ id: session.id, updates: { jobDescription: jdDraft, lastSaved } }))
      dispatch(setSaveState('saved'))
      setIsEditingJd(false)
    } catch (err) {
      console.error('Failed to save JD:', err)
      dispatch(setSaveState('error'))
    }
  }

  const handleCancelJd = (): void => {
    setIsEditingJd(false)
    setJdDraft(session.jobDescription)
  }

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
          <MatchRatingCard report={session.matchReport} />
        )}
      </Panel>

      {/* Job Description panel */}
      <Panel
        title="Job Description"
        action={
          !isEditingJd && (
            <IconButton size="small" aria-label="Edit job description" onClick={handleEditClick}>
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )
        }
      >
        {isEditingJd ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              multiline
              fullWidth
              minRows={5}
              maxRows={15}
              value={jdDraft}
              onChange={(e) => setJdDraft(e.target.value)}
              variant="outlined"
              size="small"
              slotProps={{ input: { sx: { fontSize: 12, lineHeight: 1.5 } } }}
            />
            <Typography sx={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
              Note: Editing the JD does not automatically regenerate documents.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" onClick={handleCancelJd} sx={{ fontSize: 11 }}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSaveJd}
                disabled={jdDraft === session.jobDescription}
                sx={{ fontSize: 11 }}
              >
                Save
              </Button>
            </Box>
          </Box>
        ) : (
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
        )}
      </Panel>
    </Box>
  )
}

// ─── Internal sub-components ─────────────────────────────────────────────────

const RATING_COLORS: Record<MatchRating, { bg: string; text: string; darkBg: string; darkText: string }> = {
  Strong: { bg: '#dcfce7', text: '#15803d', darkBg: '#064e3b', darkText: '#4ade80' },
  Good: { bg: '#dbeafe', text: '#1d4ed8', darkBg: '#1e3a8a', darkText: '#60a5fa' },
  Fair: { bg: '#fef9c3', text: '#a16207', darkBg: '#713f12', darkText: '#facc15' },
  Weak: { bg: '#fee2e2', text: '#b91c1c', darkBg: '#7f1d1d', darkText: '#f87171' }
}

function MatchRatingCard({ report }: { report: MatchReport }): JSX.Element {
  const ratingColor = RATING_COLORS[report.rating]
  const keyPoints = [...report.strengths, ...report.gaps].slice(0, 3)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Chip
        label={report.rating}
        size="small"
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? ratingColor.darkBg : ratingColor.bg,
          color: (theme) =>
            theme.palette.mode === 'dark' ? ratingColor.darkText : ratingColor.text,
          fontWeight: 700,
          alignSelf: 'flex-start',
          fontSize: 12
        }}
      />
      {keyPoints.map((point, i) => {
        const isStrength = i < report.strengths.length
        return (
          <Box key={i} sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
            {isStrength ? (
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: 13,
                  color: (theme) => (theme.palette.mode === 'dark' ? '#4ade80' : '#16a34a'),
                  mt: 0.2,
                  flexShrink: 0
                }}
              />
            ) : (
              <WarningAmberIcon
                sx={{
                  fontSize: 13,
                  color: (theme) => (theme.palette.mode === 'dark' ? '#fbbf24' : '#d97706'),
                  mt: 0.2,
                  flexShrink: 0
                }}
              />
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
          borderBottom: '1px solid',
          borderColor: 'divider',
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
