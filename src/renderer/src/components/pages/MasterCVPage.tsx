// Master CV page: comprehensive, permanent record of all professional experience.
// Layout: page header / AI usage info bar / [unincorporated docs banner] /
//         [regeneration review panel] / Experience section / Education section / Skills section.
//
// STUB: Phase 3 — page structure, section scaffolding, and all sub-component shells rendered.
//   Data loading, all CRUD actions, and regeneration review are not yet wired.
// STUB: Phase 4 — SpendingWarningBanner and SpendingLimitDialog placed; not yet connected
//   to real spend data or the regeneration flow.
// TODO (Phase 3):
//   - Load Master CV on mount: window.api.masterCV.get().then(setMasterCV)
//   - Load 24h spend total: window.api.spendLog.getTotal().then(setSpendTotal)
//     Re-fetch spend total after each AI call.
//   - Load unincorporated docs: window.api.applications.getAll(), then filter:
//     a doc is unincorporated when lastFinalizedAt is set and
//     (incorporatedAt is null OR lastFinalizedAt > incorporatedAt).
//   - Regenerate button / banner Regenerate button: call window.api.masterCV.regenerate(docIds?);
//     show LinearProgress while running; on success populate suggestions list.
//   - Each suggestion: Accept → apply to local masterCV state; Edit → show TextField;
//     Dismiss → remove from list.
//   - After all suggestions resolved: call window.api.masterCV.save(updatedCV);
//     call window.api.applications.update(id, { [type]IncorporatedAt: now }) per doc.
//   - All CRUD on entries/bullets/education/skills call window.api.masterCV.save() on commit.
// TODO (Phase 4):
//   - Wire SpendingWarningBanner: pass spendTotal.totalUsd and settings.spendingLimit.
//   - Wire SpendingLimitDialog before masterCV:regenerate calls.

