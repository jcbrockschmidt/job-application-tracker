// Session header bar: company name, role title, Application Status chip,
// Finalize button, and Export button.
// Sits above the tab bar in the session view.
//
// STUB: Phase 1 — renders static props; actions not yet wired.
// TODO:
//   - Application Status chip: click to cycle through statuses,
//     call window.api.applications.update(applicationId, { applicationStatus })
//   - Finalize button (Phase 3): call window.api.applications.update(applicationId, {
//       resumeStatus: 'finalized',
//       resumeLastFinalizedAt: new Date().toISOString()  ← marks doc as unincorporated in Master CV
//     }); dispatch update to sessionsSlice; update the Draft/Final badge in the sidebar.
//   - Export button: open an export options popover (PDF / DOCX), then call window.api.export.pdf/docx
//   - Show error inline if export fails (disk full, permissions, path not found)

import { Box, Typography, Chip, Button } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import type { Session } from '@shared/types'

interface SessionHeaderProps {
  session: Session
}

export default function SessionHeader({ session }: SessionHeaderProps): JSX.Element {
  // TODO: const dispatch = useAppDispatch()
  // TODO: handle Finalize — update status in DB + Redux
  // TODO: handle Export — show PDF/DOCX choice, call IPC, handle errors

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

      {/* TODO: onClick opens export dialog */}
      <Button
        variant="contained"
        size="small"
        disableElevation
        startIcon={<FileDownloadIcon />}
        sx={{ fontSize: 13, whiteSpace: 'nowrap' }}
      >
        Export
      </Button>
    </Box>
  )
}
