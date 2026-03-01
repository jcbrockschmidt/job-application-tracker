// Feedback prompt bar — shown above the resume paper in the Resume tab and above
// the cover letter paper in the Cover Letter tab.
//
// Contains an optional freeform textarea and a "Get Feedback" button. After the
// generate:feedback call succeeds, renders a list of FeedbackSuggestionCards below.
//
// STUB: Phase 4 — bar shape rendered; AI call, suggestion list, and spending-limit
// gate not yet wired.
// TODO:
//   - Check spending limit before calling: read spendingLimit from settingsSlice and
//     call window.api.spendLog.getTotal(); if totalUsd > limit > 0, open SpendingLimitDialog.
//   - Call window.api.generate.feedback(sessionId, documentType, prompt.trim() || undefined).
//   - Show MUI LinearProgress while loading.
//   - On success: set suggestions list; dispatch setLastAiOp with token info.
//   - On error: show inline Alert; map error types to specific messages:
//       401 → "Check your API key in Settings"
//       429 → "Rate limited — try again in Xs"
//       context exceeded → "The document or JD is too long for the selected model"
//       network/5xx → generic retry message
//   - "Dismiss All" button clears all suggestions from local state.
//   - Per-card onAccept: if suggestion has proposedText, resolve the current text of
//     item.target from the document JSON (needs a resolver prop or inline lookup),
//     push old text onto the undo stack, apply proposedText.
//   - Per-card onDismiss: remove from local suggestions array.
//   - Track remaining count ("N of M remaining") in the section header.

import { useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import FeedbackSuggestionCard from './FeedbackSuggestionCard'
import type { DocumentType, FeedbackItem } from '@shared/types'

interface FeedbackPromptBarProps {
  sessionId: string
  documentType: DocumentType
  // Called when the user accepts a suggestion that has a concrete proposedText.
  // target: the FeedbackItem.target string; newText: the accepted replacement.
  // TODO: refine this signature once the document editing model is finalized.
  onApplyChange: (target: string, newText: string) => void
}

// STUB: Phase 4
export default function FeedbackPromptBar({
  // sessionId,     // TODO: pass to window.api.generate.feedback
  // documentType,  // TODO: pass to window.api.generate.feedback
  // onApplyChange  // TODO: call from onAccept handler
}: FeedbackPromptBarProps): JSX.Element {
  // TODO: const [prompt, setPrompt] = useState('')
  // TODO: const [isLoading, setIsLoading] = useState(false)
  // TODO: const [suggestions, setSuggestions] = useState<FeedbackItem[]>([])
  // TODO: const [totalSuggested, setTotalSuggested] = useState(0)
  // TODO: const [error, setError] = useState<string | null>(null)
  // TODO: const spendingLimit = useAppSelector(state => state.settings.spendingLimit)
  // TODO: const [showSpendDialog, setShowSpendDialog] = useState(false)
  // TODO: const [currentSpend, setCurrentSpend] = useState(0)

  // TODO: async function handleGetFeedback() {
  //   if (spendingLimit > 0) {
  //     const { totalUsd } = await window.api.spendLog.getTotal()
  //     setCurrentSpend(totalUsd)
  //     if (totalUsd > spendingLimit) { setShowSpendDialog(true); return }
  //   }
  //   setIsLoading(true); setError(null)
  //   try {
  //     const result = await window.api.generate.feedback(sessionId, documentType, prompt.trim() || undefined)
  //     setSuggestions(result)
  //     setTotalSuggested(result.length)
  //     // dispatch(setLastAiOp({ model, inputTokens, outputTokens, estimatedCostUsd }))
  //   } catch (err) {
  //     setError(String(err))
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // Placeholder for layout reference — replace with suggestions state when wired.
  const PLACEHOLDER_SUGGESTIONS: FeedbackItem[] = []
  const remaining = PLACEHOLDER_SUGGESTIONS.length
  const total = PLACEHOLDER_SUGGESTIONS.length // TODO: use totalSuggested state

  return (
    <Box sx={{ width: 720, minWidth: 720, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Prompt input + Get Feedback button */}
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          px: 2.5,
          py: 2,
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}
      >
        <TextField
          placeholder="Focus on ATS keywords, tone, conciseness… (leave blank for general feedback)"
          size="small"
          multiline
          minRows={1}
          maxRows={4}
          fullWidth
          // TODO: value={prompt} onChange={e => setPrompt(e.target.value)}
          sx={{ fontSize: 12.5 }}
        />
        <Button
          variant="contained"
          disableElevation
          size="small"
          startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
          // TODO: onClick={handleGetFeedback} disabled={isLoading}
          sx={{ fontSize: 12.5, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Get Feedback
        </Button>
      </Box>

      {/* Loading indicator — STUB: Phase 4 */}
      {/* TODO: render when isLoading === true */}
      {/* <LinearProgress sx={{ borderRadius: 1 }} /> */}

      {/* Error — STUB: Phase 4 */}
      {/* TODO: render when error !== null; include specific messages per error type */}
      {/* <Alert severity="error" action={<Button size="small" onClick={handleGetFeedback}>Retry</Button>}>{error}</Alert> */}

      {/* Suggestions list — STUB: Phase 4 */}
      {PLACEHOLDER_SUGGESTIONS.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Section header: remaining count + Dismiss All */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography fontWeight={600} sx={{ fontSize: 12.5, color: '#374151', flex: 1 }}>
              {/* TODO: "{remaining} of {total} remaining" using state */}
              Feedback ({remaining} of {total} remaining)
            </Typography>
            {/* TODO: onClick={() => setSuggestions([])} */}
            <Button size="small" sx={{ fontSize: 11.5, color: '#6b7280' }}>
              Dismiss All
            </Button>
          </Box>

          {/* TODO: render real suggestions once wired */}
          {/* {suggestions.map(item => (
                <FeedbackSuggestionCard
                  key={item.id}
                  item={item}
                  onAccept={(id) => {
                    const accepted = suggestions.find(s => s.id === id)!
                    if (accepted.proposedText) onApplyChange(accepted.target, accepted.proposedText)
                    setSuggestions(prev => prev.filter(s => s.id !== id))
                  }}
                  onDismiss={(id) => setSuggestions(prev => prev.filter(s => s.id !== id))}
                />
              ))} */}
          {PLACEHOLDER_SUGGESTIONS.map((item) => (
            <FeedbackSuggestionCard
              key={item.id}
              item={item}
              onAccept={() => {}}
              onDismiss={() => {}}
            />
          ))}
        </Box>
      )}

      {/* SpendingLimitDialog — STUB: Phase 4 */}
      {/* TODO: <SpendingLimitDialog
            open={showSpendDialog}
            spendUsd={currentSpend}
            limitUsd={spendingLimit}
            onCancel={() => setShowSpendDialog(false)}
            onGenerateAnyway={() => { setShowSpendDialog(false); handleGetFeedback() }}
          /> */}
    </Box>
  )
}