import { Box, Button, Chip, Divider, IconButton, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SpendingWarningBanner from '../molecules/SpendingWarningBanner'
import type { MasterCVExperienceEntry, MasterCVBullet } from '@shared/types'

export default function MasterCVPage(): JSX.Element {
  // TODO: const [masterCV, setMasterCV] = useState<MasterCV>({ experience: [], education: [], skills: [] })
  // TODO: const [isLoading, setIsLoading] = useState(true)
  // TODO: const [spendTotal, setSpendTotal] = useState<SpendTotal | null>(null)
  // TODO: const [unincorporatedDocs, setUnincorporatedDocs] = useState<UnincorporatedDoc[]>([])
  // TODO: const [isRegenerating, setIsRegenerating] = useState(false)
  // TODO: const [suggestions, setSuggestions] = useState<RegenSuggestion[]>([])
  // TODO: const [regenError, setRegenError] = useState<string | null>(null)
  // TODO: const lastAiOp = useAppSelector(state => state.ui.lastAiOp)
  // TODO: const settings = useAppSelector(state => state.settings)
  // TODO: const dispatch = useAppDispatch()

  // TODO: useEffect(() => {
  //   Promise.all([
  //     window.api.masterCV.get(),
  //     window.api.spendLog.getTotal(),
  //     window.api.applications.getAll()
  //   ]).then(([cv, spend, apps]) => {
  //     setMasterCV(cv)
  //     setSpendTotal(spend)
  //     const unincorp = apps.filter(a =>
  //       (a.resumeLastFinalizedAt &&
  //         (!a.resumeIncorporatedAt || a.resumeLastFinalizedAt > a.resumeIncorporatedAt)) ||
  //       (a.coverLetterLastFinalizedAt &&
  //         (!a.coverLetterIncorporatedAt || a.coverLetterLastFinalizedAt > a.coverLetterIncorporatedAt))
  //     )
  //     setUnincorporatedDocs(unincorp)
  //   }).finally(() => setIsLoading(false))
  // }, [])

  // TODO: async function handleRegenerate(documentIds?: string[]) {
  //   setIsRegenerating(true)
  //   setRegenError(null)
  //   try {
  //     const result = await window.api.masterCV.regenerate(documentIds)
  //     setSuggestions(result)
  //     // TODO: dispatch(setLastAiOp({ model, inputTokens, outputTokens, estimatedCostUsd }))
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
            Master CV
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            Your complete professional history — the source of truth for all generated resumes
          </Typography>
        </Box>
        {/* TODO: onClick={() => handleRegenerate()}, disabled={isRegenerating} */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AutoFixHighIcon sx={{ fontSize: 15 }} />}
          sx={{ fontSize: 12.5, whiteSpace: 'nowrap' }}
        >
          Regenerate
        </Button>
      </Box>

      {/* AI usage info bar — STUB: Phase 3 */}
      <AiUsageBar />

      {/* Spending-limit warning banner — STUB: Phase 4 */}
      {/* Shown when 24h rolling spend exceeds the configured limit (limit > 0). */}
      {/* TODO: replace placeholder 0 values with spendTotal.totalUsd and settings.spendingLimit */}
      <SpendingWarningBanner spendUsd={0} limitUsd={0} />

      {/* SpendingLimitDialog — STUB: Phase 4 */}
      {/* TODO: render before masterCV:regenerate calls */}
      {/* <SpendingLimitDialog
            open={showSpendDialog}
            spendUsd={spendTotal?.totalUsd ?? 0}
            limitUsd={settings.spendingLimit}
            onCancel={() => setShowSpendDialog(false)}
            onGenerateAnyway={() => { setShowSpendDialog(false); handleRegenerate() }}
          /> */}

      {/* Regeneration loading indicator — STUB: Phase 3 */}
      {/* TODO: shown when isRegenerating === true */}
      {/* <LinearProgress sx={{ height: 2, flexShrink: 0 }} /> */}

      {/* Regeneration error — STUB: Phase 3 */}
      {/* TODO: shown when regenError !== null */}
      {/* <Alert severity="error" action={<Button onClick={handleRegenerate}>Retry</Button>}>{regenError}</Alert> */}

      <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Unincorporated documents banner — STUB: Phase 3 */}
        {/* TODO: shown when unincorporatedDocs.length > 0 */}
        {/* <UnincorporatedDocsBanner docs={unincorporatedDocs} onRegenerate={handleRegenerate} /> */}
        <UnincorporatedDocsBanner />

        {/* Regeneration review panel — STUB: Phase 3 */}
        {/* TODO: shown when suggestions.length > 0 */}
        {/* <RegenReviewPanel
              suggestions={suggestions}
              masterCV={masterCV}
              onCommit={(updatedCV, incorporatedIds) => {
                window.api.masterCV.save(updatedCV)
                incorporatedIds.forEach(({ appId, type }) =>
                  window.api.applications.update(appId, {
                    [type === 'resume' ? 'resumeIncorporatedAt' : 'coverLetterIncorporatedAt']: new Date().toISOString()
                  })
                )
                setSuggestions([])
              }}
            /> */}

        <ExperienceSection />
        <EducationSection />
        <SkillsSection />
      </Box>
    </Box>
  )
}

// ─── AI Usage Info Bar ────────────────────────────────────────────────────────

