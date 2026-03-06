// Displays token usage for the last AI operation and the 24h rolling spend total.
// Used in the Session tab bar, Master CV page, and Writing Profile page.
//
// Props:
//   - lastAiOp: details of the last AI call (model, tokens, cost).
//   - spendUsd: total estimated spend in the last 24 hours.
//   - limitUsd: user-configured spending limit (0 = disabled).
//   - showLastOp: if true, shows the details of the last AI operation.
//   - showRollingTotal: if true, shows the rolling 24h spend total vs. limit.

import { Box, Typography, Tooltip } from '@mui/material'
import { useAppSelector } from '../../hooks'
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
  const settings = useAppSelector((state) => state.settings)
  const overLimit = limitUsd > 0 && spendUsd > limitUsd
  const currentModel = lastAiOp?.model ?? settings.model

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography sx={{ fontSize: 11.5, color: '#9eaab5', whiteSpace: 'nowrap' }}>
        {showRollingTotal && (
          <Tooltip
            title={
              limitUsd > 0
                ? `Rolling 24h spend vs. $${limitUsd.toFixed(2)} limit`
                : 'Rolling 24h spend'
            }
            arrow
          >
            <Box
              component="span"
              sx={{
                color: overLimit ? '#e65100' : 'inherit',
                fontWeight: overLimit ? 700 : 'inherit'
              }}
            >
              24h: ${spendUsd.toFixed(2)}
            </Box>
          </Tooltip>
        )}

        {showRollingTotal && showLastOp && ' • '}

        {showLastOp && (
          <Tooltip title="Estimated cost of the last AI operation performed" arrow>
            <Box component="span">Last: ${lastAiOp?.estimatedCostUsd.toFixed(3) ?? '0.000'}</Box>
          </Tooltip>
        )}

        {' • '}

        <Tooltip title="Current AI model" arrow>
          <Box component="span">{currentModel}</Box>
        </Tooltip>
      </Typography>
    </Box>
  )
}
