// Session view: the main workspace for a single job application.
// Layout: session header bar / tab bar / spending-limit warning bar /
//         (document area + side panels).
// The document area renders one of four tab views; side panels are always visible.
//
// STUB: Phase 1 — Resume tab fully rendered; layout complete.
// STUB: Phase 2 — Cover Letter, Match Report, Description tabs stubbed below;
//   auto-save not yet wired.
// STUB: Phase 4 — FeedbackPromptBar placed above Resume and Cover Letter papers;
//   SpendingWarningBanner placed below the tab bar; SpendingLimitDialog wired
//   before AI generation calls. Data fetching and actual AI calls not yet wired.
// TODO (Phase 2):
//   - Auto-save: debounce session changes and call
//     window.api.sessions.update(session.id, { resume, coverLetter, matchReport })
//     ~2s after the last edit; update status bar "Saving…" → "All changes saved"
// TODO (Phase 4):
//   - Fetch 24h spend total on mount and after each AI call:
//     window.api.spendLog.getTotal().then(t => setSpendUsd(t.totalUsd))
//   - Read spendingLimit from settingsSlice.
//   - Gate every AI call (generate:coverLetter, generate:matchReport, etc.) through
//     SpendingLimitDialog when spendUsd > spendingLimit > 0.
//   - FeedbackPromptBar onApplyChange: resolve the target in resume/coverLetter JSON,
//     push old value onto useUndoRedo stack, apply new text, dispatch updateSession.

import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import SessionHeader from '../organisms/SessionHeader'
import SessionTabs, { type SessionTab } from '../organisms/SessionTabs'
import SidePanels from '../organisms/SidePanels'
import ResumePaper from '../organisms/ResumePaper'
import CoverLetterPaper from '../organisms/CoverLetterPaper'
import MatchReportView from '../organisms/MatchReportView'
import FeedbackPromptBar from '../molecules/FeedbackPromptBar'
import SpendingWarningBanner from '../molecules/SpendingWarningBanner'
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

  // TODO (Phase 4): fetch 24h spend total on mount and after every AI call
  // const [spendUsd, setSpendUsd] = useState(0)
  // useEffect(() => {
  //   window.api.spendLog.getTotal().then(t => setSpendUsd(t.totalUsd))
  // }, [])

  const activeSessionId = useAppSelector((state) => state.sessions.activeSessionId)
  const session = useAppSelector((state) =>
    state.sessions.sessions.find((s) => s.id === activeSessionId)
  )
  const contact = useAppSelector((state) => state.settings.contactInfo)
  // TODO (Phase 4): const spendingLimit = useAppSelector(state => state.settings.spendingLimit)

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

      {/* Spending-limit warning banner — STUB: Phase 4 */}
      {/* Shown when 24h rolling spend exceeds the configured limit (limit > 0). */}
      {/* TODO: replace placeholder 0 values with spendUsd and spendingLimit state */}
      <SpendingWarningBanner spendUsd={0} limitUsd={0} />

      {/* SpendingLimitDialog — STUB: Phase 4 */}
      {/* TODO: render before every AI generation call in this page */}
      {/* <SpendingLimitDialog
            open={showSpendDialog}
            spendUsd={spendUsd}
            limitUsd={spendingLimit}
            onCancel={() => setShowSpendDialog(false)}
            onGenerateAnyway={() => { setShowSpendDialog(false); pendingGenerate?.() }}
          /> */}

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
              {/* FeedbackPromptBar — STUB: Phase 4 */}
              {/* Shown above the paper once a resume exists. */}
              {/* TODO: wire onApplyChange to resolve target in resume JSON, push undo, apply */}
              {session.resume && (
                <FeedbackPromptBar
                  sessionId={session.id}
                  documentType="resume"
                  onApplyChange={(_target, _newText) => {
                    // TODO (Phase 4): look up target in session.resume, push old text to undo
                    // stack, apply newText, dispatch updateSession
                  }}
                />
              )}
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
// STUB: Phase 4 — FeedbackPromptBar placed above the paper.
// TODO (Phase 2):
//   - call window.api.generate.coverLetter(session.id) on Generate click
//   - dispatch updateSession({ coverLetter }) on success
//   - show LinearProgress while generating; show inline error with Retry on failure
//   - gate the Generate call through SpendingLimitDialog when over limit (Phase 4)
// TODO (Phase 4):
//   - FeedbackPromptBar onApplyChange: resolve target in session.coverLetter.paragraphs,
//     push old text to undo stack, apply newText, dispatch updateSession
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
    return (
      <>
        {/* FeedbackPromptBar — STUB: Phase 4 */}
        {/* TODO: wire onApplyChange to resolve target in coverLetter.paragraphs, push undo, apply */}
        <FeedbackPromptBar
          sessionId={session.id}
          documentType="coverLetter"
          onApplyChange={(_target, _newText) => {
            // TODO (Phase 4): look up target in session.coverLetter, push old text to undo
            // stack, apply newText, dispatch updateSession
          }}
        />
        <CoverLetterPaper coverLetter={session.coverLetter} contact={contact} />
      </>
    )
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