// STUB: Phase 3 — renders placeholder text; not yet connected to real data.
// TODO:
//   - Read lastAiOp from uiSlice (state.ui.lastAiOp) for per-operation token counts and cost.
//   - Read spendTotal from local component state (fetched via window.api.spendLog.getTotal).
//   - Read settings.spendingLimit from Redux.
//   - When lastAiOp is null, show "No AI operation yet".
//   - When spendingLimit > 0, show "24h: $X.XX / $Y.YY"; turn the spend text orange when over limit.
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
      {/* TODO: when lastAiOp is set, render: "{lastAiOp.model} · {lastAiOp.inputTokens}k in · {lastAiOp.outputTokens} out · ~${lastAiOp.estimatedCostUsd.toFixed(3)}" */}
      <Typography sx={{ fontSize: 11.5, color: '#9eaab5' }}>
        {/* e.g. "claude-sonnet-4-6  ·  Last run: 8.1k in · 2.4k out · ~$0.06" */}
        No AI operation yet
      </Typography>
      <Box sx={{ flex: 1 }} />
      {/* TODO: render "24h: ${spendTotal.totalUsd.toFixed(2)} / ${spendingLimit.toFixed(2)}" when spendingLimit > 0 */}
      {/* TODO: color="error" when spendTotal.totalUsd > spendingLimit */}
      <Typography sx={{ fontSize: 11.5, color: '#9eaab5' }}>
        {/* e.g. "24h: $0.14 / $5.00" */}
        24h spend: —
      </Typography>
    </Box>
  )
}

// ─── Unincorporated Documents Banner ─────────────────────────────────────────

