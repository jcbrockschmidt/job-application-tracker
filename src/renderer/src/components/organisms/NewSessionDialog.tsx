// Modal dialog for creating a new session.
// User pastes a job description, hits Generate, and the app calls sessions:create.
// Shows an animated progress state while the AI generates the resume, then
// navigates to the new session on completion.
//
// STUB: Phase 1 — structure and props defined; generation logic not yet wired.
// STUB: Phase 7 — focus management note added; MUI Dialog handles focus trap automatically.
// TODO:
//   - Call window.api.sessions.create(jobDescription) on submit
//   - Dispatch addSession(session) and setActivePage('session') on success
//   - Show LinearProgress / status text during generation (streaming if possible)
//   - Show inline error with Retry button on failure (network, rate limit, auth, context)
//   - Disable Generate button when jobDescription is empty
// TODO (Phase 7 — focus management):
//   - MUI Dialog already provides a FocusTrap; focus is contained inside while it is open.
//   - Add autoFocus to the job-description TextField so focus lands there immediately on open.
//   - On close (Cancel or success), MUI Dialog automatically returns focus to the element
//     that was focused before the dialog opened — verify this works with the "+ New Session"
//     button trigger in Topbar and Sidebar.
//   - Add aria-labelledby={dialogTitleId} to the Dialog and id={dialogTitleId} to
//     DialogTitle so screen readers announce the dialog name when it opens.

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography
} from '@mui/material'

interface NewSessionDialogProps {
  open: boolean
  onClose: () => void
}

export default function NewSessionDialog({ open, onClose }: NewSessionDialogProps): JSX.Element {
  // TODO: const [jobDescription, setJobDescription] = useState('')
  // TODO: const [isGenerating, setIsGenerating] = useState(false)
  // TODO: const [error, setError] = useState<string | null>(null)
  // TODO: const dispatch = useAppDispatch()

  // TODO: async function handleGenerate() {
  //   setIsGenerating(true)
  //   setError(null)
  //   try {
  //     const session = await window.api.sessions.create(jobDescription)
  //     dispatch(addSession(session))
  //     dispatch(setActivePage('session'))
  //     onClose()
  //   } catch (err) {
  //     setError(mapGenerationError(err))
  //   } finally {
  //     setIsGenerating(false)
  //   }
  // }

  return (
    // STUB: Phase 7 — add aria-labelledby="new-session-dialog-title" when wiring
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* STUB: Phase 7 — add id="new-session-dialog-title" for aria-labelledby */}
      <DialogTitle>New Session</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Paste the full job description below. The app will generate a tailored resume from your
          Master CV.
        </Typography>

        {/* TODO: value={jobDescription} onChange={e => setJobDescription(e.target.value)} */}
        {/* STUB: Phase 7 — add autoFocus so focus lands here when the dialog opens */}
        <TextField
          label="Job description"
          multiline
          minRows={10}
          fullWidth
          placeholder="Paste the job description here…"
          variant="outlined"
          // TODO (Phase 7): autoFocus
        />

        {/* TODO: show LinearProgress when isGenerating */}
        {/* TODO: show inline error message when error is set */}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        {/* TODO: disabled={!jobDescription.trim() || isGenerating} onClick={handleGenerate} */}
        <Button variant="contained" disableElevation>
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  )
}
