// Displays token usage for the last AI operation and the 24h rolling spend total.
// Used in the Session tab bar, Master CV page, and Writing Profile page.
//
// Props:
//   - lastAiOp: details of the last AI call (model, tokens, cost).
//   - spendUsd: total estimated spend in the last 24 hours.
//   - limitUsd: user-configured spending limit (0 = disabled).
//   - showLastOp: if true, shows the details of the last AI operation.
//   - showRollingTotal: if true, shows the rolling 24h spend total vs. limit.

import { Box, Chip, Typography, Tooltip } from '@mui/material'
import type { LastAiOp } from '@shared/types'

interface UsageCounterProps {
  lastAiOp: LastAiOp | null
  spendUsd: number
  limitUsd: number
  showLastOp?: boolean
  showRollingTotal?: boolean
}

export default function UsageCounter({
  lastAiOp,
  spendUsd,
  limitUsd,
  showLastOp = true,
  showRollingTotal = true
}: UsageCounterProps): JSX.Element {
  const overLimit = limitUsd > 0 && spendUsd > limitUsd

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {showRollingTotal && limitUsd > 0 && (
        <Tooltip title="Rolling 24h estimated spend vs. limit" arrow>
          <Chip
            label={`24h: $${spendUsd.toFixed(2)} / $${limitUsd.toFixed(2)}`}
            size="small"
            sx={{
              fontSize: 10.5,
              height: 20,
              bgcolor: overLimit ? '#fff3e0' : '#f3f4f6',
              color: overLimit ? '#e65100' : '#6b7280',
              fontWeight: 700,
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </Tooltip>
      )}

      {showRollingTotal && limitUsd === 0 && (
        <Tooltip title="Rolling 24h estimated spend" arrow>
          <Typography sx={{ fontSize: 11.5, color: '#9eaab5', whiteSpace: 'nowrap' }}>
            24h spend: ${spendUsd.toFixed(2)}
          </Typography>
        </Tooltip>
      )}

      {showLastOp && lastAiOp && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: 11.5, color: '#9eaab5', whiteSpace: 'nowrap' }}>
            {lastAiOp.model} · {lastAiOp.inputTokens.toLocaleString()} in ·{' '}
            {lastAiOp.outputTokens.toLocaleString()} out ·
          </Typography>
          <Tooltip title="Estimated cost of the last AI operation performed" arrow>
            <Typography sx={{ fontSize: 11.5, color: '#9eaab5', whiteSpace: 'nowrap' }}>
              Last: ${lastAiOp.estimatedCostUsd.toFixed(3)}
            </Typography>
          </Tooltip>
        </Box>
      )}

      {showLastOp && !lastAiOp && (
        <Typography sx={{ fontSize: 11.5, color: '#9eaab5', whiteSpace: 'nowrap' }}>
          No AI operation yet
        </Typography>
      )}
    </Box>
  )
}
