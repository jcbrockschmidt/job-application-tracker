// Writing Profile page: compact internal summary of the user's cover letter voice and style.
// Layout: page header / AI usage info bar / [spending warning] / scrollable content area.
// Scrollable content: [unincorporated cover letters banner] / profile card (text + edit + metadata)
//   or empty state when no profile has been generated yet.
//
// STUB: Phase 5 — page structure, profile card shell, and unincorporated banner rendered.
//   Data loading, inline editing, and regeneration are not yet wired.
// STUB: Phase 4 — SpendingWarningBanner placed; not yet connected to real spend data.
//
// TODO (Phase 5):
//   - Load writing profile on mount: window.api.writingProfile.get().then(setProfile)
//   - Load 24h spend total: window.api.spendLog.getTotal().then(setSpendTotal).
//     Re-fetch spend total after each AI call.
//   - Load unincorporated cover letters to populate the banner and sidebar badge count:
//       1. window.api.docs.getAll() — filter for type='cover_letter' with
//          writingProfileIncorporatedAt === null.
//       2. window.api.applications.getAll() — filter for coverLetterStatus='finalized' and
//          (coverLetterWritingProfileIncorporatedAt === null OR
//           coverLetterLastFinalizedAt > coverLetterWritingProfileIncorporatedAt).
//       Combine both source lists into an UnincorporatedCoverLetter[] array.
//   - Regenerate button (header + banner): call window.api.writingProfile.regenerate();
//       show LinearProgress while running; on success call setProfile(result).
//       After success, mark all included cover letters as incorporated:
//         - Source docs: window.api.docs.updateWritingProfileIncorporatedAt(id, now)
//           (or via a new docs:update IPC — add to IPC surface when wiring).
//         - Sessions: window.api.applications.update(id,
//             { coverLetterWritingProfileIncorporatedAt: now }) for each finalized session.
//   - Inline edit: clicking Edit turns the profile text into a resizable textarea;
//       Save calls window.api.writingProfile.save({ ...profile, text: draft, lastUpdatedAt: now });
//       Cancel restores the original text without saving.
//   - dispatch(setLastAiOp({ model, inputTokens, outputTokens, estimatedCostUsd })) after AI call.
//   - Update the sidebar badge count after each regeneration or page load
//     (pass unincorporatedCount down from here or store it in Redux — TBD when wiring).
// TODO (Phase 4):
//   - Wire SpendingWarningBanner: pass spendTotal.totalUsd and settings.spendingLimit.
//   - Wire SpendingLimitDialog before writingProfile:regenerate calls.

import { Box, Button, Divider, LinearProgress, Typography } from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import EditIcon from '@mui/icons-material/Edit'
import SpendingWarningBanner from '../molecules/SpendingWarningBanner'
import type { WritingProfile } from '@shared/types'

