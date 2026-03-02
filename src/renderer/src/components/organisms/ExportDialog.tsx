// Export dialog: shown when the user clicks the Export button in SessionHeader.
// Allows exporting the current session's resume or cover letter as PDF or DOCX.
//
// Layout: MUI Dialog with two export format rows (PDF, DOCX); each row has an
//   Export button that opens the OS save dialog via IPC. An inline error block
//   is shown below a row when its export fails, with a "Save to different location"
//   action that re-opens the save dialog.
//
// STUB: Phase 6 — dialog layout, format rows, and all error states are rendered;
//   IPC calls are not yet wired. State variables are commented out.
//
// TODO (Phase 6):
//   - Wire "Export as PDF" button: call window.api.export.pdf(sessionId, documentType);
//       show CircularProgress while running; on success close the dialog and show
//       an ErrorToast with the destination path.
//   - Wire "Export as DOCX" button: call window.api.export.docx(sessionId, documentType);
//       same loading/success/error pattern as PDF.
//   - Handle typed export errors returned from the IPC:
//       'disk-full': "Export failed — not enough disk space."
//       'permissions': "Export failed — the app doesn't have permission to write to [path]."
//       'path-not-found': "Export failed — the destination folder no longer exists."
//       Map raw Error messages to ExportError.kind in a parseExportError() helper.
//   - "Save to different location": re-invoke the same export IPC call (the IPC
//       opens a new save dialog each time, so this naturally re-triggers it).
//   - Reset pdfError / docxError to null when the dialog is reopened (onClose/onOpen).
//   - Pass documentType ('resume' | 'coverLetter') down from SessionHeader so the
//       IPC receives the right type and the dialog label is accurate.

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import type { DocumentType } from '@shared/types'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  sessionId: string
  documentType: DocumentType
  // Human-readable label for the document being exported: "Resume" or "Cover Letter".
  documentLabel: string
}

