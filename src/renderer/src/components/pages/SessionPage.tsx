// Session view: the main workspace for a single job application.
// Layout: session header bar / tab bar / (document area + side panels).
// The document area renders one of four tab views; side panels are always visible.
//
// STUB: Phase 1 — Resume tab fully rendered; layout complete.
// STUB: Phase 2 — Cover Letter, Match Report, Description tabs stubbed below;
//   auto-save and spending-limit warning bar not yet wired.
// TODO:
//   - Auto-save (Phase 2): debounce session changes and call
//     window.api.sessions.update(session.id, { resume, coverLetter, matchReport })
//     ~2s after the last edit; update status bar text "Saving…" → "All changes saved"
//   - Spending-limit amber warning bar below the tab bar (Phase 3)
//   - FeedbackPromptBar above resume and cover letter papers (Phase 4)

import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import SessionHeader from '../organisms/SessionHeader'
import SessionTabs, { type SessionTab } from '../organisms/SessionTabs'
import SidePanels from '../organisms/SidePanels'
import ResumePaper from '../organisms/ResumePaper'
import CoverLetterPaper from '../organisms/CoverLetterPaper'
import MatchReportView from '../organisms/MatchReportView'
import { useAppSelector } from '../../hooks'
import type { Session, ContactInfo } from '@shared/types'

export default function SessionPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<SessionTab>('resume')

  // TODO (Phase 2 auto-save): debounce changes and call sessions:update
  // const dispatch = useAppDispatch()
  // useEffect(() => {
  //   if (!session) return
  //   const timer = setTimeout(async () => {
  //     await window.api.sessions.update(session.id, {
  //       resume: session.resume ?? undefined,
  //       coverLetter: session.coverLetter ?? undefined,
  //       matchReport: session.matchReport ?? undefined,
  //     })
  //     dispatch(setLastSaved(new Date().toISOString()))
  //   }, 2000)
  //   return () => clearTimeout(timer)
  // }, [session?.resume, session?.coverLetter, session?.matchReport])

  const activeSessionId = useAppSelector((state) => state.sessions.activeSessionId)
  const session = useAppSelector((state) =>
    state.sessions.sessions.find((s) => s.id === activeSessionId)
  )
  const contact = useAppSelector((state) => state.settings.contactInfo)

  if (!session) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No active session.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <SessionHeader session={session} />
      <SessionTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* TODO: amber spending-limit warning bar here (Phase 3) */}

      {/* Document area + side panels */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          gap: 3,
          p: 4,
          pb: 5,
          alignItems: 'flex-start',
          overflowY: 'auto'
        }}
      >
        {/* Document area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {activeTab === 'resume' && (
            <>
              {/* TODO: FeedbackPromptBar above the paper (Phase 4) */}
              {session.resume ? (
                <ResumePaper resume={session.resume} contact={contact} />
              ) : (
                <TabPlaceholder>Resume not yet generated.</TabPlaceholder>
              )}
            </>
          )}

          {activeTab === 'coverLetter' && (
            // STUB: Phase 2 — empty state or paper; feedback bar above (Phase 4)
            <CoverLetterTab session={session} contact={contact} />
          )}

          {activeTab === 'matchReport' && (
            // STUB: Phase 2 — empty state or report view
            <MatchReportTab session={session} />
          )}

          {activeTab === 'description' && (
            // STUB: Phase 2 — JD display with inline edit
            <DescriptionTab session={session} />
          )}
        </Box>

        {/* Side panels */}
        <SidePanels session={session} />
      </Box>
    </Box>
  )
}

// ─── Phase 2 tab stubs ────────────────────────────────────────────────────────

// STUB: Phase 2 — shows Generate button in empty state; renders CoverLetterPaper once generated.
// TODO:
//   - call window.api.generate.coverLetter(session.id) on Generate click
//   - dispatch updateSession({ coverLetter }) on success
//   - show LinearProgress while generating; show inline error with Retry on failure
//   - FeedbackPromptBar above the paper (Phase 4)
function CoverLetterTab({
  session,
  contact
}: {
  session: Session
  contact: ContactInfo
}): JSX.Element {
  // TODO: const [isGenerating, setIsGenerating] = useState(false)
  // TODO: const [error, setError] = useState<string | null>(null)
  // TODO: const dispatch = useAppDispatch()

  if (session.coverLetter) {
    return <CoverLetterPaper coverLetter={session.coverLetter} contact={contact} />
  }

  return (
    <TabEmptyState
      message="No cover letter yet."
      // TODO: disabled={isGenerating}, onClick={handleGenerate}
      action={
        <Button variant="contained" disableElevation size="small">
          Generate Cover Letter
        </Button>
      }
    />
  )
}

// STUB: Phase 2 — shows Generate button in empty state; renders MatchReportView once generated.
// TODO:
//   - call window.api.generate.matchReport(session.id) on Generate click
//   - dispatch updateSession({ matchReport }) on success
//   - show LinearProgress while generating; show inline error with Retry on failure
function MatchReportTab({ session }: { session: Session }): JSX.Element {
  // TODO: const [isGenerating, setIsGenerating] = useState(false)
  // TODO: const [error, setError] = useState<string | null>(null)

  if (session.matchReport) {
    return <MatchReportView report={session.matchReport} sessionId={session.id} />
  }

  return (
    <TabEmptyState
      message="No match report yet."
      // TODO: disabled={isGenerating}, onClick={handleGenerate}
      action={
        <Button variant="contained" disableElevation size="small">
          Generate Match Report
        </Button>
      }
    />
  )
}

// STUB: Phase 2 — shows JD text; Edit button not yet wired.
// TODO:
//   - clicking Edit shows a resizable textarea (replace Typography with TextField multiline)
//   - Save calls window.api.sessions.update(session.id, { jobDescription: draft })
//     then dispatches updateSession; Cancel restores original text
//   - show note below editor: "Editing the job description does not automatically
//     regenerate documents."
function DescriptionTab({ session }: { session: Session }): JSX.Element {
  // TODO: const [isEditing, setIsEditing] = useState(false)
  // TODO: const [draft, setDraft] = useState(session.jobDescription)

  return (
    <Box
      sx={{
        bgcolor: 'white',
        width: 720,
        minWidth: 720,
        px: 6,
        py: 5,
        boxShadow: '0 2px 12px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)',
        borderRadius: '2px'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
        <Typography fontWeight={700} sx={{ fontSize: 13, flex: 1, color: '#111827' }}>
          Job Description
        </Typography>
        {/* TODO: onClick={() => setIsEditing(true)} */}
        <Button size="small" variant="outlined" sx={{ fontSize: 12 }}>
          Edit
        </Button>
      </Box>

      {/* TODO: when isEditing, render TextField multiline + Save / Cancel + note */}
      <Typography
        sx={{ fontSize: '9.5pt', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
      >
        {session.jobDescription || '—'}
      </Typography>
    </Box>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function TabPlaceholder({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        width: 720,
        minWidth: 720,
        p: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
        borderRadius: '2px',
        textAlign: 'center'
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
        {children}
      </Typography>
    </Box>
  )
}

function TabEmptyState({
  message,
  action
}: {
  message: string
  action?: React.ReactNode
}): JSX.Element {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        width: 720,
        minWidth: 720,
        p: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2.5
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
        {message}
      </Typography>
      {action}
    </Box>
  )
}