export default function WritingProfilePage(): JSX.Element {
  // TODO: const [profile, setProfile] = useState<WritingProfile | null>(null)
  // TODO: const [isLoading, setIsLoading] = useState(true)
  // TODO: const [isRegenerating, setIsRegenerating] = useState(false)
  // TODO: const [regenError, setRegenError] = useState<string | null>(null)
  // TODO: const [unincorporatedCoverLetters, setUnincorporatedCoverLetters] = useState<UnincorporatedCoverLetter[]>([])
  // TODO: const [spendTotal, setSpendTotal] = useState<SpendTotal | null>(null)
  // TODO: const lastAiOp = useAppSelector(state => state.ui.lastAiOp)
  // TODO: const settings = useAppSelector(state => state.settings)
  // TODO: const dispatch = useAppDispatch()

  // TODO: useEffect(() => {
  //   Promise.all([
  //     window.api.writingProfile.get(),
  //     window.api.spendLog.getTotal(),
  //     window.api.docs.getAll(),
  //     window.api.applications.getAll()
  //   ]).then(([prof, spend, docs, apps]) => {
  //     setProfile(prof)
  //     setSpendTotal(spend)
  //     const unincorpDocs = docs.filter(d =>
  //       d.type === 'cover_letter' && d.writingProfileIncorporatedAt === null
  //     )
  //     const unincorpSessions = apps.filter(a =>
  //       a.coverLetterStatus === 'finalized' &&
  //       (a.coverLetterWritingProfileIncorporatedAt === null ||
  //         (a.coverLetterLastFinalizedAt !== null &&
  //          a.coverLetterLastFinalizedAt > a.coverLetterWritingProfileIncorporatedAt))
  //     )
  //     setUnincorporatedCoverLetters([
  //       ...unincorpDocs.map(d => ({ id: d.id, name: d.filename, sourceType: 'doc' as const })),
  //       ...unincorpSessions.map(a => ({
  //         id: a.id, name: `${a.companyName} — ${a.roleTitle}`, sourceType: 'session' as const
  //       }))
  //     ])
  //   }).finally(() => setIsLoading(false))
  // }, [])

  // TODO: async function handleRegenerate() {
  //   if (settings.spendingLimit > 0) {
  //     const { totalUsd } = await window.api.spendLog.getTotal()
  //     if (totalUsd > settings.spendingLimit) { setShowSpendDialog(true); return }
  //   }
  //   setIsRegenerating(true)
  //   setRegenError(null)
  //   try {
  //     const result = await window.api.writingProfile.regenerate()
  //     setProfile(result)
  //     // TODO: dispatch(setLastAiOp({ model, inputTokens, outputTokens, estimatedCostUsd }))
  //     // TODO: mark all unincorporated cover letters as incorporated (see header TODOs above)
  //     // TODO: clear unincorporatedCoverLetters list
  //     await window.api.spendLog.getTotal().then(setSpendTotal)
  //   } catch (err) {
  //     setRegenError(String(err))
  //   } finally {
  //     setIsRegenerating(false)
  //   }
  // }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Page header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 52,
          flexShrink: 0
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 15 }}>
            Writing Profile
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            A compact summary of your cover letter voice, distilled from your uploaded letters
          </Typography>
        </Box>
        {/* TODO: onClick={() => handleRegenerate()}, disabled={isRegenerating || isLoading} */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AutoFixHighIcon sx={{ fontSize: 15 }} />}
          sx={{ fontSize: 12.5, whiteSpace: 'nowrap' }}
        >
          Regenerate
        </Button>
      </Box>

      {/* AI usage info bar — STUB: Phase 5 */}
      <AiUsageBar />

      {/* Spending-limit warning banner — STUB: Phase 4 */}
      {/* Shown when 24h rolling spend exceeds the configured limit (limit > 0). */}
      {/* TODO: replace placeholder 0 values with spendTotal.totalUsd and settings.spendingLimit */}
      <SpendingWarningBanner spendUsd={0} limitUsd={0} />

      {/* SpendingLimitDialog — STUB: Phase 4 */}
      {/* TODO: render before writingProfile:regenerate calls */}
      {/* <SpendingLimitDialog
            open={showSpendDialog}
            spendUsd={spendTotal?.totalUsd ?? 0}
            limitUsd={settings.spendingLimit}
            onCancel={() => setShowSpendDialog(false)}
            onGenerateAnyway={() => { setShowSpendDialog(false); handleRegenerate() }}
          /> */}

      {/* Regeneration loading indicator — STUB: Phase 5 */}
      {/* TODO: shown when isRegenerating === true */}
      {/* <LinearProgress sx={{ height: 2, flexShrink: 0 }} /> */}

      {/* Regeneration error — STUB: Phase 5 */}
      {/* TODO: shown when regenError !== null; include a Retry button */}
      {/* <Alert severity="error" action={<Button onClick={handleRegenerate}>Retry</Button>}>{regenError}</Alert> */}

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 4,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        {/* Unincorporated cover letters banner — STUB: Phase 5 */}
        {/* TODO: shown when unincorporatedCoverLetters.length > 0 */}
        {/* <UnincorporatedCoverLettersBanner
              coverLetters={unincorporatedCoverLetters}
              onRegenerate={handleRegenerate}
            /> */}
        <UnincorporatedCoverLettersBanner />

        {/* Profile card — STUB: Phase 5 */}
        {/* TODO: shown when profile !== null; show EmptyState when profile is null */}
        {/* TODO: pass profile={profile} */}
        <ProfileCard />
      </Box>
    </Box>
  )
}

// ─── AI Usage Info Bar ────────────────────────────────────────────────────────

