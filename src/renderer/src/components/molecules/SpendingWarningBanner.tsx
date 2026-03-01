// Amber warning banner shown when the rolling 24-hour estimated spend exceeds
// the configured spending limit.
//
// Displayed in two places:
//   - Below the tab bar in SessionPage (visible on all tabs)
//   - Below the page header in MasterCVPage
//
// STUB: Phase 4 — banner shape complete; parent is responsible for fetching
// the current spend total and passing it as a prop.
// TODO:
//   - Parents (SessionPage, MasterCVPage) should call window.api.spendLog.getTotal()
//     on mount and after every AI call, then pass the result down as spendUsd.
//   - Read limitUsd from settingsSlice.spendingLimit in the parent, then pass it down.
//   - Return null (render nothing) when limitUsd === 0 or spendUsd <= limitUsd.

import { Box, Typography } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

interface SpendingWarningBannerProps {
  // Rolling 24-hour estimated spend in USD. Fetch via window.api.spendLog.getTotal().
  spendUsd: number
  // Configured daily spending limit in USD. 0 means disabled.
  limitUsd: number
}

// STUB: Phase 4
export default function SpendingWarningBanner({
  spendUsd,
  limitUsd
}: SpendingWarningBannerProps): JSX.Element | null {
  // Render nothing if limit is disabled or not yet exceeded.
  if (limitUsd === 0 || spendUsd <= limitUsd) return null

  return (
    <Box
      sx={{
        bgcolor: '#fffbeb',
        borderBottom: '1px solid #fcd34d',
        px: 3,
        py: 0.875,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        flexShrink: 0
      }}
    >
      <WarningAmberIcon sx={{ fontSize: 16, color: '#d97706', flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12.5, color: '#92400e' }}>
        Daily spending limit exceeded:{' '}
        <Box component="span" fontWeight={700}>
          ${spendUsd.toFixed(2)}
        </Box>{' '}
        of ${limitUsd.toFixed(2)} spent in the last 24 hours. You will be prompted before each AI
        generation.
      </Typography>
    </Box>
  )
}
