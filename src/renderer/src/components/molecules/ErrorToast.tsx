// Non-blocking transient toast notification using MUI Snackbar.
//
// Per the error handling policy in docs/design.md:
//   - Non-blocking feedback (session saved, backup complete, suggestion accepted,
//     export successful) → toast that auto-dismisses.
//   - Blocking errors (generation failure, ingestion failure, export failure)
//     → inline and persistent; use GenerationErrorBanner or ExportErrorBlock instead.
//
// STUB: Phase 6 — component is complete and ready to use; not yet integrated into
//   any flow. See the TODO list below for all planned integration points.
//
// TODO (Phase 6):
//   - Export success: after window.api.export.pdf/docx resolves, call
//       showToast(`Exported to ${path}`) from ExportDialog or SessionHeader.
//   - Backup success: after window.api.backup.trigger resolves in the Settings page
//       "Export full backup now" handler, call showToast(`Backup saved to ${path}`).
//   - Auto-save: after a debounced sessions:update call resolves, show
//       showToast("All changes saved") from StatusBar or SessionPage.
//   - Suggestion accepted (feedback/regen review): show showToast("Change accepted").
//   - Lifting state: consider adding toastMessage: string | null to uiSlice so any
//       component can trigger a toast via dispatch(showToast(message)) without prop-
//       drilling. Alternatively use a lightweight React context or event emitter.
//       Decide on the pattern when wiring the first integration point.

import { Snackbar, SnackbarContent } from '@mui/material'

interface ErrorToastProps {
  // The message to display. Pass null to hide the toast.
  message: string | null
  // Called when the toast auto-dismisses or Snackbar's close action fires.
  onClose: () => void
  // Duration in milliseconds before the toast auto-dismisses. Defaults to 3000.
  autoHideDuration?: number
}

// STUB: Phase 6
export default function ErrorToast({
  message,
  onClose,
  autoHideDuration = 3000
}: ErrorToastProps): JSX.Element {
  return (
    <Snackbar
      open={message !== null}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <SnackbarContent
        message={message ?? ''}
        sx={{ fontSize: 13, bgcolor: '#1f2937', color: '#f9fafb', minWidth: 'unset' }}
      />
    </Snackbar>
  )
}
