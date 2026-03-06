// Export dialog: shown when the user clicks the Export button in SessionHeader.
// Allows exporting the current session's resume or cover letter as PDF or DOCX.
//
// Layout: MUI Dialog with two export format rows (PDF, DOCX); each row has an
//   Export button that opens the OS save dialog via IPC. An inline error block
//   is shown below a row when its export fails, with a "Save to different location"
//   action that re-opens the save dialog.

import { useState } from 'react'
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

export default function ExportDialog({
  open,
  onClose,
  sessionId,
  documentType,
  documentLabel
}: ExportDialogProps): JSX.Element {
  const [pdfState, setPdfState] = useState<'idle' | 'exporting' | 'error'>('idle')
  const [docxState, setDocxState] = useState<'idle' | 'exporting' | 'error'>('idle')
  const [pdfError, setPdfError] = useState<ExportError | null>(null)
  const [docxError, setDocxError] = useState<ExportError | null>(null)

  async function handleExportPdf(): Promise<void> {
    setPdfState('exporting')
    setPdfError(null)
    try {
      const path = await window.api.export.pdf(sessionId, documentType)
      if (path) {
        onClose()
        // Success is handled by the OS save dialog closing and the IPC returning the path.
        // The parent can show a toast if needed.
      } else {
        // Canceled
        setPdfState('idle')
      }
    } catch (err: any) {
      setPdfError(parseExportError(err))
      setPdfState('error')
    }
  }

  async function handleExportDocx(): Promise<void> {
    setDocxState('exporting')
    setDocxError(null)
    try {
      const path = await window.api.export.docx(sessionId, documentType)
      if (path) {
        onClose()
      } else {
        setDocxState('idle')
      }
    } catch (err: any) {
      setDocxError(parseExportError(err))
      setDocxState('error')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        <Box sx={{ flex: 1 }}>Export {documentLabel}</Box>
        <IconButton size="small" onClick={onClose} aria-label="Close export dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 3 }}>
        <ExportFormatRow
          label="PDF"
          description="Best for submitting and printing. Matches the on-screen appearance exactly."
          onExport={handleExportPdf}
          isExporting={pdfState === 'exporting'}
          error={pdfError}
          onRetry={handleExportPdf}
        />

        <ExportFormatRow
          label="DOCX"
          description="Word-compatible. Same layout as the PDF for a matched set."
          onExport={handleExportDocx}
          isExporting={docxState === 'exporting'}
          error={docxError}
          onRetry={handleExportDocx}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Export Format Row ────────────────────────────────────────────────────────

export interface ExportError {
  kind: 'disk-full' | 'permissions' | 'path-not-found' | 'unknown'
  message?: string
}

interface ExportFormatRowProps {
  label: string
  description: string
  onExport: () => void
  isExporting: boolean
  error: ExportError | null
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
        border: '1px solid',
        borderColor: 'divider',
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
          <Typography variant="body2" sx={{ fontSize: 12, color: 'text.secondary' }}>
            {description}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          disabled={isExporting}
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

      {error !== null && <ExportErrorBlock error={error} onSaveDifferentLocation={onRetry} />}
    </Box>
  )
}

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
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'error.dark' : '#fef2f2'),
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'error.main' : '#fecaca'),
        borderRadius: 1,
        px: 1.5,
        py: 1,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1
      }}
    >
      <ErrorOutlineIcon
        sx={{
          fontSize: 15,
          color: (theme) => (theme.palette.mode === 'dark' ? 'error.contrastText' : '#dc2626'),
          mt: 0.125,
          flexShrink: 0
        }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: 12,
            color: (theme) => (theme.palette.mode === 'dark' ? 'error.contrastText' : '#b91c1c'),
            mb: 0.5
          }}
        >
          {exportErrorMessage(error)}
        </Typography>
        <Button
          size="small"
          onClick={onSaveDifferentLocation}
          sx={{
            fontSize: 11.5,
            p: 0,
            minWidth: 0,
            color: (theme) => (theme.palette.mode === 'dark' ? 'error.contrastText' : '#b91c1c'),
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

function exportErrorMessage(error: ExportError): string {
  switch (error.kind) {
    case 'disk-full':
      return 'Export failed — not enough disk space.'
    case 'permissions':
      return (
        error.message ||
        `Export failed — the app doesn't have permission to write to that location.`
      )
    case 'path-not-found':
      return 'Export failed — the destination folder no longer exists.'
    case 'unknown':
      return error.message || 'Export failed.'
  }
}

function parseExportError(err: any): ExportError {
  const message = err.message || ''
  if (message.includes('disk space')) return { kind: 'disk-full' }
  if (message.includes('permission')) return { kind: 'permissions', message }
  if (message.includes('no longer exists')) return { kind: 'path-not-found' }
  return { kind: 'unknown', message }
}
