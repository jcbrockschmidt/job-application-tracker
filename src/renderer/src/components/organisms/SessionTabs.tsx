// Tab bar for the session view: Resume, Cover Letter, Match Report, Description.
// Token usage for the last AI operation is shown on the right side of the bar.
// When the 24h spending limit is exceeded, an orange badge appears left of the usage.
//
// STUB: Phase 1 — tab switching works; token usage and spending badge are placeholder.
// TODO:
//   - Show token usage (model, in/out counts, estimated cost) after any AI call.
//     Sourced from a uiSlice field populated after each IPC call completes.
//   - Show orange spending-limit badge when 24h spend > configured limit (Phase 3)
//   - Show amber warning bar below the tab bar when limit is exceeded (Phase 3)

import { Box, Tab, Tabs, Typography } from '@mui/material'

export type SessionTab = 'resume' | 'coverLetter' | 'matchReport' | 'description'

interface SessionTabsProps {
  activeTab: SessionTab
  onTabChange: (tab: SessionTab) => void
}

export default function SessionTabs({ activeTab, onTabChange }: SessionTabsProps): JSX.Element {
  // TODO: const lastAiOp = useAppSelector(state => state.ui.lastAiOp)
  // TODO: const overSpendLimit = useAppSelector(state => ...)

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        flexShrink: 0
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_e, val) => onTabChange(val as SessionTab)}
        sx={{ minHeight: 0, '& .MuiTab-root': { fontSize: 13.5, minHeight: 44, py: 0 } }}
      >
        <Tab label="Resume" value="resume" />
        <Tab label="Cover Letter" value="coverLetter" />
        <Tab label="Match Report" value="matchReport" />
        <Tab label="Description" value="description" />
      </Tabs>

      <Box sx={{ flex: 1 }} />

      {/* TODO: orange spending-limit badge (Phase 3) */}

      {/* Token usage for last AI operation */}
      {/* TODO: populate from uiSlice.lastAiOp after each generation call */}
      <Typography sx={{ fontSize: 11.5, color: '#9eaab5', pr: 0.5, whiteSpace: 'nowrap' }}>
        {/* e.g. "claude-sonnet-4-6 · 4.2k in · 812 out · ~$0.02" */}
        —
      </Typography>
    </Box>
  )
}
