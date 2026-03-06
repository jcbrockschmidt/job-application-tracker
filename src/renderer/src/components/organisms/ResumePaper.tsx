// Renders a ResumeJson as the fixed single-column resume template.
// Matches the visual design in docs/resume-template-preview.html and docs/mockup.html.

import { useState } from 'react'
import { Box, Button, IconButton, Typography, TextField } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import type { ResumeJson, ContactInfo } from '@shared/types'

interface ResumePaperProps {
  resume: ResumeJson
  contact: ContactInfo
  onUpdateResume?: (updates: Partial<ResumeJson>) => void
}

export default function ResumePaper({
  resume,
  contact,
  onUpdateResume
}: ResumePaperProps): JSX.Element {
  const handleBulletSave = (
    section: 'experience' | 'skills',
    index: number,
    bulletIndex: number,
    newText: string
  ): void => {
    if (!onUpdateResume) return

    if (section === 'experience') {
      const newExperience = [...resume.experience]
      const entry = { ...newExperience[index] }
      entry.bullets = [...entry.bullets]
      entry.bullets[bulletIndex] = newText
      newExperience[index] = entry
      onUpdateResume({ experience: newExperience })
    }
    // ... skills editing stubbed
  }

  const handleHeaderSave = (
    index: number,
    updates: Partial<ResumeJson['experience'][number]>
  ): void => {
    if (!onUpdateResume) return
    const newExperience = [...resume.experience]
    newExperience[index] = { ...newExperience[index], ...updates }
    onUpdateResume({ experience: newExperience })
  }

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
      {/* Header */}
      <ResumeHeader contact={contact} />

      {/* Experience */}
      {resume.experience.length > 0 && (
        <ResumeSection title="Experience" sectionScope="experience">
          {resume.experience.map((entry, i) => (
            <ExperienceEntry
              key={i}
              entry={entry}
              onBulletSave={(bulletIdx, text) => handleBulletSave('experience', i, bulletIdx, text)}
              onHeaderSave={(updates) => handleHeaderSave(i, updates)}
            />
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
              <Typography sx={{ fontSize: '10.5pt', fontWeight: 600, color: 'text.primary' }}>
                {entry.degree} · {entry.institution}
              </Typography>
              <Typography
                sx={{ fontSize: '9.5pt', color: 'text.secondary', ml: 1.5, flexShrink: 0 }}
              >
                {entry.graduationDate}
              </Typography>
            </Box>
          ))}
        </ResumeSection>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <ResumeSection title="Skills" sectionScope="skills">
          <Box
            component="ul"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.375,
              listStyle: 'none',
              p: 0,
              m: 0
            }}
          >
            {resume.skills.map((cat, i) => (
              <BulletItem
                key={i}
                noBullet
                bullet={`${cat.category}: ${cat.items.join(', ')}`}
                onSave={() => {
                  /* TODO: Skills editing */
                }}
              >
                <Box
                  component="span"
                  sx={{ fontSize: '10.5pt', fontWeight: 600, color: 'text.primary' }}
                >
                  {cat.category} :
                </Box>{' '}
                {cat.items.join(', ')}
              </BulletItem>
            ))}
          </Box>
        </ResumeSection>
      )}
    </Box>
  )
}

// ─── Experience Entry ──────────────────────────────────────────────────────────

function ExperienceEntry({
  entry,
  onBulletSave,
  onHeaderSave
}: {
  entry: ResumeJson['experience'][number]
  onBulletSave: (bulletIdx: number, text: string) => void
  onHeaderSave: (updates: Partial<ResumeJson['experience'][number]>) => void
}): JSX.Element {
  const [entryHovered, setEntryHovered] = useState(false)
  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [titleDraft, setTitleDraft] = useState(entry.title)
  const [companyDraft, setCompanyDraft] = useState(entry.company)

  const handleHeaderSave = (): void => {
    onHeaderSave({ title: titleDraft, company: companyDraft })
    setIsEditingHeader(false)
  }

  const handleHeaderCancel = (): void => {
    setTitleDraft(entry.title)
    setCompanyDraft(entry.company)
    setIsEditingHeader(false)
  }

  return (
    <Box
      onMouseEnter={() => setEntryHovered(true)}
      onMouseLeave={() => setEntryHovered(false)}
      sx={{
        mb: 1.625,
        position: 'relative',
        borderRadius: '4px',
        bgcolor: entryHovered ? 'action.hover' : 'transparent',
        transition: 'background-color 0.1s',
        mx: -1.5,
        px: 1.5,
        py: 1,
        mt: -1
      }}
    >
      <EntryReviseChip entryLabel={`${entry.title} · ${entry.company}`} visible={entryHovered} />

      {isEditingHeader ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              label="Title"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleHeaderSave()
                if (e.key === 'Escape') handleHeaderCancel()
              }}
              slotProps={{ input: { sx: { fontSize: '10.5pt', fontWeight: 700 } } }}
              sx={{ flex: 2 }}
            />
            <TextField
              size="small"
              label="Company"
              value={companyDraft}
              onChange={(e) => setCompanyDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleHeaderSave()
                if (e.key === 'Escape') handleHeaderCancel()
              }}
              slotProps={{ input: { sx: { fontSize: '10.5pt', fontWeight: 700 } } }}
              sx={{ flex: 3 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton size="small" onClick={handleHeaderCancel}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small" onClick={handleHeaderSave} sx={{ color: 'success.main' }}>
              <CheckIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={() => setIsEditingHeader(true)}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            cursor: 'pointer',
            borderRadius: '2px',
            '&:hover': { bgcolor: 'action.selected' }
          }}
        >
          <Typography sx={{ fontSize: '10.5pt', fontWeight: 600, color: 'text.primary' }}>
            {entry.title} · {entry.company}
          </Typography>
          <Typography sx={{ fontSize: '9.5pt', color: 'text.secondary', ml: 1.5, flexShrink: 0 }}>
            {entry.startDate} – {entry.endDate}
          </Typography>
        </Box>
      )}

      <Box component="ul" sx={{ listStyle: 'none', mt: 0.5, pl: 1.75, mb: 0 }}>
        {entry.bullets.map((bullet, j) => (
          <BulletItem key={j} bullet={bullet} onSave={(text) => onBulletSave(j, text)} />
        ))}
      </Box>
    </Box>
  )
}