// STUB: Phase 5 — renders placeholder text; not yet connected to real data.
// Same pattern as AiUsageBar in MasterCVPage.
// TODO:
//   - Read lastAiOp from uiSlice (state.ui.lastAiOp) for per-operation token counts and cost.
//   - Read spendTotal from local component state (fetched via window.api.spendLog.getTotal).
//   - Read settings.spendingLimit from Redux.
//   - When lastAiOp is null, show "No AI operation yet".
//   - When spendingLimit > 0, show "24h: $X.XX / $Y.YY"; turn spend text orange when over limit.
function AiUsageBar(): JSX.Element {
  // TODO: const lastAiOp = useAppSelector(state => state.ui.lastAiOp)
  // TODO: const spendingLimit = useAppSelector(state => state.settings.spendingLimit)
  return (
    <Box
      sx={{
        bgcolor: '#f9fafb',
        borderBottom: '1px solid #e8ecf0',
        px: 3,
        py: 0.75,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        flexShrink: 0
      }}
    >
      {/* TODO: when lastAiOp is set, render: "{model} · {inputTokens}k in · {outputTokens} out · ~${estimatedCostUsd.toFixed(3)}" */}
      <Typography sx={{ fontSize: 11.5, color: '#9eaab5' }}>
        {/* e.g. "claude-sonnet-4-6  ·  Last run: 12.4k in · 1.1k out · ~$0.04" */}
        No AI operation yet
      </Typography>
      <Box sx={{ flex: 1 }} />
      {/* TODO: render "24h: ${spendTotal.totalUsd.toFixed(2)} / ${spendingLimit.toFixed(2)}" when spendingLimit > 0 */}
      {/* TODO: color="error" when spendTotal.totalUsd > spendingLimit */}
      <Typography sx={{ fontSize: 11.5, color: '#9eaab5' }}>
        {/* e.g. "24h: $0.04 / $5.00" */}
        24h spend: —
      </Typography>
    </Box>
  )
}

// ─── Unincorporated Cover Letters Banner ──────────────────────────────────────

