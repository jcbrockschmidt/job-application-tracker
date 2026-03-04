// Modal dialog for creating a new session.
// User pastes a job description, hits Generate, and the app calls sessions:create.
// Shows an animated progress state while the AI generates the resume, then
// navigates to the new session on completion.
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
import { addSession } from '../../store/slices/sessionsSlice'
import { setActivePage } from '../../store/slices/uiSlice'

interface NewSessionDialogProps {
  open: boolean
  onClose: () => void
}

export default function NewSessionDialog({ open, onClose }: NewSessionDialogProps): JSX.Element {
  const [jobDescription, setJobDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()

  async function handleGenerate(): Promise<void> {
    setIsGenerating(true)
    setError(null)
    try {
      const session = await window.api.sessions.create(jobDescription)
      dispatch(addSession(session))
      dispatch(setActivePage('session'))
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  function handleClose(): void {
    if (!isGenerating) onClose()
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
          disabled={isGenerating}
        />

        {isGenerating && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Generating your tailored resume…
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
            <Button size="small" onClick={handleGenerate} disabled={isGenerating}>
              Retry
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!jobDescription.trim() || isGenerating}
          onClick={handleGenerate}
        >
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  )
}