// ─── Bullet Item ─────────────────────────────────────────────────────────────

function BulletItem({
  bullet,
  onSave,
  noBullet = false,
  children
}: {
  bullet: string
  onSave: (text: string) => void
  noBullet?: boolean
  children?: React.ReactNode
}): JSX.Element {
  const [hovered, setHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(bullet)

  const handleEdit = (): void => {
    setDraft(bullet)
    setIsEditing(true)
    setHovered(false)
  }

  const handleSave = (): void => {
    onSave(draft)
    setIsEditing(false)
  }

  const handleCancel = (): void => {
    setDraft(bullet)
    setIsEditing(false)
  }

  return (
    <Box
      component="li"
      onMouseEnter={() => !isEditing && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        fontSize: '9.5pt',
        color: 'text.primary',
        lineHeight: 1.5,
        mb: 0.25,
        position: 'relative',
        borderRadius: '3px',
        '&::before': {
          content: isEditing || noBullet ? 'none' : '"•"',
          position: 'absolute',
          left: -14,
          color: 'text.primary'
        },
        bgcolor: hovered ? 'action.hover' : 'transparent',
        transition: 'background-color 0.1s'
      }}
    >
      {isEditing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5, mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
            slotProps={{ input: { sx: { fontSize: '9.5pt', py: 0.5 } } }}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton size="small" onClick={handleCancel} sx={{ p: 0.25 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small" onClick={handleSave} sx={{ p: 0.25, color: 'success.main' }}>
              <CheckIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={handleEdit}
          sx={{
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.selected' },
            borderRadius: '2px'
          }}
        >
          {children || bullet}
          <BulletHoverToolbar visible={hovered} onEdit={handleEdit} />
        </Box>
      )}
    </Box>
  )
}

function BulletHoverToolbar({
  visible,
  onEdit
}: {
  visible: boolean
  onEdit: () => void
}): JSX.Element {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: -28,
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
        aria-label="Edit bullet"
        onClick={onEdit}
        sx={{ color: 'grey.300', p: 0.375, '&:hover': { color: '#fff' } }}
      >
        <EditIcon sx={{ fontSize: 13 }} />
      </IconButton>
      <Button
        size="small"
        startIcon={<AutoFixHighIcon sx={{ fontSize: 12 }} />}
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

function EntryReviseChip({
  entryLabel,
  visible
}: {
  entryLabel: string
  visible: boolean
}): JSX.Element {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 5,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.12s',
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <Button
        size="small"
        startIcon={<AutoFixHighIcon sx={{ fontSize: 12 }} />}
        aria-label={`Revise ${entryLabel} with AI`}
        sx={{
          bgcolor: 'grey.900',
          color: 'grey.300',
          fontSize: 11,
          px: 1,
          py: 0.25,
          borderRadius: 1,
          textTransform: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          '&:hover': { bgcolor: '#000', color: '#fff' }
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

interface ResumeSectionProps {
  title: string
  sectionScope?: string
  children: React.ReactNode
}

function ResumeSection({ title, sectionScope, children }: ResumeSectionProps): JSX.Element {
  const [headingHovered, setHeadingHovered] = useState(false)

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        onMouseEnter={() => setHeadingHovered(true)}
        onMouseLeave={() => setHeadingHovered(false)}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          mb: 1.25,
          minHeight: 32 // Ensure container is tall enough for the absolute chip
        }}
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

        {sectionScope && <SectionReviseChip visible={headingHovered} sectionScope={sectionScope} />}
      </Box>

      {children}
    </Box>
  )
}

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
      <Button
        size="small"
        startIcon={<AutoFixHighIcon sx={{ fontSize: 12 }} />}
        aria-label={`Revise ${sectionScope} section with AI`}
        sx={{
          bgcolor: 'grey.900',
          color: 'grey.300',
          fontSize: 11,
          px: 1,
          py: 0.25,
          borderRadius: 1,
          textTransform: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          '&:hover': { bgcolor: '#000', color: '#fff' }
        }}
      >
        Revise section with AI
      </Button>
    </Box>
  )
}
