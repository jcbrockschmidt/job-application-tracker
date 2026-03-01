// In-memory undo/redo history hook.
//
// Maintains a linear change stack for a single typed value. Changes are pushed
// explicitly via push(). Ctrl+Z undoes; Ctrl+Y (or Ctrl+Shift+Z) redoes.
// History is in-memory only — it clears on app restart per the design spec.
//
// STUB: Phase 4 — hook shape and keyboard listener scaffolded; not yet wired to
// ResumePaper bullet edits, InlineRevisionPanel acceptance, or FeedbackSuggestionCard
// acceptance.
// TODO:
//   - Decide the undo unit: individual bullet/paragraph string vs. full ResumeJson /
//     CoverLetterJson snapshot. A full-snapshot approach is simpler to implement;
//     string-level granularity gives finer control. Recommendation: start with
//     full-document snapshots and switch if the overhead becomes noticeable.
//   - Wire push() into:
//       - ResumePaper: inline bullet save (manual edit via Edit toolbar button)
//       - InlineRevisionPanel: onAccept (AI-accepted revision)
//       - FeedbackSuggestionCard: onAccept when proposedText is set
//       - CoverLetterPaper: inline paragraph save
//   - After undo/redo, dispatch updateSession to keep Redux (and the auto-save
//     debounce) in sync with the reverted document state.
//   - Scope keyboard listeners to the active session only so they don't fire on
//     unrelated views (onboarding, settings, master list). One approach: attach
//     the listener only when this hook is mounted inside a SessionPage component.
//
// Usage example:
//   const { value, push, undo, redo, canUndo, canRedo } = useUndoRedo<ResumeJson>(initialResume)
//   // On bullet save:
//   push(updatedResume)
//   // Ctrl+Z will call undo(), returning value to the previous ResumeJson snapshot.

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UndoRedoState<T> {
  value: T
  canUndo: boolean
  canRedo: boolean
  push: (newValue: T) => void
  undo: () => void
  redo: () => void
  // Clears history without changing the current value (e.g. on session close).
  clear: () => void
}

export function useUndoRedo<T>(initial: T): UndoRedoState<T> {
  // past[past.length - 1] is the most recent previous state (first undo target).
  const past = useRef<T[]>([])
  const future = useRef<T[]>([])
  const [current, setCurrent] = useState<T>(initial)

  const push = useCallback(
    (newValue: T) => {
      past.current = [...past.current, current]
      future.current = []
      setCurrent(newValue)
    },
    [current]
  )

  const undo = useCallback(() => {
    if (past.current.length === 0) return
    const previous = past.current[past.current.length - 1]
    past.current = past.current.slice(0, -1)
    future.current = [current, ...future.current]
    setCurrent(previous)
    // TODO: dispatch updateSession with the reverted document so Redux stays in sync
  }, [current])

  const redo = useCallback(() => {
    if (future.current.length === 0) return
    const next = future.current[0]
    future.current = future.current.slice(1)
    past.current = [...past.current, current]
    setCurrent(next)
    // TODO: dispatch updateSession with the redone document so Redux stays in sync
  }, [current])

  const clear = useCallback(() => {
    past.current = []
    future.current = []
  }, [])

  // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z keyboard shortcuts.
  // TODO: narrow the listener scope to the active session view only.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      // Support both Mac (Cmd) and Windows/Linux (Ctrl).
      const ctrlOrCmd = /mac/i.test(navigator.platform) ? e.metaKey : e.ctrlKey

      if (ctrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (ctrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return {
    value: current,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    push,
    undo,
    redo,
    clear
  }
}