// STUB: Phase 5 — shape rendered with placeholder content; hidden in practice until
//   real unincorporated cover letter data is passed in.
// TODO:
//   - Accept props: coverLetters: UnincorporatedCoverLetter[], onRegenerate: () => void.
//   - Return null when coverLetters.length === 0.
//   - Each cover letter listed as a Chip: name + "Source Doc" or "Session" type tag.
//   - Regenerate button calls onRegenerate().
//   - After regeneration commits, all listed cover letters have their incorporation
//     timestamp set (via IPC — see WritingProfilePage TODO above).
//
// UnincorporatedCoverLetter shape (define locally when wiring):
//   { id: string; name: string; sourceType: 'doc' | 'session' }
function UnincorporatedCoverLettersBanner(): JSX.Element {
  // Rendered as empty so the banner doesn't appear until real data is wired.
  // TODO: accept coverLetters prop; return null when coverLetters.length === 0.
  const PLACEHOLDER_COVER_LETTERS: Array<{
    id: string
    name: string
    sourceType: 'doc' | 'session'
  }> = []

  if (PLACEHOLDER_COVER_LETTERS.length === 0) return <></>

  return (
    <Box
      sx={{
        bgcolor: '#fffbeb',
        border: '1px solid #fcd34d',
        borderRadius: 2,
        px: 2.5,
        py: 2,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        flexShrink: 0
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={600} sx={{ fontSize: 13, color: '#92400e', mb: 0.75 }}>
          Unincorporated cover letters
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#78350f', mb: 1.25 }}>
          The following cover letters have not yet been reflected in the writing profile:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {/* TODO: PLACEHOLDER_COVER_LETTERS.map(cl => ( */}
          {/*   <Chip key={cl.id} size="small" */}
          {/*     label={`${cl.name} · ${cl.sourceType === 'doc' ? 'Source Doc' : 'Session'}`} */}
          {/*     sx={{ fontSize: 11.5, bgcolor: '#fef3c7', color: '#92400e' }} */}
          {/*   /> */}
          {/* )) */}
        </Box>
      </Box>
      {/* TODO: onClick={() => onRegenerate()} */}
      <Button
        variant="contained"
        size="small"
        startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
        sx={{ fontSize: 12, whiteSpace: 'nowrap', alignSelf: 'center' }}
      >
        Regenerate
      </Button>
    </Box>
  )
}

// ─── Profile Card ─────────────────────────────────────────────────────────────

// STUB: Phase 5 — card shape with Edit button and metadata rendered; not yet wired to data.
// TODO:
//   - Accept profile: WritingProfile | null prop.
//   - When profile is null, render EmptyState instead of this card.
//   - When profile is set, show profile.text in the card body.
//   - Metadata row: "Last updated {formatDate(profile.lastUpdatedAt)} · Derived from
//     {profile.derivedFromCount} {profile.derivedFromCount === 1 ? 'letter' : 'letters'}"
//   - Edit button onClick: set isEditing = true; replace text with a resizable textarea
//     pre-filled with profile.text.
//   - Save onClick (while editing): call window.api.writingProfile.save({
//       ...profile, text: draftText, lastUpdatedAt: new Date().toISOString()
//     }); set isEditing = false.
//   - Cancel onClick (while editing): restore original text; set isEditing = false.
function ProfileCard(_props: { profile?: WritingProfile | null }): JSX.Element {
  // TODO: const [isEditing, setIsEditing] = useState(false)
  // TODO: const [draftText, setDraftText] = useState(profile?.text ?? '')
  // TODO: const [isSaving, setIsSaving] = useState(false)

  return (
    <Box
      sx={{
        bgcolor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f3f4f6'
        }}
      >
        <Typography fontWeight={700} sx={{ fontSize: 13.5, color: '#111827', flex: 1 }}>
          Your writing profile
        </Typography>
        {/* TODO: onClick={() => setIsEditing(true)}, hidden when isEditing === true */}
        <Button
          size="small"
          startIcon={<EditIcon sx={{ fontSize: 13 }} />}
          sx={{ fontSize: 12, color: '#6b7280' }}
        >
          Edit
        </Button>
      </Box>

      {/* Profile text — STUB: Phase 5 */}
      <Box sx={{ px: 2.5, py: 2 }}>
        {/* TODO: when isEditing, render a resizable textarea (TextField multiline) instead */}
        {/* TODO: replace placeholder text with profile.text once data is wired */}
        <Typography
          sx={{
            fontSize: 13,
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
            fontStyle: 'italic',
            color: '#9ca3af'
          }}
        >
          {/* Placeholder shown during development; remove once writingProfile:get is wired */}
          Profile text will appear here once generated. Click Regenerate to derive your writing
          profile from uploaded cover letters and finalized session cover letters.
        </Typography>

        {/* Edit action row — STUB: Phase 5 */}
        {/* TODO: shown only when isEditing === true */}
        {/* <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Button size="small" variant="contained" disableElevation
                disabled={isSaving}
                onClick={handleSave}>
                Save
              </Button>
              <Button size="small" onClick={() => setIsEditing(false)}>Cancel</Button>
            </Box> */}
      </Box>

      <Divider />

      {/* Metadata row */}
      <Box sx={{ px: 2.5, py: 1.25 }}>
        {/* TODO: show profile.lastUpdatedAt and profile.derivedFromCount when profile is set */}
        <Typography sx={{ fontSize: 11.5, color: '#9ca3af' }}>
          {/* e.g. "Last updated Feb 27, 2026 · Derived from 4 letters" */}
          No profile generated yet
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

// STUB: Phase 5 — shown when profile === null (no profile has been generated yet).
// TODO:
//   - Render this instead of ProfileCard when window.api.writingProfile.get() returns null.
//   - Regenerate button here calls handleRegenerate() in the parent.
//   - If no cover letters exist at all (docs.getAll() returns no cover_letter type docs and
//     no sessions have coverLetterStatus='finalized'), show a different message explaining
//     that the user needs to upload a cover letter or generate one in a session first.
//
// function EmptyState({ onRegenerate }: { onRegenerate: () => void }): JSX.Element {
//   return (
//     <Box sx={{ textAlign: 'center', py: 8 }}>
//       <EditNoteIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
//       <Typography fontWeight={600} sx={{ fontSize: 15, color: '#374151', mb: 1 }}>
//         No writing profile yet
//       </Typography>
//       <Typography sx={{ fontSize: 13, color: '#9ca3af', mb: 3, maxWidth: 400, mx: 'auto' }}>
//         Generate a writing profile from your cover letters to help maintain a consistent
//         voice across all future cover letters.
//       </Typography>
//       <Button variant="contained" disableElevation startIcon={<AutoFixHighIcon />}
//         onClick={onRegenerate}>
//         Generate writing profile
//       </Button>
//     </Box>
//   )
// }
