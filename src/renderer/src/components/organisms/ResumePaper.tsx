// Renders a ResumeJson as the fixed single-column resume template.
// Matches the visual design in docs/resume-template-preview.html and docs/mockup.html.
//
// STUB: Phase 1 — section structure and styling are scaffolded; hover toolbars
// and inline editing are not yet implemented.
// STUB: Phase 4 — hover toolbar shapes (BulletHoverToolbar, EntryReviseChip,
// SectionReviseChip) rendered; InlineRevisionPanel expansion not yet wired.
// TODO (Phase 1):
//   - Inline bullet editing: clicking Edit in BulletHoverToolbar turns the bullet
//     into an in-place text input; Save commits (push to undo stack); Escape cancels.
// TODO (Phase 4):
//   - Pass sessionId as a prop so hover toolbar components can open InlineRevisionPanel
//     with the right session context and call generate:revise.
//   - BulletHoverToolbar "Revise with AI": expand InlineRevisionPanel beneath the bullet.
//     Use bullet index as scope until a stable per-bullet ID is added to ResumeJson.
//   - EntryReviseChip: expand InlineRevisionPanel beneath the entry
//     (scope = entry index or company+title key).
//   - SectionReviseChip: expand InlineRevisionPanel beneath the section heading
//     (scope = 'experience' | 'skills').
//   - Gate all generate:revise calls through SpendingLimitDialog when over limit.
//   - Push old text onto the undo stack (useUndoRedo) before applying accepted revisions.

import { useState } from 'react'
import { Box, Button, IconButton, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import type { ResumeJson, ContactInfo } from '@shared/types'

interface ResumePaperProps {
  resume: ResumeJson
  contact: ContactInfo
  // TODO (Phase 4): add sessionId: string so hover toolbars can call generate:revise
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
        // STUB: Phase 4 — SectionReviseChip shown on heading hover (see ResumeSection)
        <ResumeSection title="Experience" sectionScope="experience">
          {resume.experience.map((entry, i) => (
            <Box key={i} sx={{ mb: 1.625, position: 'relative' }}>
              {/* STUB: Phase 4 — EntryReviseChip floats over the top-right corner on entry hover */}
              <EntryReviseChip entryLabel={`${entry.title} · ${entry.company}`} />

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
              >
                <Typography sx={{ fontSize: '10.5pt', fontWeight: 600, color: '#111827' }}>
                  {entry.title} · {entry.company}
                </Typography>
                <Typography sx={{ fontSize: '9.5pt', color: '#6b7280', ml: 1.5, flexShrink: 0 }}>
                  {entry.startDate} – {entry.endDate}
                </Typography>
              </Box>
              <Box component="ul" sx={{ listStyle: 'none', mt: 0.5, pl: 1.75, mb: 0 }}>
                {entry.bullets.map((bullet, j) => (
                  // STUB: Phase 4 — BulletHoverToolbar shown on bullet hover
                  <BulletItem key={j} bullet={bullet} />
                ))}
              </Box>

              {/* InlineRevisionPanel for entry-level revisions — STUB: Phase 4 */}
              {/* TODO: render when entryReviseOpen === i */}
              {/* <InlineRevisionPanel
                    scope={`entry:${i}`}
                    currentText={entry.bullets.join('\n')}
                    onAccept={(newText) => { ... apply parsed newText to resume.experience[i] ... }}
                    onClose={() => setEntryReviseOpen(null)}
                  /> */}
            </Box>
          ))}
        </ResumeSection>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <ResumeSection title="Education">
          {resume.education.map((entry, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontSize: '10.5pt'
              }}
            >
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
        // STUB: Phase 4 — SectionReviseChip shown on heading hover (see ResumeSection)
        <ResumeSection title="Skills" sectionScope="skills">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.375 }}>
            {resume.skills.map((cat, i) => (
              // STUB: Phase 4 — BulletHoverToolbar shown on hover for each skill row
              <BulletItem key={i} bullet={`${cat.category}: ${cat.items.join(', ')}`} />
            ))}
          </Box>
        </ResumeSection>
      )}
    </Box>
  )
}

// ─── Phase 4 stub: Bullet Item ────────────────────────────────────────────────

// Renders a single bullet (or skill row) with a dark popup hover toolbar.
//
// STUB: Phase 4 — hover state wired; toolbar buttons are not yet connected to
// InlineRevisionPanel or the inline edit TextField.
// TODO (Phase 1):
//   - Edit button: replace the bullet Typography with a controlled TextField (single line);
//     on Save, push old text to undo stack then call a parent-supplied onBulletSave callback;
//     on Escape / Cancel, restore the original text.
// TODO (Phase 4):
//   - "Revise with AI" button: set reviseOpen = true to expand InlineRevisionPanel
//     beneath this bullet. Needs sessionId threaded from ResumePaperProps.
//   - InlineRevisionPanel onAccept: push old text to undo stack, call onBulletSave, close.

