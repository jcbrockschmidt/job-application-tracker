// Application Master List: sortable, filterable table of all job applications.
// Columns: Company, Role, Summary, Started, Submitted, Resume Status,
//          Cover Letter Status, Application Status, Notes, Open.
//
// STUB: Phase 2 — header, filter chips, search bar, and table columns rendered;
//   data loading, sorting, inline editing, and row actions not yet wired.
// TODO:
//   - Load applications on mount: window.api.applications.getAll().then(setApplications)
//   - Column sorting: track sortKey + sortDir; sort rows client-side on header click
//   - Quick-filter chips: filter rows by applicationStatus
//   - Search bar: filter rows where Company, Role, Notes, or Summary contains the query
//   - Application Status chip: click-to-cycle; call window.api.applications.update(id, updates)
//   - Notes cell: click to show TextField; saves on blur/Enter via applications:update
//   - Submitted cell: date picker or text input; saves via applications:update
//   - Open button: dispatch to Redux + navigate to session view (create session if none exists)
//   - Delete: confirm dialog + window.api.applications.delete(id) + remove from local state

import { Box, Chip, InputAdornment, TableSortLabel, TextField, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import type { ApplicationStatus } from '@shared/types'

// Filter options shown as quick-filter chips above the table
const STATUS_FILTERS: Array<{ label: string; value: ApplicationStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Not Applied', value: 'not_applied' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Interviewing', value: 'interviewing' },
  { label: 'Offer', value: 'offer_received' }
]

// Column definitions for the sortable table header
const COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'companyName', label: 'Company' },
  { key: 'roleTitle', label: 'Role' },
  { key: 'briefSummary', label: 'Summary' },
  { key: 'createdAt', label: 'Started' },
  { key: 'submittedDate', label: 'Submitted' },
  { key: 'resumeStatus', label: 'Resume' },
  { key: 'coverLetterStatus', label: 'Cover Letter' },
  { key: 'applicationStatus', label: 'Status' },
  { key: 'notes', label: 'Notes' },
  { key: '_open', label: '' }
]

export default function MasterListPage(): JSX.Element {
  // TODO: const [applications, setApplications] = useState<Application[]>([])
  // TODO: const [isLoading, setIsLoading] = useState(true)
  // TODO: useEffect(() => {
  //   window.api.applications.getAll()
  //     .then(setApplications)
  //     .finally(() => setIsLoading(false))
  // }, [])

  // TODO: const [searchQuery, setSearchQuery] = useState('')
  // TODO: const [activeFilter, setActiveFilter] = useState<ApplicationStatus | 'all'>('all')
  // TODO: const [sortKey, setSortKey] = useState('createdAt')
  // TODO: const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // TODO: const filtered = applications
  //   .filter(app =>
  //     (activeFilter === 'all' || app.applicationStatus === activeFilter) &&
  //     (!searchQuery || [app.companyName, app.roleTitle, app.notes ?? '', app.briefSummary ?? '']
  //       .some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  //   )
  //   .sort((a, b) => { /* sort by sortKey / sortDir */ })

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header bar */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
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

        {/* Search bar — STUB: not yet connected to state */}
        {/* TODO: value={searchQuery} onChange={e => setSearchQuery(e.target.value)} */}
        <TextField
          size="small"
          placeholder="Search company, role, notes…"
          variant="outlined"
          sx={{ width: 260, ml: 1, '& .MuiInputBase-root': { fontSize: 13, height: 34 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Quick-filter chips — STUB: not yet connected to state */}
      {/* TODO: activeFilter state drives selected chip and filtered rows */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 3,
          py: 1,
          display: 'flex',
          gap: 1,
          flexShrink: 0
        }}
      >
        {STATUS_FILTERS.map(({ label, value }) => (
          // TODO: onClick={() => setActiveFilter(value)}, selected variant when active
          <Chip
            key={value}
            label={label}
            size="small"
            variant="outlined"
            sx={{ fontSize: 12, cursor: 'pointer' }}
          />
        ))}
      </Box>

      {/* Table — STUB: column headers rendered; rows not yet populated */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box
          component="table"
          sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: 'text.primary' }}
        >
          {/* Column headers */}
          <Box
            component="thead"
            sx={{ bgcolor: 'background.default', position: 'sticky', top: 0, zIndex: 1 }}
          >
            <Box component="tr">
              {COLUMNS.map(({ key, label }) => (
                <Box
                  key={key}
                  component="th"
                  sx={{
                    px: 2,
                    py: 1.25,
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 12,
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {label && (
                    // TODO: onClick sort handler; direction={sortKey === key ? sortDir : undefined}
                    <TableSortLabel>{label}</TableSortLabel>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Table body — STUB: no data yet */}
          {/* TODO: filtered.map(app => <ApplicationRow key={app.id} app={app} />) */}
          <Box component="tbody">
            <Box component="tr">
              <Box
                component="td"
                colSpan={COLUMNS.length}
                sx={{ px: 3, py: 6, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}
              >
                {/* TODO: replace with real rows once data loads */}
                No applications yet.
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

// ─── ApplicationRow stub (Phase 2) ───────────────────────────────────────────

// STUB: Phase 2 — renders all columns; all interactive cells not yet implemented.
// TODO:
//   - applicationStatus: Chip click-to-cycle; call applications:update
//   - notes: click to show TextField in place; blur/Enter saves
//   - submittedDate: click for date input; saves via applications:update
//   - Open button: navigate to session (creates session row if none exists)
//   - Add delete row action (trash icon, confirm dialog)
//
// function ApplicationRow({ app }: { app: Application }): JSX.Element {
//   return (
//     <Box component="tr" sx={{ borderBottom: '1px solid #f3f4f6', '&:hover': { bgcolor: '#fafafa' } }}>
//       <Box component="td" sx={{ px: 2, py: 1.5 }}>{app.companyName}</Box>
//       <Box component="td" sx={{ px: 2, py: 1.5 }}>{app.roleTitle}</Box>
//       <Box component="td" sx={{ px: 2, py: 1.5, color: 'text.secondary' }}>{app.briefSummary ?? '—'}</Box>
//       <Box component="td" sx={{ px: 2, py: 1.5 }}>{new Date(app.createdAt).toLocaleDateString()}</Box>
//       <Box component="td" sx={{ px: 2, py: 1.5 }}>{app.submittedDate ?? '—'}</Box>
//       <Box component="td" sx={{ px: 2, py: 1.5 }}>{app.resumeStatus}</Box>
//       <Box component="td" sx={{ px: 2, py: 1.5 }}>{app.coverLetterStatus}</Box>
//       <Box component="td" sx={{ px: 2, py: 1.5 }}>{app.applicationStatus}</Box>
//       <Box component="td" sx={{ px: 2, py: 1.5 }}>{app.notes ?? '—'}</Box>
//       <Box component="td" sx={{ px: 2, py: 1.5 }}><Button size="small">Open</Button></Box>
//     </Box>
//   )
// }
