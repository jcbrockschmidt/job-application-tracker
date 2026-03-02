// App shell: the persistent chrome that wraps every view.
// Renders the full-window CSS grid: topbar / sidebar / main / statusbar.
// The `children` prop fills the main content area; the sidebar, topbar, and
// statusbar are always rendered regardless of which page is active.
//
// STUB: Phase 1 — layout structure is defined; child organisms are stubs.
// STUB: Phase 7 — focus management on view change identified below; not yet implemented.
// TODO (Phase 7 — focus management):
//   - When `activePage` changes (tracked via useEffect on the uiSlice value), move focus
//     to the page heading of the newly active page. Each page component should expose a
//     ref on its <h1> or primary heading element; AppShell calls ref.current.focus() on
//     navigation. Use tabIndex={-1} on the heading so it can receive programmatic focus
//     without entering the tab order permanently.
//   - MUI Dialog components (NewSessionDialog, ExportDialog, SpendingLimitDialog) already
//     use FocusTrap internally — verify focus returns to the trigger element on close by
//     checking that onClose restores focus to the button that opened the dialog.

import { Box } from '@mui/material'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import Statusbar from './Statusbar'
import { useAppSelector } from '../../hooks'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps): JSX.Element {
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen)

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: '52px 1fr 28px',
        gridTemplateColumns: isSidebarOpen ? '224px 1fr' : '0 1fr',
        gridTemplateAreas: `
          "topbar  topbar"
          "sidebar main"
          "status  status"
        `,
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ gridArea: 'topbar' }}>
        <Topbar />
      </Box>

      <Box sx={{ gridArea: 'sidebar', overflow: 'hidden' }}>
        <Sidebar />
      </Box>

      <Box sx={{ gridArea: 'main', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>

      <Box sx={{ gridArea: 'status' }}>
        <Statusbar />
      </Box>
    </Box>
  )
}
