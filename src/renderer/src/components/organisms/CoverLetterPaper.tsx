// Renders a CoverLetterJson as the fixed cover letter template.
// Same header / hairline rule as ResumePaper, then date, salutation,
// body paragraphs, and sign-off.

import { useState } from 'react'
import { Box, Button, IconButton, Typography, TextField } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import type { CoverLetterJson, ContactInfo } from '@shared/types'

interface CoverLetterPaperProps {
  coverLetter: CoverLetterJson
  contact: ContactInfo
  sessionId: string
  dateGenerated?: string
  onUpdateCoverLetter?: (updates: Partial<CoverLetterJson>) => void
}

export default function CoverLetterPaper({
  coverLetter,
  contact,
  sessionId,
  dateGenerated,
  onUpdateCoverLetter
}: CoverLetterPaperProps): JSX.Element {
  const handleParagraphSave = (index: number, newText: string): void => {
    if (!onUpdateCoverLetter) return
    const newParagraphs = [...coverLetter.paragraphs]
    newParagraphs[index] = newText
    onUpdateCoverLetter({ paragraphs: newParagraphs })
  }

  const displayDate = dateGenerated
    ? new Date(dateGenerated).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
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
      <Typography sx={{ fontSize: '9.5pt', color: 'text.primary', mt: 2.5, mb: 2 }}>
        {displayDate}
      </Typography>

      {/* Salutation */}
      <Typography sx={{ fontSize: '9.5pt', color: 'text.primary', mb: 1.75 }}>
        {coverLetter.salutation}
      </Typography>

      {/* Body paragraphs */}
      {coverLetter.paragraphs.map((paragraph, i) => (
        <ParagraphItem
          key={i}
          paragraph={paragraph}
          index={i}
          sessionId={sessionId}
          onSave={(text) => handleParagraphSave(i, text)}
        />
      ))}

      {/* Sign-off */}
      <Typography sx={{ fontSize: '9.5pt', color: 'text.primary', mt: 2, mb: 3 }}>
        {coverLetter.signoff}
      </Typography>

      {/* Signature name */}
      <Typography sx={{ fontSize: '9.5pt', fontWeight: 600, color: 'text.primary' }}>
        {contact.fullName || 'Your Name'}
      </Typography>
    </Box>
  )
}

// ─── Paragraph Item ──────────────────────────────────────────────────────────

function ParagraphItem({
  paragraph,
  index,
  sessionId: _sessionId,
  onSave
}: {
  paragraph: string
  index: number
  sessionId: string
  onSave: (text: string) => void
}): JSX.Element {
  const [hovered, setHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(paragraph)

  const handleEdit = (): void => {
    setDraft(paragraph)
    setIsEditing(true)
    setHovered(false)
  }

  const handleSave = (): void => {
    onSave(draft)
    setIsEditing(false)
  }

  const handleCancel = (): void => {
    setDraft(paragraph)
    setIsEditing(false)
  }

  return (
    <Box
      onMouseEnter={() => !isEditing && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ position: 'relative', mb: 1.5 }}
    >
      {isEditing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5, mb: 2 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            variant="outlined"
            size="small"
            slotProps={{ input: { sx: { fontSize: '9.5pt', lineHeight: 1.65 } } }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel()
              // Ctrl+Enter to save
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave()
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton size="small" onClick={handleCancel}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small" onClick={handleSave} sx={{ color: 'success.main' }}>
              <CheckIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Typography
          onClick={handleEdit}
          sx={{
            fontSize: '9.5pt',
            color: 'text.primary',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            borderRadius: '3px',
            bgcolor: hovered ? 'action.hover' : 'transparent',
            transition: 'background-color 0.1s',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.selected' }
          }}
        >
          {paragraph}
        </Typography>
      )}

      {!isEditing && (
        <ParagraphHoverToolbar
          visible={hovered}
          onEdit={handleEdit}
          onRevise={() => {
            /* STUB: Phase 4 */
          }}
        />
      )}

      {/* InlineRevisionPanel — STUB: Phase 4 */}
      {/* TODO: render when reviseOpen === true */}
      {void index /* suppress unused-var until wired */}
    </Box>
  )
}

interface ParagraphHoverToolbarProps {
  visible: boolean
  onEdit: () => void
  onRevise: () => void
}

function ParagraphHoverToolbar({
  visible,
  onEdit,
  onRevise
}: ParagraphHoverToolbarProps): JSX.Element {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: -28,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
        bgcolor: 'grey.900',
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
      <IconButton
        size="small"
        aria-label="Edit paragraph"
        onClick={onEdit}
        sx={{ color: 'grey.300', p: 0.375, '&:hover': { color: '#fff' } }}
      >
        <EditIcon sx={{ fontSize: 13 }} />
      </IconButton>
      <Button
        size="small"
        startIcon={<AutoFixHighIcon sx={{ fontSize: 12 }} />}
        onClick={onRevise}
        sx={{
          color: 'grey.300',
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
      <Typography sx={{ fontSize: '22pt', fontWeight: 600, color: 'text.primary', mb: 0.625 }}>
        {contact.fullName || 'Your Name'}
      </Typography>
      <Typography
        sx={{ fontSize: '9.5pt', color: 'text.secondary', letterSpacing: '0.01em', mb: 0.25 }}
      >
        {[contact.phone, contact.email, contact.linkedin, contact.github]
          .filter(Boolean)
          .join(' · ')}
      </Typography>
      <Box sx={{ borderTop: '1px solid', borderColor: 'primary.dark', mt: 1.75 }} />
    </>
  )
}
