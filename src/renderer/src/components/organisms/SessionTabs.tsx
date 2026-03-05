// Tab bar for the session view: Resume, Cover Letter, Match Report, Description.
// Token usage for the last AI operation is shown on the right side of the bar.
// When the 24h spending limit is exceeded, an orange badge appears left of the usage.
//
// STUB: Phase 1 — tab switching works.
// STUB: Phase 3 — token usage display and orange spending badge shells added;
//   lastAiOp reads from Redux (uiSlice), but is null until SessionPage dispatches setLastAiOp.
// TODO:
//   - Dispatch setLastAiOp in SessionPage after each generate:* IPC call completes.
//     The generate:* IPC handlers must return token counts for this to work; see uiSlice note.
//   - Fetch spendTotal via window.api.spendLog.getTotal() in SessionPage after each AI call;
//     pass down as a prop or store in a uiSlice field.
//   - Orange badge: shown when spendTotal.totalUsd > settings.spendingLimit > 0.
//   - Amber warning bar below tab bar: shown under the same condition (Phase 4).

import { Box, Tab, Tabs } from '@mui/material'
import { useAppSelector } from '../../hooks'
import UsageCounter from '../molecules/UsageCounter'

export type SessionTab = 'resume' | 'coverLetter' | 'matchReport' | 'description'

interface SessionTabsProps {
  activeTab: SessionTab
  onTabChange: (tab: SessionTab) => void
  spendUsd: number
  limitUsd: number
}

export default function SessionTabs({
  activeTab,
  onTabChange,
  spendUsd,
  limitUsd
}: SessionTabsProps): JSX.Element {
  const lastAiOp = useAppSelector((state) => state.ui.lastAiOp)

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

      <UsageCounter lastAiOp={lastAiOp} spendUsd={spendUsd} limitUsd={limitUsd} />
    </Box>
  )
}