function BulletItem({ bullet }: { bullet: string }): JSX.Element {
  const [hovered, setHovered] = useState(false)
  // TODO: const [isEditing, setIsEditing] = useState(false)
  // TODO: const [draft, setDraft] = useState(bullet)
  // TODO: const [reviseOpen, setReviseOpen] = useState(false)

  return (
    <Box
      component="li"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        fontSize: '9.5pt',
        color: '#374151',
        lineHeight: 1.5,
        mb: 0.25,
        position: 'relative',
        borderRadius: '3px',
        '&::before': { content: '"•"', position: 'absolute', left: -14, color: '#374151' },
        bgcolor: hovered ? '#f5f7fa' : 'transparent',
        transition: 'background-color 0.1s'
      }}
    >
      {/* TODO (Phase 1): when isEditing, render TextField instead */}
      {bullet}

      {/* Dark popup toolbar — STUB: Phase 4 */}
      <BulletHoverToolbar visible={hovered} />

      {/* InlineRevisionPanel — STUB: Phase 4 */}
      {/* TODO: render when reviseOpen === true */}
      {/* <InlineRevisionPanel
            scope={`bullet:${index}`}
            currentText={bullet}
            onAccept={(newText) => { onBulletSave(index, newText); setReviseOpen(false) }}
            onClose={() => setReviseOpen(false)}
          /> */}
    </Box>
  )
}

// Dark popup toolbar shown above a bullet on hover.
// Contains an Edit icon button and a "Revise with AI" button.
//
// STUB: Phase 4 — rendered; buttons have no onClick handlers yet.
// TODO: accept onEdit and onRevise callbacks from BulletItem and wire them.

function BulletHoverToolbar({ visible }: { visible: boolean }): JSX.Element {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: -28,
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

// ─── Phase 4 stub: Entry Revise Chip ─────────────────────────────────────────

// Floating "Revise with AI" chip shown over the top-right corner of an experience
// entry on hover. Does not displace the date line.
//
// STUB: Phase 4 — chip rendered; click not yet wired to InlineRevisionPanel.
// TODO: accept an onRevise callback from the parent and call it on click.

function EntryReviseChip({ entryLabel }: { entryLabel: string }): JSX.Element {
  const [hovered, setHovered] = useState(false)

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 5,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.12s',
        pointerEvents: hovered ? 'auto' : 'none'
      }}
    >
      {/* TODO: onClick → set entryReviseOpen for this entry in the parent */}
      <Button
        size="small"
        startIcon={<AutoFixHighIcon sx={{ fontSize: 12 }} />}
        aria-label={`Revise ${entryLabel} with AI`}
        sx={{
          bgcolor: '#1e293b',
          color: '#e2e8f0',
          fontSize: 11,
          px: 1,
          py: 0.25,
          borderRadius: 1,
          textTransform: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          '&:hover': { bgcolor: '#0f172a', color: '#fff' }
        }}
      >
        Revise with AI
      </Button>
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
  // When provided, a "Revise section with AI" chip is shown on heading hover.
  // Only Experience and Skills pass this; Education does not.
  // TODO (Phase 4): wire SectionReviseChip click to InlineRevisionPanel with this scope.
  sectionScope?: string
  children: React.ReactNode
}

function ResumeSection({ title, sectionScope, children }: ResumeSectionProps): JSX.Element {
  const [headingHovered, setHeadingHovered] = useState(false)

  return (
    <Box sx={{ mt: 2 }}>
      {/* Section heading row — shows SectionReviseChip on hover for Experience and Skills */}
      <Box
        onMouseEnter={() => setHeadingHovered(true)}
        onMouseLeave={() => setHeadingHovered(false)}
        sx={{ position: 'relative', display: 'flex', alignItems: 'center', mb: 1.25 }}
      >
        <Box
          sx={{
            flex: 1,
            fontSize: '10.5pt',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#1e3a5f',
            bgcolor: '#e8edf5',
            px: 0.75,
            py: 0.375
          }}
        >
          {title}
        </Box>

        {/* "Revise section with AI" chip — STUB: Phase 4 */}
        {/* TODO: onClick → open InlineRevisionPanel with scope={sectionScope} */}
        {sectionScope && <SectionReviseChip visible={headingHovered} sectionScope={sectionScope} />}
      </Box>

      {/* InlineRevisionPanel for section-level revisions — STUB: Phase 4 */}
      {/* TODO: render when sectionReviseOpen === sectionScope */}
      {/* <InlineRevisionPanel
            scope={sectionScope}
            currentText={[all bullets in section joined as a string]}
            onAccept={(newText) => { ... parse and apply to resume section ... }}
            onClose={() => setSectionReviseOpen(null)}
          /> */}

      {children}
    </Box>
  )
}

// "Revise section with AI" chip shown on Experience and Skills heading hover.
//
// STUB: Phase 4 — chip rendered; click not yet wired.
// TODO: accept an onRevise callback and call it on click.

function SectionReviseChip({
  visible,
  sectionScope
}: {
  visible: boolean
  sectionScope: string
}): JSX.Element {
  return (
    <Box
      sx={{
        position: 'absolute',
        right: 0,
        top: 0,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.12s',
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      {/* TODO: onClick → open InlineRevisionPanel for this section */}
      <Button
        size="small"
        startIcon={<AutoFixHighIcon sx={{ fontSize: 12 }} />}
        aria-label={`Revise ${sectionScope} section with AI`}
        sx={{
          bgcolor: '#1e293b',
          color: '#e2e8f0',
          fontSize: 11,
          px: 1,
          py: 0.25,
          borderRadius: 1,
          textTransform: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          '&:hover': { bgcolor: '#0f172a', color: '#fff' }
        }}
      >
        Revise section with AI
      </Button>
    </Box>
  )
}