// STUB: Phase 3 — shape rendered with placeholder content; hidden in practice until
//   real unincorporated doc data is passed in.
// TODO:
//   - Accept props: docs: UnincorporatedDoc[], onRegenerate: (ids: string[]) => void.
//   - Render nothing (return null) when docs.length === 0.
//   - Each doc listed as a Chip with a Resume or Cover Letter label.
//   - Regenerate button calls onRegenerate(docs.map(d => d.applicationId)).
//
// UnincorporatedDoc shape (not yet a shared type — define locally when wiring):
//   { applicationId: string; name: string; type: 'resume' | 'coverLetter' }
function UnincorporatedDocsBanner(): JSX.Element {
  // Rendered as empty so the banner doesn't appear until real data is wired.
  // TODO: accept docs prop; return null when docs.length === 0.
  const PLACEHOLDER_DOCS: Array<{ id: string; name: string; type: 'resume' | 'coverLetter' }> = []

  if (PLACEHOLDER_DOCS.length === 0) return <></>

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
          Unincorporated documents
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#78350f', mb: 1.25 }}>
          The following finalized documents have not yet been incorporated into the Master CV:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {/* TODO: PLACEHOLDER_DOCS.map(doc => ( */}
          {/*   <Chip key={doc.id} size="small" */}
          {/*     label={`${doc.name} · ${doc.type === 'resume' ? 'Resume' : 'Cover Letter'}`} */}
          {/*     sx={{ fontSize: 11.5, bgcolor: '#fef3c7', color: '#92400e' }} */}
          {/*   /> */}
          {/* )) */}
        </Box>
      </Box>
      {/* TODO: onClick={() => onRegenerate(PLACEHOLDER_DOCS.map(d => d.id))} */}
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

// ─── Regeneration Review Panel ────────────────────────────────────────────────

// STUB: Phase 3 — not rendered until a regeneration run produces suggestions.
// TODO:
//   - Accept props: suggestions: RegenSuggestion[], masterCV: MasterCV,
//     onCommit: (updatedCV: MasterCV, incorporatedIds: ...) => void.
//   - Render nothing when suggestions.length === 0.
//   - Panel header: "N of M remaining" counter + Dismiss All button.
//   - Each suggestion rendered as a RegenSuggestionCard.
//   - After all resolved: call onCommit with the modified masterCV and included doc IDs.
//
// function RegenReviewPanel({ suggestions, masterCV, onCommit }): JSX.Element { ... }

// STUB: Phase 3 — shape of a single suggestion card; not yet rendered.
// TODO:
//   - Type badge (add-bullet / expand-bullet / add-skill / new-entry / cover-letter-insight).
//   - Context label: e.g. "for Acme Corp — Senior Software Engineer".
//   - Diff view: currentText (red, strikethrough) → proposedText (green) for expand-bullet;
//     just proposedText (green) for additions.
//   - Accept button: apply proposedText to the local masterCV copy.
//   - Edit button: show TextField pre-filled with proposedText; save edited text on Accept.
//   - Dismiss button: remove suggestion from the list without applying.
//
// function RegenSuggestionCard({ suggestion, onAccept, onDismiss }): JSX.Element { ... }

// ─── Experience Section ───────────────────────────────────────────────────────

// STUB: Phase 3 — section heading and "+ Add entry" button rendered;
//   entry cards use placeholder data; all CRUD actions not yet wired.
// TODO:
//   - Replace PLACEHOLDER_ENTRIES with masterCV.experience data.
//   - Pass onSave / onDelete callbacks down to ExperienceEntryCard.
//   - "+ Add entry" onClick: show AddEntryForm inline below the last card.
//   - AddEntryForm onSave: generate nanoid for entry + bullets, set source: 'manual',
//     append to masterCV.experience, call window.api.masterCV.save().
function ExperienceSection(): JSX.Element {
  // TODO: accept masterCV prop or read from local state
  // TODO: const [showAddForm, setShowAddForm] = useState(false)

  // Placeholder entry shown during development so the card shape is visible.
  // TODO: replace with masterCV.experience.map(entry => <ExperienceEntryCard key={entry.id} entry={entry} ... />)
  const PLACEHOLDER_ENTRIES: MasterCVExperienceEntry[] = [
    {
      id: 'exp_placeholder',
      title: 'Senior Software Engineer',
      company: 'Example Corp',
      startDate: 'Jan 2023',
      endDate: 'Present',
      bullets: [
        {
          id: 'bul_placeholder',
          text: 'Sample bullet — replace with real Master CV data once masterCV:get is wired.',
          source: 'ingested',
          sourceLabel: 'Resume uploaded Feb 2026',
          usedIn: ['session_abc']
        }
      ]
    }
  ]

  return (
    <Box>
      <SectionHeading title="Experience" />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {PLACEHOLDER_ENTRIES.map((entry) => (
          // TODO: also pass onSave and onDelete callbacks
          <ExperienceEntryCard key={entry.id} entry={entry} />
        ))}
      </Box>

      {/* "+ Add entry" dashed button — STUB: Phase 3 */}
      {/* TODO: onClick={() => setShowAddForm(true)} */}
      {/* TODO: when showAddForm, render <AddEntryForm onSave={handleAddEntry} onCancel={() => setShowAddForm(false)} /> below cards */}
      <Box
        sx={{
          mt: 1.5,
          border: '1.5px dashed #d1d5db',
          borderRadius: 2,
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          cursor: 'pointer',
          color: '#9ca3af',
          fontSize: 12.5,
          userSelect: 'none',
          '&:hover': { bgcolor: '#f9fafb', borderColor: '#9ca3af', color: '#6b7280' }
        }}
      >
        <AddIcon sx={{ fontSize: 15 }} />
        Add entry
      </Box>
    </Box>
  )
}

// STUB: Phase 3 — renders entry header and bullet list; edit/delete/add-bullet not yet wired.
// TODO:
//   - Edit icon onClick: show inline TextFields for title, company, startDate, endDate;
//     Save commits via masterCV:save; Cancel restores original values.
//   - Delete icon onClick: show confirmation dialog; on confirm remove from masterCV.experience
//     and call window.api.masterCV.save().
//   - Bullet click: turn into TextField for inline editing; Enter saves, Escape cancels.
//   - Bullet delete icon (on hover): remove from entry.bullets and call save.
//   - "+ Add bullet" onClick: append a blank bullet with source: 'manual', enter edit mode.
function ExperienceEntryCard({ entry }: { entry: MasterCVExperienceEntry }): JSX.Element {
  // TODO: const [isEditingEntry, setIsEditingEntry] = useState(false)
  // TODO: const [editingBulletId, setEditingBulletId] = useState<string | null>(null)
  // TODO: const [draftTitle, setDraftTitle] = useState(entry.title)
  // TODO: const [draftCompany, setDraftCompany] = useState(entry.company)
  // TODO: const [draftStart, setDraftStart] = useState(entry.startDate)
  // TODO: const [draftEnd, setDraftEnd] = useState(entry.endDate)

  return (
    <Box
      sx={{
        bgcolor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        px: 2.5,
        py: 2
      }}
    >
      {/* Entry header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.25 }}>
        <Box sx={{ flex: 1 }}>
          {/* TODO: when isEditingEntry, replace with TextFields for title / company / startDate / endDate */}
          <Typography fontWeight={700} sx={{ fontSize: 13.5, color: '#111827' }}>
            {entry.title}
            <Typography component="span" sx={{ fontWeight: 400, color: '#6b7280', ml: 0.75, fontSize: 13 }}>
              · {entry.company}
            </Typography>
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: '#9ca3af', mt: 0.25 }}>
            {entry.startDate} – {entry.endDate}
          </Typography>
        </Box>
        {/* TODO: onClick={() => setIsEditingEntry(true)} */}
        <IconButton size="small" sx={{ color: '#9ca3af', '&:hover': { color: '#374151' } }}>
          <EditIcon sx={{ fontSize: 15 }} />
        </IconButton>
        {/* TODO: onClick → confirmation dialog, then remove entry and call save */}
        <IconButton size="small" sx={{ color: '#9ca3af', '&:hover': { color: '#dc2626' } }}>
          <DeleteIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>

      {/* Bullet list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
        {/* TODO: pass editingBulletId, setEditingBulletId, and onSave callbacks */}
        {entry.bullets.map((bullet) => (
          <BulletRow key={bullet.id} bullet={bullet} />
        ))}
      </Box>

      {/* "+ Add bullet" — STUB: Phase 3 */}
      {/* TODO: onClick → append blank bullet (nanoid, source: 'manual', sourceLabel: 'Manual entry'), */}
      {/*   set editingBulletId to the new bullet's id */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: '#9ca3af',
          fontSize: 12,
          cursor: 'pointer',
          width: 'fit-content',
          userSelect: 'none',
          '&:hover': { color: '#6b7280' }
        }}
      >
        <AddIcon sx={{ fontSize: 14 }} />
        Add bullet
      </Box>
    </Box>
  )
}

