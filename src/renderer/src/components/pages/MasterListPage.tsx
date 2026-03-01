// Application Master List: sortable, filterable table of all sessions.
// Columns: Company, Role, Summary, Started, Submitted, Resume Status,
//          Cover Letter Status, Application Status, Notes, Open.
//
// STUB: Phase 2 — not yet implemented.
// TODO:
//   - Load applications via window.api.applications.getAll() on mount
//   - Render sortable table with all columns
//   - Quick-filter chips: All, Not Applied, Submitted, Interviewing, Offer
//   - Text search bar matching across Company, Role, Notes, Summary
//   - Inline editing: Application Status chip (click-to-cycle), Notes (click to edit),
//     Submitted date; all call window.api.applications.update(id, updates)
//   - Open button navigates to session view for that application

import { Box, Typography } from '@mui/material'

export default function MasterListPage(): JSX.Element {
  // TODO: const [applications, setApplications] = useState<Application[]>([])
  // TODO: useEffect(() => { window.api.applications.getAll().then(setApplications) }, [])

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header bar */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          minHeight: 52,
          flexShrink: 0
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 15 }}>
          Applications
        </Typography>
        {/* TODO: search bar, filter chips */}
      </Box>

      {/* Table area */}
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
          Application Master List — not yet implemented (Phase 2)
        </Typography>
      </Box>
    </Box>
  )
}
