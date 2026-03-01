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

import { Box, Tab, Tabs, Typography } from '@mui/material'
import { useAppSelector } from '../../hooks'

export type SessionTab = 'resume' | 'coverLetter' | 'matchReport' | 'description'

interface SessionTabsProps {
  activeTab: SessionTab
  onTabChange: (tab: SessionTab) => void
}

export default function SessionTabs({ activeTab, onTabChange }: SessionTabsProps): JSX.Element {
  // STUB: Phase 3 — null until the first AI call in this session dispatches setLastAiOp.
  const lastAiOp = useAppSelector((state) => state.ui.lastAiOp)
  // TODO: read spendTotal from local SessionPage state (passed as prop) or a uiSlice field
  // TODO: const spendingLimit = useAppSelector(state => state.settings.spendingLimit)
  // TODO: const overLimit = spendingLimit > 0 && spendTotal !== null && spendTotal.totalUsd > spendingLimit

  const tokenUsageText = lastAiOp
    ? `${lastAiOp.model} · ${lastAiOp.inputTokens.toLocaleString()} in · ${lastAiOp.outputTokens.toLocaleString()} out · ~$${lastAiOp.estimatedCostUsd.toFixed(3)}`
    : '—'

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

      {/* Spending-limit badge — STUB: Phase 3 */}
      {/* TODO: shown when overLimit */}
      {/* TODO: display "$X.XX / $Y.YY" using spendTotal.totalUsd and settings.spendingLimit */}
      {/* {overLimit && (
        <Chip
          label={`$${spendTotal.totalUsd.toFixed(2)} / $${spendingLimit.toFixed(2)}`}
          size="small"
          sx={{ fontSize: 10.5, height: 20, bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, mr: 1 }}
        />
      )} */}

      {/* Token usage for last AI operation — STUB: Phase 3 */}
      {/* Populated once SessionPage dispatches setLastAiOp after a generate:* call */}
      <Typography sx={{ fontSize: 11.5, color: '#9eaab5', pr: 0.5, whiteSpace: 'nowrap' }}>
        {/* e.g. "claude-sonnet-4-6 · 4.2k in · 812 out · ~$0.02" */}
        {tokenUsageText}
      </Typography>
    </Box>
  )
}
