// Renders a CoverLetterJson as the fixed cover letter template.
// Same header / hairline rule as ResumePaper, then date, salutation,
// body paragraphs, and sign-off.
//
// STUB: Phase 2 — layout complete; interactive features not yet implemented.
// STUB: Phase 4 — ParagraphItem hover toolbar shape rendered; InlineRevisionPanel
// expansion and inline editing not yet wired.
// TODO (Phase 2):
//   - Inline paragraph editing: clicking Edit in ParagraphHoverToolbar turns the
//     paragraph into an auto-growing TextField (MUI multiline); Save / Cancel.
//     Save dispatches updateSession with the edited coverLetter.
// TODO (Phase 4):
//   - Pass sessionId as a prop so ParagraphHoverToolbar can open InlineRevisionPanel.
//   - "Revise with AI" button: expand InlineRevisionPanel beneath the paragraph
//     (scope = `paragraph:${i}`). Gate through SpendingLimitDialog when over limit.
//   - Push old paragraph text onto the undo stack before applying accepted revisions.

import { useState } from 'react'
import { Box, Button, IconButton, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import type { CoverLetterJson, ContactInfo } from '@shared/types'

interface CoverLetterPaperProps {
  coverLetter: CoverLetterJson
  contact: ContactInfo
  // TODO (Phase 4): add sessionId: string so ParagraphHoverToolbar can call generate:revise
}

export default function CoverLetterPaper({
  coverLetter,
  contact
}: CoverLetterPaperProps): JSX.Element {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        width: 720,
        minWidth: 720,
        px: 8,
        py: 7,
        boxShadow: '0 2px 12px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)',
        borderRadius: '2px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Header — matches ResumePaper exactly */}
      <CoverLetterHeader contact={contact} />

      {/* Date */}
      <Typography sx={{ fontSize: '9.5pt', color: '#374151', mt: 2.5, mb: 2 }}>
        {coverLetter.date}
      </Typography>

      {/* Salutation */}
      <Typography sx={{ fontSize: '9.5pt', color: '#374151', mb: 1.75 }}>
        {coverLetter.salutation}
      </Typography>

      {/* Body paragraphs */}
      {/* STUB: Phase 4 — each paragraph wrapped in ParagraphItem with hover toolbar */}
      {coverLetter.paragraphs.map((paragraph, i) => (
        <ParagraphItem key={i} paragraph={paragraph} index={i} />
      ))}

      {/* Sign-off */}
      <Typography sx={{ fontSize: '9.5pt', color: '#374151', mt: 2, mb: 3 }}>
        {coverLetter.signoff}
      </Typography>

      {/* Signature name */}
      <Typography sx={{ fontSize: '9.5pt', fontWeight: 600, color: '#111827' }}>
        {contact.fullName || 'Your Name'}
      </Typography>
    </Box>
  )
}

// ─── Phase 4 stub: Paragraph Item ────────────────────────────────────────────

// Renders a single cover letter paragraph with a dark popup hover toolbar.
//
// STUB: Phase 4 — hover state wired; toolbar buttons are not yet connected to
// InlineRevisionPanel or the inline edit TextField.
// TODO (Phase 2):
//   - Edit button: replace the paragraph Typography with a multiline TextField
//     (auto-growing); Save commits via sessions:update; Escape cancels.
// TODO (Phase 4):
//   - "Revise with AI" button: expand InlineRevisionPanel beneath the paragraph
//     (scope = `paragraph:${index}`). Needs sessionId from CoverLetterPaperProps.
//   - InlineRevisionPanel onAccept: push old text to undo stack, call onParagraphSave.

function ParagraphItem({ paragraph, index }: { paragraph: string; index: number }): JSX.Element {
  const [hovered, setHovered] = useState(false)
  // TODO: const [isEditing, setIsEditing] = useState(false)
  // TODO: const [draft, setDraft] = useState(paragraph)
  // TODO: const [reviseOpen, setReviseOpen] = useState(false)

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ position: 'relative', mb: 1.5 }}
    >
      {/* TODO (Phase 2): when isEditing, render TextField multiline instead */}
      <Typography
        sx={{
          fontSize: '9.5pt',
          color: '#374151',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          borderRadius: '3px',
          bgcolor: hovered ? '#f5f7fa' : 'transparent',
          transition: 'background-color 0.1s'
        }}
      >
        {paragraph}
      </Typography>

      {/* Dark popup hover toolbar — STUB: Phase 4 */}
      <ParagraphHoverToolbar visible={hovered} />

      {/* InlineRevisionPanel — STUB: Phase 4 */}
      {/* TODO: render when reviseOpen === true */}
      {/* <InlineRevisionPanel
            scope={`paragraph:${index}`}
            currentText={paragraph}
            onAccept={(newText) => { onParagraphSave(index, newText); setReviseOpen(false) }}
            onClose={() => setReviseOpen(false)}
          /> */}
      {void index /* suppress unused-var until wired */}
    </Box>
  )
}

// Dark popup toolbar shown below a cover letter paragraph on hover.
// Contains an Edit icon button and a "Revise with AI" button.
//
// STUB: Phase 4 — rendered; buttons have no onClick handlers yet.
// TODO: accept onEdit and onRevise callbacks from ParagraphItem and wire them.

function ParagraphHoverToolbar({ visible }: { visible: boolean }): JSX.Element {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: -28,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
        bgcolor: '#1e293b',
        borderRadius: 1,
        px: 0.5,
        py: 0.375,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        zIndex: 10,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.12s'
      }}
    >
      {/* TODO: onClick={() => onEdit()} */}
      <IconButton size="small" sx={{ color: '#e2e8f0', p: 0.375, '&:hover': { color: '#fff' } }}>
        <EditIcon sx={{ fontSize: 13 }} />
      </IconButton>
      {/* TODO: onClick={() => onRevise()} */}
      <Button
        size="small"
        startIcon={<AutoFixHighIcon sx={{ fontSize: 12 }} />}
        sx={{
          color: '#e2e8f0',
          fontSize: 11,
          px: 0.75,
          py: 0.25,
          minWidth: 0,
          textTransform: 'none',
          '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' }
        }}
      >
        Revise with AI
      </Button>
    </Box>
  )
}

// ─── Internal sub-components ─────────────────────────────────────────────────

function CoverLetterHeader({ contact }: { contact: ContactInfo }): JSX.Element {
  return (
    <>
      <Typography sx={{ fontSize: '22pt', fontWeight: 600, color: '#111827', mb: 0.625 }}>
        {contact.fullName || 'Your Name'}
      </Typography>
      <Typography sx={{ fontSize: '9.5pt', color: '#374151', letterSpacing: '0.01em', mb: 0.25 }}>
        {[contact.phone, contact.email, contact.linkedin, contact.github]
          .filter(Boolean)
          .join(' · ')}
      </Typography>
      <Box sx={{ borderTop: '1px solid #1e3a5f', mt: 1.75 }} />
    </>
  )
}
