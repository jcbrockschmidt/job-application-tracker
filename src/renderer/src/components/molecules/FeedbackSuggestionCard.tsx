// A single holistic-feedback suggestion card, rendered inside FeedbackPromptBar
// after a generate:feedback call returns results.
//
// STUB: Phase 4 — card shape complete; Accept and Edit actions not yet wired to
// the document state or the undo/redo history.
// TODO:
//   - Accept button: if item.proposedText is set, look up the current text of item.target
//     in the active document (resume or cover letter), push it onto the undo stack, then
//     apply item.proposedText. Call onAccept(item.id) to remove the card from the list.
//     If proposedText is absent (Add / Remove suggestions), just call onAccept(item.id).
//   - Edit button: show a TextField pre-filled with item.proposedText (or item.suggestion);
//     Save applies the edited text; Escape cancels and restores view mode.
//   - Dismiss button: call onDismiss(item.id) to remove without applying.
//   - The "current text" for the diff view Before row must be resolved from the active
//     document state; this requires the parent to pass a resolver function or the full
//     document JSON. Design TBD — mark with TODO when wiring.

import { useState } from 'react'
import { Box, Button, Chip, Collapse, Typography } from '@mui/material'
import type { FeedbackItem, FeedbackType } from '@shared/types'

const TYPE_COLORS: Record<FeedbackType, { bg: string; text: string }> = {
  Strengthen: { bg: '#dbeafe', text: '#1e40af' },
  Add: { bg: '#dcfce7', text: '#15803d' },
  Remove: { bg: '#fee2e2', text: '#b91c1c' },
  Reframe: { bg: '#fef9c3', text: '#a16207' }
}

interface FeedbackSuggestionCardProps {
  item: FeedbackItem
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
}

// STUB: Phase 4
export default function FeedbackSuggestionCard({
  item,
  onAccept,
  onDismiss
}: FeedbackSuggestionCardProps): JSX.Element {
  const [showJustification, setShowJustification] = useState(false)
  // TODO: const [isEditing, setIsEditing] = useState(false)
  // TODO: const [editDraft, setEditDraft] = useState(item.proposedText ?? item.suggestion)

  const colors = TYPE_COLORS[item.type]

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {/* Header: type chip + target label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={item.type}
          size="small"
          sx={{
            bgcolor: colors.bg,
            color: colors.text,
            fontWeight: 700,
            fontSize: 11,
            height: 20,
            '& .MuiChip-label': { px: 0.875 }
          }}
        />
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{item.target}</Typography>
      </Box>

      {/* Suggestion text */}
      {/* TODO: when isEditing, render TextField pre-filled with editDraft; Enter/Save applies */}
      <Typography sx={{ fontSize: 12.5, color: 'text.primary', lineHeight: 1.6 }}>
        {item.suggestion}
      </Typography>

      {/* Diff view — only shown for suggestions with a concrete replacement */}
      {/* STUB: Phase 4 — Before row shows a placeholder; wire to actual document text when wiring */}
      {item.proposedText && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {/* Before row */}
          {/* TODO: replace placeholder with the actual current text of item.target, looked up from document state */}
          <Box
            sx={{
              bgcolor: 'error.light',
              border: '1px solid',
              borderColor: 'error.main',
              borderRadius: 1,
              px: 1.25,
              py: 0.75,
              fontSize: 11.5,
              color: 'error.contrastText',
              textDecoration: 'line-through',
              lineHeight: 1.55,
              opacity: 0.8
            }}
          >
            [Current text of &ldquo;{item.target}&rdquo; — wire to document state in Phase 4]
          </Box>

          {/* After row */}
          <Box
            sx={{
              bgcolor: 'success.light',
              border: '1px solid',
              borderColor: 'success.main',
              borderRadius: 1,
              px: 1.25,
              py: 0.75,
              fontSize: 11.5,
              color: 'success.contrastText',
              lineHeight: 1.55,
              opacity: 0.8
            }}
          >
            {item.proposedText}
          </Box>
        </Box>
      )}

      {/* Justification (collapsible) */}
      <Box>
        <Typography
          component="button"
          onClick={() => setShowJustification((v) => !v)}
          sx={{
            fontSize: 11.5,
            color: 'text.secondary',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            p: 0,
            textDecoration: 'underline'
          }}
        >
          {showJustification ? 'Hide justification' : 'Why?'}
        </Typography>
        <Collapse in={showJustification}>
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.5, lineHeight: 1.6 }}>
            {item.justification}
          </Typography>
        </Collapse>
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
        {/* TODO: apply proposedText to document, push old text to undo stack, then call onAccept */}
        <Button
          size="small"
          variant="contained"
          disableElevation
          onClick={() => onAccept(item.id)}
          sx={{ fontSize: 11.5 }}
        >
          Accept
        </Button>
        {/* TODO: onClick={() => setIsEditing(true)} */}
        <Button size="small" variant="outlined" sx={{ fontSize: 11.5 }}>
          Edit
        </Button>
        <Button
          size="small"
          onClick={() => onDismiss(item.id)}
          sx={{ fontSize: 11.5, color: 'text.secondary' }}
        >
          Dismiss
        </Button>
      </Box>
    </Box>
  )
}