// STUB: Phase 3 — renders bullet text, source tag, and usage count;
//   inline editing and delete not yet wired.
// TODO:
//   - onClick bullet text (or when editingBulletId === bullet.id):
//     render TextField pre-filled with bullet.text;
//     Enter saves (update bullet.text in masterCV, call save), Escape cancels.
//   - Delete icon (on row hover): remove bullet from entry.bullets and call save.
function BulletRow({ bullet }: { bullet: MasterCVBullet }): JSX.Element {
  // TODO: const [isEditing, setIsEditing] = useState(false)
  // TODO: const [draft, setDraft] = useState(bullet.text)

  const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
    manual:      { bg: '#e0e7ff', text: '#3730a3' },
    ingested:    { bg: '#d1fae5', text: '#065f46' },
    finalized:   { bg: '#dbeafe', text: '#1e40af' },
    regenerated: { bg: '#fce7f3', text: '#9d174d' }
  }
  const colors = SOURCE_COLORS[bullet.source] ?? { bg: '#f3f4f6', text: '#374151' }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        py: 0.5,
        px: 0.5,
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': { bgcolor: '#f9fafb' },
        '&:hover .bullet-delete': { opacity: 1 }
      }}
    >
      <Typography sx={{ mt: 0.15, color: '#374151', fontSize: 12.5, lineHeight: 1.1, flexShrink: 0 }}>
        •
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* TODO: when isEditing, render TextField multiline with value={draft} */}
        {/* TODO: onKeyDown: Enter → save (update bullet.text, call masterCV:save), Escape → cancel */}
        <Typography sx={{ fontSize: 12.5, color: '#374151', lineHeight: 1.6 }}>
          {bullet.text}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip
            label={bullet.source}
            size="small"
            sx={{
              height: 16,
              fontSize: 10,
              fontWeight: 600,
              bgcolor: colors.bg,
              color: colors.text,
              '& .MuiChip-label': { px: 0.75 }
            }}
          />
          {bullet.usedIn.length > 0 && (
            <Typography sx={{ fontSize: 10.5, color: '#9ca3af' }}>
              Used in {bullet.usedIn.length} {bullet.usedIn.length === 1 ? 'session' : 'sessions'}
            </Typography>
          )}
        </Box>
      </Box>
      {/* Delete icon — visible on row hover */}
      {/* TODO: onClick → remove bullet from entry.bullets, call masterCV:save */}
      <IconButton
        className="bullet-delete"
        size="small"
        sx={{
          opacity: 0,
          transition: 'opacity 0.15s',
          color: '#9ca3af',
          p: 0.25,
          '&:hover': { color: '#dc2626' }
        }}
      >
        <DeleteIcon sx={{ fontSize: 13 }} />
      </IconButton>
    </Box>
  )
}

