// Modal dialog for creating a new session.
// User pastes a job description, hits Generate, and the app calls sessions:create.
// sessions:create returns quickly (job detail extraction + DB insert) so the dialog
// can close immediately; resume generation then continues in the background via
// generate:resume, which updates the session in Redux when it completes.
//
// STUB: Phase 7 — focus management identified below; not yet implemented.
// TODO (Phase 7 — focus management):
//   - Add aria-labelledby="new-session-dialog-title" to Dialog and id to DialogTitle.
//   - Add autoFocus to the job-description TextField so focus lands there on open.
//   - On close (Cancel or success), MUI Dialog automatically returns focus to the element
//     that was focused before the dialog opened — verify this works with the trigger buttons.

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  LinearProgress,
  Box
} from '@mui/material'
import { useAppDispatch } from '../../hooks'
import { addSession, updateSession, removeSession } from '../../store/slices/sessionsSlice'
import { setLastAiOp, notifyApplicationsChanged } from '../../store/slices/uiSlice'

interface NewSessionDialogProps {
  open: boolean
  onClose: () => void
}

export default function NewSessionDialog({ open, onClose }: NewSessionDialogProps): JSX.Element {
  const [jobDescription, setJobDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()

  async function handleGenerate(): Promise<void> {
    setIsCreating(true)
    setError(null)
    let sessionId: string | null = null

    try {
      // Phase 1: extract job details + insert DB rows. Returns quickly with isGenerating: true.
      // The session is added to the sidebar in loading state; the user is not navigated away.
      const session = await window.api.sessions.create(jobDescription)
      sessionId = session.id
      dispatch(addSession(session))
      dispatch(notifyApplicationsChanged())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session creation failed. Please try again.')
      setIsCreating(false)
      return
    }
    setIsCreating(false)

    // Phase 2: generate the resume in the background (dialog is already closed).
    // On success, update the session in Redux. On failure, remove it from the store.
    // TODO (Phase 6): surface a proper error notification on generation failure.
    try {
      const resume = await window.api.generate.resume(sessionId)
      dispatch(updateSession({ id: sessionId, updates: { resume, isGenerating: false } }))
      const lastOp = await window.api.spendLog.getLastOp()
      dispatch(setLastAiOp(lastOp))
    } catch {
      // Remove the session from the store — it will be cleaned from the DB on next restart.
      // No navigation needed: the user was never moved away from their current page.
      dispatch(removeSession(sessionId))
    }
  }

  function handleClose(): void {
    if (!isCreating) onClose()
  }

  return (
    // STUB: Phase 7 — add aria-labelledby="new-session-dialog-title"
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {/* STUB: Phase 7 — add id="new-session-dialog-title" */}
      <DialogTitle>New Session</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Paste the full job description below. The app will generate a tailored resume from your
          Master CV.
        </Typography>

        {/* STUB: Phase 7 — add autoFocus */}
        <TextField
          label="Job description"
          multiline
          minRows={10}
          fullWidth
          placeholder="Paste the job description here…"
          variant="outlined"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={isCreating}
        />

        {isCreating && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Analyzing job description…
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
            <Button size="small" onClick={handleGenerate} disabled={isCreating}>
              Retry
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isCreating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!jobDescription.trim() || isCreating}
          onClick={handleGenerate}
        >
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  )
}
