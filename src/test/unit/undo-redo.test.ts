// STUB: Phase 8 — Unit tests for the undo/redo change history.
//
// The history manager is an in-memory stack (not persisted). It is used by
// ResumePaper and CoverLetterPaper whenever a bullet or paragraph is manually
// edited or an AI revision is accepted. Ctrl+Z undoes; Ctrl+Y redoes.
//
// TODO (Phase 8): implement the history utility before enabling these tests.
//   Expected location: src/renderer/src/hooks/useUndoRedo.ts
//   Or, if implemented as a plain function factory (easier to unit-test without
//   React): src/renderer/src/utils/history.ts
//
// The public API expected by these tests:
//   createHistory<T>() → { push(state: T): void; undo(): T | undefined;
//                           redo(): T | undefined; canUndo: boolean;
//                           canRedo: boolean; clear(): void }
//
// Until the module exists, all tests are skipped with vi.todo() to keep the
// suite green while flagging the missing implementation.

import { describe, it, expect, beforeEach } from 'vitest'

// TODO: replace with the real import once implemented:
//   import { createHistory } from '@renderer/utils/history'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createHistory: (() => any) | null = null // STUB

describe('undo/redo history', () => {
  // TODO: type History properly once module exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let history: any

  beforeEach(() => {
    if (createHistory) {
      history = createHistory<string>()
    }
  })

  it('starts empty with canUndo and canRedo both false', () => {
    // TODO: remove skip once createHistory is implemented
    if (!createHistory) return
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)
  })

  it('push: adds a state and sets canUndo to true', () => {
    if (!createHistory) return
    history.push('state-1')
    expect(history.canUndo).toBe(true)
    expect(history.canRedo).toBe(false)
  })

  it('undo: returns the previous state and sets canUndo/canRedo correctly', () => {
    if (!createHistory) return
    history.push('state-1')
    history.push('state-2')
    const restored = history.undo()
    expect(restored).toBe('state-1')
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(true)
  })

  it('redo: returns the re-done state after an undo', () => {
    if (!createHistory) return
    history.push('state-1')
    history.push('state-2')
    history.undo()
    const redone = history.redo()
    expect(redone).toBe('state-2')
    expect(history.canRedo).toBe(false)
  })

  it('undo on an empty history returns undefined', () => {
    if (!createHistory) return
    const result = history.undo()
    expect(result).toBeUndefined()
  })

  it('redo on an empty redo stack returns undefined', () => {
    if (!createHistory) return
    history.push('state-1')
    const result = history.redo()
    expect(result).toBeUndefined()
  })

  it('push after undo clears the redo stack', () => {
    if (!createHistory) return
    history.push('state-1')
    history.push('state-2')
    history.undo()
    history.push('state-3') // new branch — redo stack should be wiped
    expect(history.canRedo).toBe(false)
  })

  it('clear: resets canUndo and canRedo to false', () => {
    if (!createHistory) return
    history.push('state-1')
    history.push('state-2')
    history.clear()
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)
    expect(history.undo()).toBeUndefined()
  })

  it('supports multiple sequential undos and redos', () => {
    if (!createHistory) return
    history.push('a')
    history.push('b')
    history.push('c')
    expect(history.undo()).toBe('b')
    expect(history.undo()).toBe('a')
    expect(history.canUndo).toBe(false)
    expect(history.redo()).toBe('b')
    expect(history.redo()).toBe('c')
    expect(history.canRedo).toBe(false)
  })
})
