// Session header bar: company name, role title, Application Status chip,
// Finalize button, and Export button.
// Sits above the tab bar in the session view.
//
// STUB: Phase 1 — renders static props; actions not yet wired.
// STUB: Phase 6 — ExportDialog import and open-state stubs added; dialog not yet rendered.
// TODO:
//   - Application Status chip: click to cycle through statuses,
//     call window.api.applications.update(applicationId, { applicationStatus })
//   - Finalize button (Phase 3): call window.api.applications.update(applicationId, {
//       resumeStatus: 'finalized',
//       resumeLastFinalizedAt: new Date().toISOString()  ← marks doc as unincorporated in Master CV
//     }); dispatch update to sessionsSlice; update the Draft/Final badge in the sidebar.
//   - Export button (Phase 6): set exportDialogOpen = true; uncomment ExportDialog below.
//   - Determine documentType from the active tab so the dialog exports the right document.
//   - Wire ErrorToast for export success: pass onSuccess={(path) => showToast(`Exported to ${path}`)}
//     to ExportDialog, or dispatch a toast action via uiSlice.
//
// TODO (Phase 6): uncomment this import when wiring the Export button.
// import ExportDialog from './ExportDialog'

import { Box, Typography, Chip, Button } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import type { Session } from '@shared/types'

interface SessionHeaderProps {
  session: Session
}

export default function SessionHeader({ session }: SessionHeaderProps): JSX.Element {
  // TODO: const dispatch = useAppDispatch()
  // TODO: handle Finalize — update status in DB + Redux

  // STUB: Phase 6 — export dialog state. Uncomment when wiring the Export button.
  // TODO: const [exportDialogOpen, setExportDialogOpen] = useState(false)
  // TODO: const [exportDocumentType, setExportDocumentType] = useState<DocumentType>('resume')
  //   Set exportDocumentType based on the active session tab before opening the dialog:
  //   'resume' when the Resume tab is active, 'coverLetter' when Cover Letter is active.

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e0e0e0',
        px: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minHeight: 52,
        flexShrink: 0
      }}
    >
      {/* Company + role */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ fontSize: 15 }}>
          {session.companyName || 'Company'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
            {session.roleTitle || 'Role'}
          </Typography>
          {/* TODO: click to cycle applicationStatus */}
          <Chip
            label="Not Applied"
            size="small"
            sx={{
              fontSize: 10.5,
              fontWeight: 600,
              height: 20,
              bgcolor: 'rgba(21,101,192,0.1)',
              color: '#1565c0'
            }}
          />
        </Box>
      </Box>

      {/* TODO: onClick finalizes the resume/cover letter */}
      <Button variant="outlined" size="small" sx={{ fontSize: 13, whiteSpace: 'nowrap' }}>
        Finalize
      </Button>

      {/* TODO (Phase 6): onClick={() => setExportDialogOpen(true)} */}
      <Button
        variant="contained"
        size="small"
        disableElevation
        startIcon={<FileDownloadIcon />}
        sx={{ fontSize: 13, whiteSpace: 'nowrap' }}
      >
        Export
      </Button>

      {/* Export dialog — STUB: Phase 6 */}
      {/* TODO: render when exportDialogOpen is wired. Example:
          <ExportDialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            sessionId={session.id}
            documentType={exportDocumentType}
            documentLabel={exportDocumentType === 'resume' ? 'Resume' : 'Cover Letter'}
          /> */}
    </Box>
  )
}