// ─── Add Entry Form ───────────────────────────────────────────────────────────

// STUB: Phase 3 — inline form for adding a new experience entry.
//   Rendered inside ExperienceSection when showAddForm === true.
// TODO:
//   - Generate a nanoid for the new entry id.
//   - On Save: call onSave({ id, title, company, startDate, endDate, bullets: [] });
//     caller appends to masterCV.experience and calls window.api.masterCV.save().
//   - On Cancel: call onCancel without saving.
//
// function AddEntryForm({
//   onSave,
//   onCancel
// }: {
//   onSave: (entry: MasterCVExperienceEntry) => void
//   onCancel: () => void
// }): JSX.Element {
//   const [title, setTitle] = useState('')
//   const [company, setCompany] = useState('')
//   const [startDate, setStartDate] = useState('')
//   const [endDate, setEndDate] = useState('')
//   return (
//     <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2, bgcolor: 'white' }}>
//       <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
//         <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} size="small" sx={{ flex: 2, minWidth: 180 }} />
//         <TextField label="Company" value={company} onChange={e => setCompany(e.target.value)} size="small" sx={{ flex: 2, minWidth: 160 }} />
//         <TextField label="Start date" value={startDate} onChange={e => setStartDate(e.target.value)} size="small" placeholder="Jan 2023" sx={{ flex: 1, minWidth: 110 }} />
//         <TextField label="End date" value={endDate} onChange={e => setEndDate(e.target.value)} size="small" placeholder="Present" sx={{ flex: 1, minWidth: 110 }} />
//       </Box>
//       <Box sx={{ display: 'flex', gap: 1 }}>
//         <Button size="small" variant="contained" disableElevation
//           disabled={!title || !company}
//           onClick={() => onSave({ id: nanoid(), title, company, startDate, endDate, bullets: [] })}>
//           Save
//         </Button>
//         <Button size="small" onClick={onCancel}>Cancel</Button>
//       </Box>
//     </Box>
//   )
// }

// ─── Education Section ────────────────────────────────────────────────────────

