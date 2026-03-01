// Inline revision panel — expands beneath a bullet, experience entry, or section
// when the user clicks any "Revise with AI" button.
//
// STUB: Phase 4 — structure and diff view shape rendered; AI call not yet wired.
// TODO:
//   - Pass sessionId and scope down from ResumePaper / CoverLetterPaper (add as props).
//   - Check spending limit before calling: if 24h spend > limit > 0, open SpendingLimitDialog.
//   - Call window.api.generate.revise(sessionId, scope, instruction.trim()) on Submit.
//   - Show MUI LinearProgress while the call is in flight.
//   - On success: call setProposedText(result); hide the instruction input.
//   - On error: show inline Alert with a Retry button; map error types to specific messages
//     (network → "Could not reach the API", auth 401 → "Check your API key in Settings",
//      rate limit → "Rate limited — try again in Xs", context exceeded → suggest shorter input).
//   - dispatch setLastAiOp({ model, inputTokens, outputTokens, estimatedCostUsd }) after success.
//
// RevisionDiffView (below) is co-located here because it is only used by this panel.

import { Box, Button, LinearProgress, TextField, Typography } from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'

interface InlineRevisionPanelProps {
  // Identifies what is being revised: a bullet ID, experience entry ID, or section
  // name ('experience' | 'skills' | 'coverLetter'). Passed to generate:revise as-is.
  // TODO: thread sessionId in from the parent (ResumePaper / CoverLetterPaper).
  scope: string
  // The current text of the item being revised, shown in the diff view Before row.
  currentText: string
  onAccept: (newText: string) => void
  onClose: () => void
}

// STUB: Phase 4
export default function InlineRevisionPanel({
  currentText,
  onClose
}: InlineRevisionPanelProps): JSX.Element {
  // TODO: const [instruction, setInstruction] = useState('')
  // TODO: const [isLoading, setIsLoading] = useState(false)
  // TODO: const [proposedText, setProposedText] = useState<string | null>(null)
  // TODO: const [error, setError] = useState<string | null>(null)
  // TODO: const spendingLimit = useAppSelector(state => state.settings.spendingLimit)
  // TODO: const [showSpendDialog, setShowSpendDialog] = useState(false)

  // TODO: async function handleSubmit() {
  //   if (spendingLimit > 0) {
  //     const { totalUsd } = await window.api.spendLog.getTotal()
  //     if (totalUsd > spendingLimit) { setShowSpendDialog(true); return }
  //   }
  //   setIsLoading(true); setError(null)
  //   try {
  //     const result = await window.api.generate.revise(sessionId, scope, instruction.trim())
  //     setProposedText(result)
  //     // dispatch(setLastAiOp({ ... }))
  //   } catch (err) {
  //     setError(String(err))
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <Box
      sx={{
        mt: 0.75,
        border: '1px solid #e0e7ff',
        borderRadius: 1.5,
        bgcolor: '#fafbff',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {/* Instruction input — hidden once proposedText is set */}
      {/* TODO: hide when proposedText !== null (diff view replaces it) */}
      <TextField
        placeholder="Leave blank for general improvement…"
        size="small"
        multiline
        minRows={2}
        maxRows={5}
        fullWidth
        // TODO: value={instruction} onChange={e => setInstruction(e.target.value)}
        sx={{ fontSize: 12 }}
      />

      {/* Action row */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          size="small"
          variant="contained"
          disableElevation
          startIcon={<AutoFixHighIcon sx={{ fontSize: 13 }} />}
          // TODO: onClick={handleSubmit} disabled={isLoading}
          sx={{ fontSize: 12 }}
        >
          Revise
        </Button>
        <Button size="small" onClick={onClose} sx={{ fontSize: 12, color: '#6b7280' }}>
          Cancel
        </Button>
      </Box>

      {/* Loading indicator — STUB: Phase 4 */}
      {/* TODO: render when isLoading === true */}
      {/* <LinearProgress sx={{ borderRadius: 1 }} /> */}

      {/* Error — STUB: Phase 4 */}
      {/* TODO: render when error !== null; map to specific user-facing messages */}
      {/* <Alert severity="error" action={<Button size="small" onClick={handleSubmit}>Retry</Button>}>{error}</Alert> */}

      {/* Diff view — STUB: Phase 4 */}
      {/* TODO: render when proposedText !== null */}
      {/* <RevisionDiffView
            currentText={currentText}
            proposedText={proposedText}
            onAccept={() => { onAccept(proposedText!); onClose() }}
            onReject={() => setProposedText(null)}
          /> */}

      {/* Placeholder diff — visible during development so the card shape is reviewable. */}
      {/* Remove this once the real proposedText state is wired. */}
      <RevisionDiffView
        currentText={currentText}
        proposedText="[Proposed revision will appear here after submitting]"
        onAccept={() => {}}
        onReject={() => {}}
      />

      {/* SpendingLimitDialog — STUB: Phase 4 */}
      {/* TODO: <SpendingLimitDialog
            open={showSpendDialog}
            spendUsd={currentSpend}
            limitUsd={spendingLimit}
            onCancel={() => setShowSpendDialog(false)}
            onGenerateAnyway={() => { setShowSpendDialog(false); handleSubmit() }}
          /> */}
    </Box>
  )
}

// ─── Revision Diff View ───────────────────────────────────────────────────────

// Before/after diff card shown after generate:revise returns a proposal.
//
// STUB: Phase 4 — card shape complete; Accept is not yet wired to the undo/redo
// stack or to the parent editor state.
// TODO:
//   - onAccept: apply proposedText to the document; push the original text onto the
//     undo stack via useUndoRedo (or dispatch a Redux updateSession action with the
//     edited field). Call onClose on the InlineRevisionPanel.
//   - onReject: clear proposedText, return the panel to instruction-entry state.

interface RevisionDiffViewProps {
  currentText: string
  proposedText: string
  onAccept: () => void
  onReject: () => void
}

export function RevisionDiffView({
  currentText,
  proposedText,
  onAccept,
  onReject
}: RevisionDiffViewProps): JSX.Element {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {/* Before row — red background, strikethrough */}
      <Box
        sx={{
          bgcolor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 1,
          px: 1.5,
          py: 0.875,
          fontSize: 12,
          color: '#7f1d1d',
          textDecoration: 'line-through',
          lineHeight: 1.6
        }}
      >
        {currentText}
      </Box>

      {/* After row — green background */}
      <Box
        sx={{
          bgcolor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 1,
          px: 1.5,
          py: 0.875,
          fontSize: 12,
          color: '#14532d',
          lineHeight: 1.6
        }}
      >
        {proposedText}
      </Box>

      {/* Accept / Reject */}
      <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
        {/* TODO: wire to undo stack before calling onAccept */}
        <Button
          size="small"
          variant="contained"
          disableElevation
          onClick={onAccept}
          sx={{ fontSize: 12 }}
        >
          Accept
        </Button>
        <Button size="small" onClick={onReject} sx={{ fontSize: 12, color: '#6b7280' }}>
          Reject
        </Button>
      </Box>

      <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
        Accepted changes can be undone with Ctrl+Z.
      </Typography>
    </Box>
  )
}
