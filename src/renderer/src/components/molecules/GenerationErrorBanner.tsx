// Inline, persistent error banner for AI generation failures.
// Shown in-place when a generation call fails (generate:resume, generate:coverLetter,
// generate:matchReport, generate:feedback, generate:revise, masterCV:regenerate,
// writingProfile:regenerate). Persists until the user retries or navigates away.
//
// Four error types, per docs/design.md:
//   'network'        — network/timeout/server error (5xx); Retry button.
//   'rate-limit'     — 429; shows retry-after delay from the response headers if available;
//                       Retry button (disabled during countdown).
//   'auth'           — 401; specific message with a link to Settings to fix the API key.
//   'context-window' — context window exceeded; suggests a shorter JD or a larger model.
//
// STUB: Phase 6 — all four error types are rendered correctly; not yet wired into any
//   generation handler. State variables and countdown timer are commented out.
//
// TODO (Phase 6):
//   - In each generation call (SessionPage, MasterCVPage, WritingProfilePage):
//       catch errors from window.api.generate.* or window.api.*.regenerate;
//       map them to a GenerationError via parseGenerationError() and pass to this banner.
//   - parseGenerationError() should inspect error.status / error.message:
//       status 429 → 'rate-limit' (parse Retry-After header for retryAfterSeconds)
//       status 401 → 'auth'
//       message includes 'context_length_exceeded' or 'too many tokens' → 'context-window'
//       anything else → 'network'
//   - onRetry: re-invoke the same generation call that failed.
//   - onGoToSettings: dispatch(setActivePage('settings')) via useAppDispatch.
//   - 'rate-limit' countdown: implement a useEffect-based setInterval that ticks
//       secondsLeft down from retryAfterSeconds to 0; disable Retry until it reaches 0.
//       Clear the interval on unmount or when error changes.

import { Box, Button, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import SettingsIcon from '@mui/icons-material/Settings'

// The four generation error types defined in docs/design.md.
export type GenerationErrorKind = 'network' | 'rate-limit' | 'auth' | 'context-window'

export interface GenerationError {
  kind: GenerationErrorKind
  // For 'rate-limit': seconds until retry is allowed, parsed from the Retry-After header.
  // Optional — not all 429 responses include this header.
  retryAfterSeconds?: number
}

interface GenerationErrorBannerProps {
  // The error to display. Pass null or undefined to render nothing.
  error: GenerationError | null | undefined
  onRetry: () => void
  // Navigate to the Settings page. Used for 'auth' errors.
  onGoToSettings: () => void
}

// STUB: Phase 6
export default function GenerationErrorBanner({
  error,
  onRetry,
  onGoToSettings
}: GenerationErrorBannerProps): JSX.Element | null {
  if (!error) return null

  // TODO: const [secondsLeft, setSecondsLeft] = useState(error.retryAfterSeconds ?? 0)
  // TODO: useEffect(() => {
  //   if (error.kind !== 'rate-limit' || !error.retryAfterSeconds) return
  //   setSecondsLeft(error.retryAfterSeconds)
  //   const id = setInterval(() => {
  //     setSecondsLeft(s => {
  //       if (s <= 1) { clearInterval(id); return 0 }
  //       return s - 1
  //     })
  //   }, 1000)
  //   return () => clearInterval(id)
  // }, [error])

  return (
    <Box
      role="alert"
      sx={{
        bgcolor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 1.5,
        px: 2,
        py: 1.25,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        flexShrink: 0
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 16, color: '#dc2626', mt: 0.125, flexShrink: 0 }} />

      <Typography sx={{ flex: 1, fontSize: 13, color: '#b91c1c' }}>
        {generationErrorMessage(error)}
      </Typography>

      {/* Action — varies by error kind */}
      {error.kind === 'auth' ? (
        <Button
          size="small"
          startIcon={<SettingsIcon sx={{ fontSize: 14 }} />}
          onClick={onGoToSettings}
          sx={{ fontSize: 12, whiteSpace: 'nowrap', color: '#b91c1c' }}
        >
          Go to Settings
        </Button>
      ) : (
        // TODO: for 'rate-limit', disable when secondsLeft > 0 and show
        //   label `Retry in ${secondsLeft}s` until the countdown reaches 0.
        <Button
          size="small"
          onClick={onRetry}
          sx={{ fontSize: 12, whiteSpace: 'nowrap', color: '#b91c1c' }}
          // TODO: disabled={error.kind === 'rate-limit' && secondsLeft > 0}
        >
          {/* TODO: error.kind === 'rate-limit' && secondsLeft > 0 ? `Retry in ${secondsLeft}s` : 'Retry' */}
          Retry
        </Button>
      )}
    </Box>
  )
}

// Maps a GenerationError to the specific user-facing message from docs/design.md.
function generationErrorMessage(error: GenerationError): string {
  switch (error.kind) {
    case 'network':
      return 'Generation failed due to a network or server error.'
    case 'rate-limit':
      return error.retryAfterSeconds
        ? `Rate limited — retry in ${error.retryAfterSeconds}s.`
        : 'Rate limited — please retry in a moment.'
    case 'auth':
      return 'Authentication failed. Check your API key in Settings.'
    case 'context-window':
      return 'The job description or resume content is too long for the selected model. Try a model with a larger context window, or shorten the job description.'
  }
}

// ─── Parse Generation Error ───────────────────────────────────────────────────

// TODO (Phase 6): Implement this helper when wiring generation calls.
//   Inspect the error thrown by window.api.generate.* or window.api.*.regenerate
//   and map it to a GenerationError. The Anthropic SDK surfaces status codes in
//   error.status; parse the Retry-After header from error.headers for rate limits.
//
// export function parseGenerationError(err: unknown): GenerationError {
//   const e = err as { status?: number; message?: string; headers?: Record<string, string> }
//   if (e.status === 401) return { kind: 'auth' }
//   if (e.status === 429) {
//     const retryAfter = e.headers?.['retry-after']
//     return {
//       kind: 'rate-limit',
//       retryAfterSeconds: retryAfter ? parseInt(retryAfter, 10) : undefined
//     }
//   }
//   if (e.message?.includes('context_length_exceeded') || e.message?.includes('too many tokens')) {
//     return { kind: 'context-window' }
//   }
//   return { kind: 'network' }
// }
