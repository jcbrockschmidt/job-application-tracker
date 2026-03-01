// Session view: the main workspace for a single job application.
// Layout: session header bar / tab bar / (document area + side panels).
// The document area renders one of four tab views; side panels are always visible.
//
// STUB: Phase 1 — layout is complete; tab content panels are placeholders.
// TODO:
//   - Resume tab: render ResumePaper + feedback prompt bar above it
//   - Cover Letter tab: empty state with Generate button, or CoverLetterPaper (Phase 2)
//   - Match Report tab: empty state with Generate button, or MatchReport view (Phase 2)
//   - Description tab: full-width JD text with inline edit (Phase 2)
//   - Wire spending-limit amber warning bar below tab bar (Phase 3)

import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import SessionHeader from '../organisms/SessionHeader'
import SessionTabs, { type SessionTab } from '../organisms/SessionTabs'
import SidePanels from '../organisms/SidePanels'
import ResumePaper from '../organisms/ResumePaper'
import { useAppSelector } from '../../hooks'

export default function SessionPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<SessionTab>('resume')

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
            // TODO: Phase 2 — empty state with Generate button, or CoverLetterPaper
            <TabPlaceholder>Cover Letter — not yet implemented (Phase 2)</TabPlaceholder>
          )}

          {activeTab === 'matchReport' && (
            // TODO: Phase 2 — empty state with Generate button, or MatchReport component
            <TabPlaceholder>Match Report — not yet implemented (Phase 2)</TabPlaceholder>
          )}

          {activeTab === 'description' && (
            // TODO: Phase 2 — full-width JD display with inline edit
            <TabPlaceholder>{session.jobDescription || '—'}</TabPlaceholder>
          )}
        </Box>

        {/* Side panels */}
        <SidePanels session={session} />
      </Box>
    </Box>
  )
}

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
