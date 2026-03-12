import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Box,
  Chip,
  InputAdornment,
  TableSortLabel,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LaunchIcon from '@mui/icons-material/Launch'
import type { Application, ApplicationStatus, Session } from '@shared/types'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { setActivePage, notifyApplicationsChanged } from '../../store/slices/uiSlice'
import { setActiveSession, addSession } from '../../store/slices/sessionsSlice'

// Filter options shown as quick-filter chips above the table
const STATUS_FILTERS: Array<{ label: string; value: ApplicationStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Not Applied', value: 'not_applied' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Interviewing', value: 'interviewing' },
  { label: 'Offer', value: 'offer_received' }
]

// Column definitions for the sortable table header
const COLUMNS: Array<{ key: keyof Application | '_open'; label: string }> = [
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
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | 'all'>('all')
  const [sortKey, setSortKey] = useState<keyof Application>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sessions = useAppSelector((state) => state.sessions.sessions)
  const applicationsLastChanged = useAppSelector((state) => state.ui.applicationsLastChanged)
  const dispatch = useAppDispatch()

  const fetchApplications = () => {
    setIsLoading(true)
    window.api.applications
      .getAll()
      .then(setApplications)
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchApplications()
  }, [applicationsLastChanged])

  const handleSort = (key: keyof Application) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filteredAndSorted = useMemo(() => {
    const result = applications.filter(
      (app) =>
        (activeFilter === 'all' || app.applicationStatus === activeFilter) &&
        (!searchQuery ||
          [app.companyName, app.roleTitle, app.notes ?? '', app.briefSummary ?? ''].some((s) =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
          ))
    )

    result.sort((a, b) => {
      const valA = a[sortKey] ?? ''
      const valB = b[sortKey] ?? ''
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [applications, activeFilter, searchQuery, sortKey, sortDir])

  const handleUpdate = async (id: string, updates: Partial<Application>) => {
    await window.api.applications.update(id, updates)
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, ...updates } : app)))
    if (updates.companyName || updates.roleTitle) {
      dispatch(notifyApplicationsChanged())
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this application and all its documents?')) {
      await window.api.applications.delete(id)
      setApplications((prev) => prev.filter((app) => app.id !== id))
      dispatch(notifyApplicationsChanged())
    }
  }

  const handleOpenSession = async (applicationId: string) => {
    // 1. Check if session already exists in Redux
    let session = sessions.find((s) => s.applicationId === applicationId)

    if (!session) {
      // 2. If not in Redux, try to fetch it via API (this might happen if Redux state was lost)
      const allSessions = await window.api.sessions.getAll()
      session = allSessions.find((s) => s.applicationId === applicationId)
      if (session) {
        dispatch(addSession(session))
      }
    }

    if (session) {
      dispatch(setActiveSession(session.id))
      dispatch(setActivePage('session'))
    } else {
      // This shouldn't happen based on current logic where sessions:create creates an application.
      console.error('No session found for application', applicationId)
    }
  }

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

        <TextField
          size="small"
          placeholder="Search company, role, notes…"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Quick-filter chips */}
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
          <Chip
            key={value}
            label={label}
            size="small"
            variant={activeFilter === value ? 'filled' : 'outlined'}
            color={activeFilter === value ? 'primary' : 'default'}
            onClick={() => setActiveFilter(value)}
            sx={{ fontSize: 12, cursor: 'pointer' }}
          />
        ))}
      </Box>

      {/* Table */}
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
                  {label ? (
                    <TableSortLabel
                      active={sortKey === key}
                      direction={sortKey === key ? sortDir : 'asc'}
                      onClick={() => handleSort(key as keyof Application)}
                    >
                      {label}
                    </TableSortLabel>
                  ) : null}
                </Box>
              ))}
            </Box>
          </Box>

          <Box component="tbody">
            {isLoading ? (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={COLUMNS.length}
                  sx={{ px: 3, py: 6, textAlign: 'center' }}
                >
                  <CircularProgress size={24} />
                </Box>
              </Box>
            ) : filteredAndSorted.length > 0 ? (
              filteredAndSorted.map((app) => (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onOpen={handleOpenSession}
                  session={sessions.find((s) => s.applicationId === app.id)}
                />
              ))
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={COLUMNS.length}
                  sx={{ px: 3, py: 6, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}
                >
                  No applications found.
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function ApplicationRow({
  app,
  onUpdate,
  onDelete,
  onOpen,
  session
}: {
  app: Application
  onUpdate: (id: string, updates: Partial<Application>) => void
  onDelete: (id: string) => void
  onOpen: (id: string) => void
  session?: Session
}): JSX.Element {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState(app.notes ?? '')
  const notesRef = useRef<HTMLInputElement>(null)

  const [isEditingSubmitted, setIsEditingSubmitted] = useState(false)

  const isGenerating = session?.isGenerating ?? false

  useEffect(() => {
    if (isEditingNotes && notesRef.current) {
      notesRef.current.focus()
    }
  }, [isEditingNotes])

  const handleStatusCycle = () => {
    if (isGenerating) return
    const statuses: ApplicationStatus[] = [
      'not_applied',
      'submitted',
      'interviewing',
      'offer_received',
      'rejected',
      'withdrawn'
    ]
    const currentIndex = statuses.indexOf(app.applicationStatus)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    onUpdate(app.id, { applicationStatus: nextStatus })
  }

  const handleNotesBlur = () => {
    setIsEditingNotes(false)
    if (notesDraft !== (app.notes ?? '')) {
      onUpdate(app.id, { notes: notesDraft })
    }
  }

  return (
    <Box
      component="tr"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      <Box component="td" sx={{ px: 2, py: 1.5, fontWeight: 500 }}>
        {app.companyName}
      </Box>
      <Box component="td" sx={{ px: 2, py: 1.5 }}>
        {app.roleTitle}
      </Box>
      <Box
        component="td"
        sx={{ px: 2, py: 1.5, color: 'text.secondary', width: 250, maxWidth: 250 }}
      >
        <Typography variant="inherit">{app.briefSummary ?? '—'}</Typography>
      </Box>
      <Box component="td" sx={{ px: 2, py: 1.5, whiteSpace: 'nowrap' }}>
        {new Date(app.createdAt).toLocaleDateString()}
      </Box>
      <Box component="td" sx={{ px: 2, py: 1.5, whiteSpace: 'nowrap' }}>
        {isEditingSubmitted ? (
          <TextField
            autoFocus
            type="date"
            size="small"
            variant="standard"
            value={app.submittedDate ? app.submittedDate.split('T')[0] : ''}
            onChange={(e) => onUpdate(app.id, { submittedDate: e.target.value })}
            onBlur={() => setIsEditingSubmitted(false)}
            InputProps={{ disableUnderline: true, sx: { fontSize: 13 } }}
            disabled={isGenerating}
          />
        ) : (
          <Typography
            onClick={() => !isGenerating && setIsEditingSubmitted(true)}
            sx={{
              fontSize: 13,
              cursor: isGenerating ? 'default' : 'pointer',
              color: app.submittedDate ? 'text.primary' : 'text.disabled'
            }}
          >
            {app.submittedDate
              ? new Date(app.submittedDate.split('T')[0] + 'T00:00:00').toLocaleDateString()
              : '—'}
          </Typography>
        )}
      </Box>
      <Box component="td" sx={{ px: 2, py: 1.5 }}>
        {isGenerating ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
            <CircularProgress size={14} thickness={5} />
            <Typography variant="inherit" fontWeight={600}>
              Generating…
            </Typography>
          </Box>
        ) : (
          <Chip
            label={app.resumeStatus === 'finalized' ? 'Final' : 'Draft'}
            size="small"
            color={app.resumeStatus === 'finalized' ? 'success' : 'default'}
            variant="outlined"
            sx={{ height: 20, fontSize: 11 }}
          />
        )}
      </Box>
      <Box component="td" sx={{ px: 2, py: 1.5 }}>
        {app.coverLetterStatus !== 'none' && (
          <Chip
            label={app.coverLetterStatus === 'finalized' ? 'Final' : 'Draft'}
            size="small"
            color={app.coverLetterStatus === 'finalized' ? 'success' : 'default'}
            variant="outlined"
            sx={{ height: 20, fontSize: 11 }}
          />
        )}
      </Box>
      <Box component="td" sx={{ px: 2, py: 1.5 }}>
        <Chip
          label={app.applicationStatus.replace('_', ' ')}
          size="small"
          onClick={handleStatusCycle}
          color={app.applicationStatus === 'offer_received' ? 'success' : 'default'}
          disabled={isGenerating}
          sx={{ textTransform: 'capitalize', cursor: isGenerating ? 'default' : 'pointer' }}
        />
      </Box>
      <Box component="td" sx={{ px: 2, py: 1.5, width: 300, maxWidth: 300 }}>
        {isEditingNotes ? (
          <TextField
            inputRef={notesRef}
            fullWidth
            size="small"
            multiline
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            onBlur={handleNotesBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleNotesBlur()
              }
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: 13,
                p: 0.5,
                lineHeight: 1.5
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.light'
              }
            }}
          />
        ) : (
          <Typography
            onClick={() => !isGenerating && setIsEditingNotes(true)}
            sx={{
              fontSize: 13,
              cursor: isGenerating ? 'default' : 'pointer',
              color: app.notes ? 'text.primary' : 'text.disabled',
              fontStyle: app.notes ? 'normal' : 'italic',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.5,
              minHeight: '1.5em',
              display: 'block'
            }}
          >
            {app.notes || 'Add notes…'}
          </Typography>
        )}
      </Box>
      <Box component="td" sx={{ px: 2, py: 1.5, whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Open Session">
            <IconButton size="small" onClick={() => onOpen(app.id)} color="primary">
              <LaunchIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Application">
            <IconButton size="small" onClick={() => onDelete(app.id)} color="error">
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}