// STUB: Phase 6
export default function ExportDialog({
  open,
  onClose,
  sessionId: _sessionId,
  documentType: _documentType,
  documentLabel
}: ExportDialogProps): JSX.Element {
  // TODO: const [pdfState, setPdfState] = useState<'idle' | 'exporting' | 'error'>('idle')
  // TODO: const [docxState, setDocxState] = useState<'idle' | 'exporting' | 'error'>('idle')
  // TODO: const [pdfError, setPdfError] = useState<ExportError | null>(null)
  // TODO: const [docxError, setDocxError] = useState<ExportError | null>(null)

  // TODO: async function handleExportPdf() {
  //   setPdfState('exporting')
  //   setPdfError(null)
  //   try {
  //     const path = await window.api.export.pdf(sessionId, documentType)
  //     onClose()
  //     // TODO: trigger ErrorToast with `Exported to ${path}` in parent or via uiSlice
  //   } catch (err) {
  //     setPdfError(parseExportError(err))
  //     setPdfState('error')
  //   }
  // }

  // TODO: async function handleExportDocx() {
  //   setDocxState('exporting')
  //   setDocxError(null)
  //   try {
  //     const path = await window.api.export.docx(sessionId, documentType)
  //     onClose()
  //     // TODO: trigger ErrorToast with `Exported to ${path}`
  //   } catch (err) {
  //     setDocxError(parseExportError(err))
  //     setDocxState('error')
  //   }
  // }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        <Box sx={{ flex: 1 }}>Export {documentLabel}</Box>
        <IconButton size="small" onClick={onClose} aria-label="Close export dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 3 }}>
        {/* PDF export row — STUB: Phase 6 */}
        {/* TODO: pass isExporting={pdfState === 'exporting'}, error={pdfError}, onExport={handleExportPdf}, onRetry={handleExportPdf} */}
        <ExportFormatRow
          label="PDF"
          description="Best for submitting and printing. Matches the on-screen appearance exactly."
          onExport={() => {
            /* TODO: handleExportPdf() */
          }}
          isExporting={false}
          error={null}
          onRetry={() => {
            /* TODO: handleExportPdf() */
          }}
        />

        {/* DOCX export row — STUB: Phase 6 */}
        {/* TODO: pass isExporting={docxState === 'exporting'}, error={docxError}, onExport={handleExportDocx}, onRetry={handleExportDocx} */}
        <ExportFormatRow
          label="DOCX"
          description="Word-compatible. Same layout as the PDF for a matched set."
          onExport={() => {
            /* TODO: handleExportDocx() */
          }}
          isExporting={false}
          error={null}
          onRetry={() => {
            /* TODO: handleExportDocx() */
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Export Format Row ────────────────────────────────────────────────────────

// One export format option (PDF or DOCX) with its Export button and an inline
// error block when the export fails.
//
// STUB: Phase 6 — layout complete; error block hidden until error prop is non-null.
// TODO: replace `false` guard in ExportErrorBlock render with `error !== null`.

// A typed export error. The three kinds map directly to the error messages in design.md.
export interface ExportError {
  kind: 'disk-full' | 'permissions' | 'path-not-found'
  // Path that caused the error, included in the permissions/path-not-found message.
  path?: string
}

interface ExportFormatRowProps {
  label: string
  description: string
  onExport: () => void
  isExporting: boolean
  error: ExportError | null
  // Re-invoke the same export call, which opens a new save dialog.
  onRetry: () => void
}

function ExportFormatRow({
  label,
  description,
  onExport,
  isExporting,
  error,
  onRetry
}: ExportFormatRowProps): JSX.Element {
  return (
    <Box
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: 1.5,
        px: 2,
        py: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={600} sx={{ fontSize: 13.5 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{description}</Typography>
        </Box>

        {/* TODO: disabled={isExporting} */}
        <Button
          variant="outlined"
          size="small"
          startIcon={
            isExporting ? (
              <CircularProgress size={13} />
            ) : (
              <FileDownloadIcon sx={{ fontSize: 15 }} />
            )
          }
          onClick={onExport}
          sx={{ fontSize: 12.5, whiteSpace: 'nowrap' }}
        >
          {isExporting ? 'Exporting…' : `Export as ${label}`}
        </Button>
      </Box>

      {/* Inline error — STUB: Phase 6 */}
      {/* TODO: remove the null guard below in Phase 6 when wiring real export state */}
      {error !== null && <ExportErrorBlock error={error} onSaveDifferentLocation={onRetry} />}
    </Box>
  )
}

// ─── Export Error Block ───────────────────────────────────────────────────────

// Inline, persistent error shown when an export call fails.
// Always includes a "Save to different location" action that re-opens the save dialog.
//
// STUB: Phase 6 — error message mapping is complete; visibility is controlled by parent.
// TODO: when wiring, remove the `false &&` guard in ExportFormatRow and let
//   `error !== null` control rendering naturally.

function ExportErrorBlock({
  error,
  onSaveDifferentLocation
}: {
  error: ExportError
  onSaveDifferentLocation: () => void
}): JSX.Element {
  return (
    <Box
      sx={{
        bgcolor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 1,
        px: 1.5,
        py: 1,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 15, color: '#dc2626', mt: 0.125, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 12, color: '#b91c1c', mb: 0.5 }}>
          {exportErrorMessage(error)}
        </Typography>
        <Button
          size="small"
          onClick={onSaveDifferentLocation}
          sx={{
            fontSize: 11.5,
            p: 0,
            minWidth: 0,
            color: '#b91c1c',
            textDecoration: 'underline',
            '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
          }}
        >
          Save to different location
        </Button>
      </Box>
    </Box>
  )
}

// Maps an ExportError to the user-facing message from docs/design.md.
function exportErrorMessage(error: ExportError): string {
  switch (error.kind) {
    case 'disk-full':
      return 'Export failed — not enough disk space.'
    case 'permissions':
      return `Export failed — the app doesn't have permission to write to ${error.path ?? 'that location'}.`
    case 'path-not-found':
      return 'Export failed — the destination folder no longer exists.'
  }
}

// ─── Parse Export Error ───────────────────────────────────────────────────────

// TODO (Phase 6): Implement this helper when wiring real IPC calls.
//   Inspect the error thrown by window.api.export.pdf/docx and map it to an ExportError.
//   The IPC handler should throw with a structured message or a custom Error subclass
//   (e.g. { code: 'disk-full' | 'permissions' | 'path-not-found', path?: string }).
//   Match on error.code or error.message to determine the kind.
//
// function parseExportError(err: unknown): ExportError {
//   // TODO: inspect err for known error codes from the main process
//   return { kind: 'disk-full' } // placeholder
// }
