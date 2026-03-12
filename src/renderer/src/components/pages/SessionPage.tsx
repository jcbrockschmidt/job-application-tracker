import { useState, useEffect } from 'react'
import { Box, Button, CircularProgress, Typography, TextField } from '@mui/material'
import SessionHeader from '../organisms/SessionHeader'
import SessionTabs, { type SessionTab } from '../organisms/SessionTabs'
import SidePanels from '../organisms/SidePanels'
import ResumePaper from '../organisms/ResumePaper'
import CoverLetterPaper from '../organisms/CoverLetterPaper'
import MatchReportView from '../organisms/MatchReportView'
import FeedbackPromptBar from '../molecules/FeedbackPromptBar'
import SpendingWarningBanner from '../molecules/SpendingWarningBanner'
import { useAppSelector, useAppDispatch } from '../../hooks'
import { updateSession } from '../../store/slices/sessionsSlice'
import { setSaveState } from '../../store/slices/uiSlice'
import type { Session, ContactInfo, ResumeJson, CoverLetterJson, SpendTotal } from '@shared/types'

export default function SessionPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<SessionTab>('resume')
  const [spendTotal, setSpendTotal] = useState<SpendTotal | null>(null)
  const dispatch = useAppDispatch()

  const activeSessionId = useAppSelector((state) => state.sessions.activeSessionId)
  const session = useAppSelector((state) =>
    state.sessions.sessions.find((s) => s.id === activeSessionId)
  )
  const contact = useAppSelector((state) => state.settings.contactInfo)
  const settings = useAppSelector((state) => state.settings)

  useEffect(() => {
    window.api.spendLog.getTotal().then(setSpendTotal)
  }, [])

  const handleUpdateResume = async (updates: Partial<ResumeJson>): Promise<void> => {
    if (!session || !session.resume) return
    const newResume = { ...session.resume, ...updates }
    try {
      dispatch(setSaveState('saving'))
      const lastSaved = new Date().toISOString()
      await window.api.sessions.update(session.id, { resume: newResume, lastSaved })
      dispatch(updateSession({ id: session.id, updates: { resume: newResume, lastSaved } }))
      dispatch(setSaveState('saved'))
    } catch (err) {
      console.error('Failed to save resume:', err)
      dispatch(setSaveState('error'))
    }
  }

  const handleUpdateCoverLetter = async (updates: Partial<CoverLetterJson>): Promise<void> => {
    if (!session || !session.coverLetter) return
    const newCoverLetter = { ...session.coverLetter, ...updates }
    try {
      dispatch(setSaveState('saving'))
      const lastSaved = new Date().toISOString()
      await window.api.sessions.update(session.id, { coverLetter: newCoverLetter, lastSaved })
      dispatch(
        updateSession({ id: session.id, updates: { coverLetter: newCoverLetter, lastSaved } })
      )
      dispatch(setSaveState('saved'))
    } catch (err) {
      console.error('Failed to save cover letter:', err)
      dispatch(setSaveState('error'))
    }
  }

  const handleGenerateCoverLetter = async (): Promise<void> => {
    if (!session) return
    try {
      dispatch(updateSession({ id: session.id, updates: { isGenerating: true } }))
      const coverLetter = await window.api.generate.coverLetter(session.id)
      dispatch(updateSession({ id: session.id, updates: { coverLetter, isGenerating: false } }))
      // Refresh spend total
      const total = await window.api.spendLog.getTotal()
      setSpendTotal(total)
    } catch (err: unknown) {
      console.error('Failed to generate cover letter:', err)
      const error = err as { message?: string }
      dispatch(
        updateSession({
          id: session.id,
          updates: { isGenerating: false, generationError: error.message || 'Unknown error' }
        })
      )
    }
  }

  const handleGenerateMatchReport = async (): Promise<void> => {
    if (!session) return
    try {
      dispatch(updateSession({ id: session.id, updates: { isGenerating: true } }))
      const matchReport = await window.api.generate.matchReport(session.id)
      dispatch(updateSession({ id: session.id, updates: { matchReport, isGenerating: false } }))
      // Refresh spend total
      const total = await window.api.spendLog.getTotal()
      setSpendTotal(total)
    } catch (err: unknown) {
      console.error('Failed to generate match report:', err)
      const error = err as { message?: string }
      dispatch(
        updateSession({
          id: session.id,
          updates: { isGenerating: false, generationError: error.message || 'Unknown error' }
        })
      )
    }
  }

  if (!session) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No active session.</Typography>
      </Box>
    )
  }

  if (session.isGenerating && activeTab === 'resume' && !session.resume) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2.5
        }}
      >
        <CircularProgress size={36} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontWeight={600} sx={{ mb: 0.5 }}>
            Generating resume…
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {session.companyName} — {session.roleTitle}
          </Typography>
        </Box>
      </Box>
    )
  }

  const spendUsd = spendTotal?.totalUsd ?? 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <SessionHeader session={session} activeTab={activeTab} />
      <SessionTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        spendUsd={spendUsd}
        limitUsd={settings.spendingLimit}
      />

      {/* Spending-limit warning banner — STUB: Phase 4 */}
      <SpendingWarningBanner spendUsd={spendUsd} limitUsd={settings.spendingLimit} />

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
        <Box
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          {activeTab === 'resume' && (
            <>
              {session.resume && (
                <FeedbackPromptBar
                  sessionId={session.id}
                  documentType="resume"
                  onApplyChange={(_target, _newText) => {
                    // STUB: Phase 4
                  }}
                />
              )}
              {session.resume ? (
                <ResumePaper
                  resume={session.resume}
                  contact={contact}
                  onUpdateResume={handleUpdateResume}
                />
              ) : (
                <TabPlaceholder>Resume not yet generated.</TabPlaceholder>
              )}
            </>
          )}

          {activeTab === 'coverLetter' && (
            <CoverLetterTab
              session={session}
              contact={contact}
              dateGenerated={session.dateGenerated}
              onGenerate={handleGenerateCoverLetter}
              onUpdate={handleUpdateCoverLetter}
            />
          )}

          {activeTab === 'matchReport' && (
            <MatchReportTab session={session} onGenerate={handleGenerateMatchReport} />
          )}

          {activeTab === 'description' && <DescriptionTab session={session} />}
        </Box>

        {/* Side panels */}
        <SidePanels session={session} activeTab={activeTab} />
      </Box>
    </Box>
  )
}

