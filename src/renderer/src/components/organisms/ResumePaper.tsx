// Renders a ResumeJson as the fixed single-column resume template.
// Matches the visual design in docs/resume-template-preview.html and docs/mockup.html.
//
// STUB: Phase 1 — section structure and styling are scaffolded; hover toolbars
// and inline editing are not yet implemented.
// TODO:
//   - Render each ExperienceEntry with title, company, dates, and bullet list
//   - Render EducationEntry rows
//   - Render SkillCategory rows
//   - Bullet hover: show dark popup toolbar with Edit and "Revise with AI" buttons
//   - Entry hover: show floating "Revise with AI" button at top-right (Phase 4)
//   - Section hover: show "Revise section with AI" chip on Experience and Skills (Phase 4)
//   - Inline bullet editing: turn bullet into a text input on Edit click (Phase 1)

import { Box, Typography } from '@mui/material'
import type { ResumeJson, ContactInfo } from '@shared/types'

interface ResumePaperProps {
  resume: ResumeJson
  contact: ContactInfo
}

export default function ResumePaper({ resume, contact }: ResumePaperProps): JSX.Element {
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
      {/* Header */}
      <ResumeHeader contact={contact} />

      {/* Experience */}
      {resume.experience.length > 0 && (
        <ResumeSection title="Experience">
          {resume.experience.map((entry, i) => (
            <Box key={i} sx={{ mb: 1.625, position: 'relative' }}>
              {/* TODO: hover to show floating "Revise with AI" entry button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={{ fontSize: '10.5pt', fontWeight: 600, color: '#111827' }}>
                  {entry.title} · {entry.company}
                </Typography>
                <Typography sx={{ fontSize: '9.5pt', color: '#6b7280', ml: 1.5, flexShrink: 0 }}>
                  {entry.startDate} – {entry.endDate}
                </Typography>
              </Box>
              <Box component="ul" sx={{ listStyle: 'none', mt: 0.5, pl: 1.75, mb: 0 }}>
                {entry.bullets.map((bullet, j) => (
                  // TODO: hover to show dark popup toolbar (Edit + Revise with AI)
                  // TODO: click Edit to turn bullet into in-place input
                  <Box
                    key={j}
                    component="li"
                    sx={{
                      fontSize: '9.5pt',
                      color: '#374151',
                      lineHeight: 1.5,
                      mb: 0.25,
                      position: 'relative',
                      borderRadius: '3px',
                      '&::before': { content: '"•"', position: 'absolute', left: -14, color: '#374151' },
                      '&:hover': { bgcolor: '#f5f7fa' }
                    }}
                  >
                    {bullet}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </ResumeSection>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <ResumeSection title="Education">
          {resume.education.map((entry, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '10.5pt' }}>
              <Typography sx={{ fontSize: '10.5pt', fontWeight: 600, color: '#111827' }}>
                {entry.degree} · {entry.institution}
              </Typography>
              <Typography sx={{ fontSize: '9.5pt', color: '#6b7280', ml: 1.5, flexShrink: 0 }}>
                {entry.graduationDate}
              </Typography>
            </Box>
          ))}
        </ResumeSection>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        // TODO: hover section heading to show "Revise section with AI" chip (Phase 4)
        <ResumeSection title="Skills">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.375 }}>
            {resume.skills.map((cat, i) => (
              // TODO: hover row to show dark popup toolbar (Edit + Revise with AI)
              <Typography key={i} sx={{ fontSize: '9.5pt', color: '#374151', lineHeight: 1.5 }}>
                <Box component="span" sx={{ fontWeight: 600, color: '#111827' }}>
                  {cat.category}:
                </Box>{' '}
                {cat.items.join(', ')}
              </Typography>
            ))}
          </Box>
        </ResumeSection>
      )}
    </Box>
  )
}

// ─── Internal sub-components ─────────────────────────────────────────────────

function ResumeHeader({ contact }: { contact: ContactInfo }): JSX.Element {
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

interface ResumeSectionProps {
  title: string
  children: React.ReactNode
}

function ResumeSection({ title, children }: ResumeSectionProps): JSX.Element {
  return (
    <Box sx={{ mt: 2 }}>
      {/* TODO: hover to show "Revise section with AI" chip for Experience and Skills (Phase 4) */}
      <Box
        sx={{
          fontSize: '10.5pt',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#1e3a5f',
          bgcolor: '#e8edf5',
          px: 0.75,
          py: 0.375,
          mb: 1.25
        }}
      >
        {title}
      </Box>
      {children}
    </Box>
  )
}
