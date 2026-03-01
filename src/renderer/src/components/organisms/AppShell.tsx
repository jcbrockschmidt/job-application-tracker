// App shell: the persistent chrome that wraps every view.
// Renders the full-window CSS grid: topbar / sidebar / main / statusbar.
// The `children` prop fills the main content area; the sidebar, topbar, and
// statusbar are always rendered regardless of which page is active.
//
// STUB: Phase 1 — layout structure is defined; child organisms are stubs.

import { Box } from '@mui/material'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import Statusbar from './Statusbar'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps): JSX.Element {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: '52px 1fr 28px',
        gridTemplateColumns: '224px 1fr',
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
