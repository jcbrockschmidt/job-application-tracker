// Dialog shown before any AI generation call when the rolling 24-hour estimated
// spend exceeds the configured spending limit.
//
// The user must explicitly choose "Cancel" or "Generate Anyway" — the dialog
// cannot be dismissed by clicking the backdrop.
//
// STUB: Phase 4 — dialog shape complete; not yet wired into the generation flow.
// TODO: Show this dialog before all AI calls in SessionPage and MasterCVPage:
//   generate:resume (re-generation), generate:coverLetter, generate:matchReport,
//   generate:feedback, generate:revise, masterCV:regenerate, writingProfile:regenerate.
//
// Typical caller pattern:
//   const [showSpendDialog, setShowSpendDialog] = useState(false)
//   async function handleGenerate() {
//     if (spendingLimit > 0) {
//       const { totalUsd } = await window.api.spendLog.getTotal()
//       if (totalUsd > spendingLimit) {
//         setCurrentSpend(totalUsd)
//         setShowSpendDialog(true)
//         return   // wait for user decision
//       }
//     }
//     runActualGeneration()
//   }
//   <SpendingLimitDialog
//     open={showSpendDialog}
//     spendUsd={currentSpend}
//     limitUsd={spendingLimit}
//     onCancel={() => setShowSpendDialog(false)}
//     onGenerateAnyway={() => { setShowSpendDialog(false); runActualGeneration() }}
//   />

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

interface SpendingLimitDialogProps {
  open: boolean
  // Rolling 24-hour estimated spend in USD.
  spendUsd: number
  // Configured daily spending limit in USD.
  limitUsd: number
  onCancel: () => void
  onGenerateAnyway: () => void
}

// STUB: Phase 4
export default function SpendingLimitDialog({
  open,
  spendUsd,
  limitUsd,
  onCancel,
  onGenerateAnyway
}: SpendingLimitDialogProps): JSX.Element {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      // Require an explicit button click to dismiss — no backdrop close.
      // TODO: consider keeping disableEscapeKeyDown={false} so Escape = Cancel.
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <WarningAmberIcon sx={{ color: '#d97706', fontSize: 22 }} />
        Spending limit exceeded
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ fontSize: 13.5, color: '#374151', mb: 1.5 }}>
          Your 24-hour estimated spend has exceeded the configured limit.
        </DialogContentText>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.375, mb: 1.5 }}>
          <Typography sx={{ fontSize: 13, color: '#374151' }}>
            Current spend:{' '}
            <Box component="span" fontWeight={700} color="#b91c1c">
              ${spendUsd.toFixed(2)}
            </Box>
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#374151' }}>
            Limit:{' '}
            <Box component="span" fontWeight={700}>
              ${limitUsd.toFixed(2)}
            </Box>
          </Typography>
        </Box>

        <DialogContentText sx={{ fontSize: 12.5, color: '#6b7280' }}>
          Costs are estimates based on published model pricing and may not match actual charges. You
          can update the limit in Settings.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onCancel} sx={{ fontSize: 13 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={onGenerateAnyway}
          color="warning"
          sx={{ fontSize: 13 }}
        >
          Generate Anyway
        </Button>
      </DialogActions>
    </Dialog>
  )
}
