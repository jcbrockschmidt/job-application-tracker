// Session header bar: company name, role title, Application Status chip,
// Finalize button, and Export button.
// Sits above the tab bar in the session view.

import { useState } from 'react'
import { Box, Typography, Chip, Button } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import type { Session, DocumentType } from '@shared/types'
import type { SessionTab } from './SessionTabs'
import ExportDialog from './ExportDialog'

interface SessionHeaderProps {
  session: Session
  activeTab: SessionTab
}

export default function SessionHeader({ session, activeTab }: SessionHeaderProps): JSX.Element {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Determine documentType from the active tab. Defaults to resume if on matchReport or description.
  const exportDocumentType: DocumentType = activeTab === 'coverLetter' ? 'coverLetter' : 'resume'
  const exportDocumentLabel = exportDocumentType === 'resume' ? 'Resume' : 'Cover Letter'

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
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

      {/* TODO: onClick finalizes the resume/cover letter (Phase 3) */}
      <Button variant="outlined" size="small" sx={{ fontSize: 13, whiteSpace: 'nowrap' }}>
        Finalize
      </Button>

      <Button
        variant="contained"
        size="small"
        disableElevation
        startIcon={<FileDownloadIcon />}
        onClick={() => setExportDialogOpen(true)}
        sx={{ fontSize: 13, whiteSpace: 'nowrap' }}
      >
        Export
      </Button>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        sessionId={session.id}
        documentType={exportDocumentType}
        documentLabel={exportDocumentLabel}
      />
    </Box>
  )
}