// STUB: Phase 3 — section heading and placeholder row rendered;
//   edit, delete, and add actions not yet wired.
// TODO:
//   - Replace PLACEHOLDER_ROWS with masterCV.education.map(e => <EducationRow key={e.id} entry={e} ... />).
//   - Edit icon: show inline TextFields for degree, institution, graduationDate; Save/Cancel.
//   - Delete icon: remove from masterCV.education and call masterCV:save.
//   - "+ Add row" onClick: append a blank EducationEntry with a new nanoid, enter edit mode.
function EducationSection(): JSX.Element {
  // TODO: const [showAddForm, setShowAddForm] = useState(false)

  return (
    <Box>
      <SectionHeading title="Education" />
      <Box sx={{ bgcolor: 'white', border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
        {/* TODO: masterCV.education.map(e => <EducationRow key={e.id} entry={e} onSave={...} onDelete={...} />) */}
        <EducationRow
          degree="Bachelor of Science in Computer Science"
          institution="State University"
          graduationDate="May 2020"
        />
        {/* "+ Add row" — STUB: Phase 3 */}
        {/* TODO: onClick={() => setShowAddForm(true)}, then render inline form */}
        <Box
          sx={{
            px: 2.5,
            py: 1,
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: '#9ca3af',
            fontSize: 12,
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { bgcolor: '#f9fafb', color: '#6b7280' }
          }}
        >
          <AddIcon sx={{ fontSize: 14 }} />
          Add row
        </Box>
      </Box>
    </Box>
  )
}

// STUB: Phase 3 — renders a single education row with edit/delete icons;
//   inline editing not yet wired.
// TODO:
//   - Edit icon onClick: replace Typography with TextFields for degree, institution, graduationDate.
//   - Delete icon onClick: remove from masterCV.education and call masterCV:save.
function EducationRow({
  degree,
  institution,
  graduationDate
}: {
  degree: string
  institution: string
  graduationDate: string
}): JSX.Element {
  // TODO: const [isEditing, setIsEditing] = useState(false)
  // TODO: const [draftDegree, setDraftDegree] = useState(degree)
  // TODO: const [draftInstitution, setDraftInstitution] = useState(institution)
  // TODO: const [draftGrad, setDraftGrad] = useState(graduationDate)

  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        '&:hover': { bgcolor: '#f9fafb' },
        '&:hover .edu-actions': { opacity: 1 }
      }}
    >
      <Box sx={{ flex: 1 }}>
        {/* TODO: when isEditing, render TextFields instead of Typography */}
        <Typography fontWeight={600} sx={{ fontSize: 13, color: '#111827' }}>
          {degree}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
          {institution} · {graduationDate}
        </Typography>
      </Box>
      <Box className="edu-actions" sx={{ display: 'flex', opacity: 0, transition: 'opacity 0.15s' }}>
        {/* TODO: onClick={() => setIsEditing(true)} */}
        <IconButton size="small" sx={{ color: '#9ca3af', '&:hover': { color: '#374151' } }}>
          <EditIcon sx={{ fontSize: 14 }} />
        </IconButton>
        {/* TODO: onClick → remove entry and call masterCV:save */}
        <IconButton size="small" sx={{ color: '#9ca3af', '&:hover': { color: '#dc2626' } }}>
          <DeleteIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  )
}

// ─── Skills Section ───────────────────────────────────────────────────────────

