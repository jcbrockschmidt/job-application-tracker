// Renders a CoverLetterJson as the fixed cover letter template.
// Same header / hairline rule as ResumePaper, then date, salutation,
// body paragraphs, and sign-off.
//
// STUB: Phase 2 — layout complete; interactive features not yet implemented.
// TODO:
//   - Per-paragraph hover toolbar: dark popup below the paragraph with Edit +
//     "Revise with AI" buttons; same dark chip style as in ResumePaper
//   - Inline paragraph editing: clicking Edit turns the paragraph into an
//     auto-growing textarea (field-sizing: content or MUI multiline); Save / Cancel

import { Box, Typography } from '@mui/material'
import type { CoverLetterJson, ContactInfo } from '@shared/types'

interface CoverLetterPaperProps {
  coverLetter: CoverLetterJson
  contact: ContactInfo
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
      {coverLetter.paragraphs.map((paragraph, i) => (
        // TODO: hover to show dark popup toolbar below (Edit + "Revise with AI")
        // TODO: clicking Edit turns paragraph into auto-growing textarea; Save / Cancel
        <Box key={i} sx={{ position: 'relative', mb: 1.5 }}>
          <Typography
            sx={{
              fontSize: '9.5pt',
              color: '#374151',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
              borderRadius: '3px',
              '&:hover': { bgcolor: '#f5f7fa' }
            }}
          >
            {paragraph}
          </Typography>
        </Box>
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