// ─── Phase 2 tab stubs ────────────────────────────────────────────────────────

function CoverLetterTab({
  session,
  contact,
  dateGenerated,
  onGenerate,
  onUpdate
}: {
  session: Session
  contact: ContactInfo
  dateGenerated?: string
  onGenerate: () => Promise<void>
  onUpdate: (updates: Partial<CoverLetterJson>) => Promise<void>
}): JSX.Element {
  if (session.isGenerating && !session.coverLetter) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2.5,
          mt: 10
        }}
      >
        <CircularProgress size={36} />
        <Typography fontWeight={600}>Generating cover letter…</Typography>
      </Box>
    )
  }

  if (session.coverLetter) {
    return (
      <>
        <FeedbackPromptBar
          sessionId={session.id}
          documentType="coverLetter"
          onApplyChange={(_target, _newText) => {
            // STUB: Phase 4
          }}
        />
        <CoverLetterPaper
          coverLetter={session.coverLetter}
          contact={contact}
          sessionId={session.id}
          dateGenerated={dateGenerated}
          onUpdateCoverLetter={onUpdate}
        />
      </>
    )
  }

  return (
    <TabEmptyState
      message="No cover letter yet."
      action={
        <Button variant="contained" disableElevation size="small" onClick={onGenerate}>
          Generate Cover Letter
        </Button>
      }
    />
  )
}

function MatchReportTab({
  session,
  onGenerate
}: {
  session: Session
  onGenerate: () => Promise<void>
}): JSX.Element {
  if (session.isGenerating && !session.matchReport) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2.5,
          mt: 10
        }}
      >
        <CircularProgress size={36} />
        <Typography fontWeight={600}>Evaluating alignment…</Typography>
      </Box>
    )
  }

  if (session.matchReport) {
    return <MatchReportView report={session.matchReport} sessionId={session.id} />
  }

  return (
    <TabEmptyState
      message="No match report yet."
      action={
        <Button variant="contained" disableElevation size="small" onClick={onGenerate}>
          Generate Match Report
        </Button>
      }
    />
  )
}

function DescriptionTab({ session }: { session: Session }): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(session.jobDescription)
  const dispatch = useAppDispatch()

  const handleSave = async (): Promise<void> => {
    try {
      dispatch(setSaveState('saving'))
      const lastSaved = new Date().toISOString()
      await window.api.sessions.update(session.id, { jobDescription: draft, lastSaved })
      dispatch(updateSession({ id: session.id, updates: { jobDescription: draft, lastSaved } }))
      dispatch(setSaveState('saved'))
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save JD:', err)
      dispatch(setSaveState('error'))
    }
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        width: 720,
        minWidth: 720,
        px: 6,
        py: 5,
        boxShadow: '0 2px 12px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)',
        borderRadius: '2px'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
        <Typography fontWeight={700} sx={{ fontSize: 13, flex: 1, color: 'text.primary' }}>
          Job Description
        </Typography>
        {!isEditing && (
          <Button
            size="small"
            variant="outlined"
            sx={{ fontSize: 12 }}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </Box>

      {isEditing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            multiline
            fullWidth
            minRows={10}
            maxRows={30}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            variant="outlined"
            size="small"
            slotProps={{ input: { sx: { fontSize: '10pt', lineHeight: 1.6 } } }}
          />
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontStyle: 'italic' }}>
            Note: Editing the job description does not automatically regenerate documents.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              disabled={draft === session.jobDescription}
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography
          sx={{ fontSize: '9.5pt', color: 'text.primary', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
        >
          {session.jobDescription || '—'}
        </Typography>
      )}
    </Box>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function TabPlaceholder({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
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
        bgcolor: 'background.paper',
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