// STUB: Phase 3 — section heading and placeholder category rows rendered;
//   all editing actions not yet wired.
// TODO:
//   - Replace PLACEHOLDER_CATEGORIES with masterCV.skills.map(cat => <SkillCategoryRow key={cat.id} cat={cat} ... />).
//   - Per item: click to edit in place (TextField); Enter saves, Escape cancels; × icon deletes.
//   - "+ Add item" chip in each row: append a blank item, enter edit mode.
//   - Category name click: editable TextField; Enter saves, Escape cancels.
//   - Delete category icon (on row hover): remove from masterCV.skills and call save.
//   - "+ Add category" button at the bottom: append a blank SkillCategory row, enter edit mode.
//   - All saves call window.api.masterCV.save(updatedCV).
function SkillsSection(): JSX.Element {
  // TODO: const [showAddCategory, setShowAddCategory] = useState(false)

  return (
    <Box>
      <SectionHeading title="Skills" />
      <Box sx={{ bgcolor: 'white', border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
        {/* TODO: masterCV.skills.map(cat => <SkillCategoryRow key={cat.id} cat={cat} onSave={...} onDelete={...} />) */}
        <SkillCategoryRow
          category="Languages"
          items={['TypeScript (6 yrs)', 'Python (5 yrs)', 'SQL (6 yrs)']}
        />
        <SkillCategoryRow
          category="Cloud / Infrastructure"
          items={['AWS', 'Docker', 'Kubernetes', 'Terraform']}
        />
        {/* "+ Add category" — STUB: Phase 3 */}
        {/* TODO: onClick={() => setShowAddCategory(true)}, then render inline TextField for category name */}
        <Box
          sx={{
            px: 2.5,
            py: 1,
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: '#9ca3af',
            fontSize: 12,
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { bgcolor: '#f9fafb', color: '#6b7280' }
          }}
        >
          <AddIcon sx={{ fontSize: 14 }} />
          Add category
        </Box>
      </Box>
    </Box>
  )
}

// STUB: Phase 3 — renders a single skill category row with items as chips;
//   item editing/deletion, add item, and category delete not yet wired.
// TODO:
//   - Category name click: show TextField for editing; Enter saves, Escape cancels.
//   - Item Chip click: show TextField for inline editing; Enter saves, Escape cancels.
//   - Item onDelete (Chip × icon): remove from cat.items and call masterCV:save.
//   - "+ Add" chip onClick: append a blank item in edit mode.
//   - Delete category icon (on row hover): confirm, remove from masterCV.skills, call save.
function SkillCategoryRow({ category, items }: { category: string; items: string[] }): JSX.Element {
  // TODO: const [isEditingCategory, setIsEditingCategory] = useState(false)
  // TODO: const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  // TODO: const [draftCategory, setDraftCategory] = useState(category)

  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        '&:hover': { bgcolor: '#f9fafb' },
        '&:hover .cat-delete': { opacity: 1 }
      }}
    >
      {/* Category label */}
      {/* TODO: onClick={() => setIsEditingCategory(true)} */}
      {/* TODO: when isEditingCategory, render TextField for draftCategory */}
      <Typography
        fontWeight={600}
        sx={{ fontSize: 12.5, color: '#374151', minWidth: 150, pt: 0.35, cursor: 'pointer', flexShrink: 0 }}
      >
        {category}:
      </Typography>

      {/* Items */}
      <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {/* TODO: cat.items.map((item, i) => ( */}
        {/*   editingItemIndex === i */}
        {/*     ? <TextField key={i} size="small" defaultValue={item} ... /> */}
        {/*     : <Chip key={i} label={item} size="small" onDelete={() => handleDeleteItem(i)} onClick={() => setEditingItemIndex(i)} /> */}
        {/* )) */}
        {items.map((item) => (
          <Chip
            key={item}
            label={item}
            size="small"
            // TODO: onDelete={() => remove item from cat.items, call save}
            // TODO: onClick={() => enter edit mode for this item}
            sx={{ fontSize: 11.5, height: 22, cursor: 'pointer' }}
          />
        ))}
        {/* "+ Add" chip — STUB: Phase 3 */}
        {/* TODO: onClick → append blank item, set editingItemIndex to new index */}
        <Chip
          icon={<AddIcon sx={{ fontSize: 12 }} />}
          label="Add"
          size="small"
          variant="outlined"
          sx={{ fontSize: 11.5, height: 22, cursor: 'pointer', color: '#9ca3af', borderStyle: 'dashed' }}
        />
      </Box>

      {/* Delete category icon — visible on row hover */}
      {/* TODO: onClick → confirm dialog, remove category from masterCV.skills, call save */}
      <IconButton
        className="cat-delete"
        size="small"
        sx={{ opacity: 0, transition: 'opacity 0.15s', color: '#9ca3af', p: 0.25, '&:hover': { color: '#dc2626' }, flexShrink: 0 }}
      >
        <DeleteIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }): JSX.Element {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Typography fontWeight={700} sx={{ fontSize: 14, color: '#111827', mb: 0.5 }}>
        {title}
      </Typography>
      <Divider />
    </Box>
  )
}
