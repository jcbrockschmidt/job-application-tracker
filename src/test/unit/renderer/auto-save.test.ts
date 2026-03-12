// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import SessionPage from '../../../renderer/src/components/pages/SessionPage'
import React from 'react'

// Mock Redux hooks
vi.mock('../../../renderer/src/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn()
}))

// Mock window.api
vi.stubGlobal('window', {
  api: {
    spendLog: { getTotal: vi.fn().mockResolvedValue({ totalUsd: 0 }) },
    sessions: { update: vi.fn().mockResolvedValue(undefined) },
    generate: {
      resume: vi.fn(),
      coverLetter: vi.fn(),
      matchReport: vi.fn()
    }
  }
})

// Mock components that are not needed for this test or cause issues
vi.mock('../../../renderer/src/components/organisms/SessionHeader', () => ({
  default: () => React.createElement('div', { 'data-testid': 'session-header' })
}))
vi.mock('../../../renderer/src/components/organisms/SessionTabs', () => ({
  default: ({ _activeTab, onTabChange }) =>
    React.createElement(
      'div',
      { 'data-testid': 'session-tabs' },
      React.createElement('button', { onClick: () => onTabChange('resume') }, 'Resume Tab'),
      React.createElement('button', { onClick: () => onTabChange('coverLetter') }, 'CL Tab'),
      React.createElement('button', { onClick: () => onTabChange('description') }, 'JD Tab')
    )
}))
vi.mock('../../../renderer/src/components/organisms/SidePanels', () => ({
  default: () => React.createElement('div', { 'data-testid': 'side-panels' })
}))
vi.mock('../../../renderer/src/components/organisms/ResumePaper', () => ({
  default: ({ onUpdateResume }) =>
    React.createElement(
      'div',
      { 'data-testid': 'resume-paper' },
      React.createElement(
        'button',
        { onClick: () => onUpdateResume({ experience: [] }) },
        'Update Resume'
      )
    )
}))
vi.mock('../../../renderer/src/components/organisms/CoverLetterPaper', () => ({
  default: ({ onUpdateCoverLetter }) =>
    React.createElement(
      'div',
      { 'data-testid': 'cover-letter-paper' },
      React.createElement(
        'button',
        { onClick: () => onUpdateCoverLetter({ salutation: 'Hi' }) },
        'Update CL'
      )
    )
}))
vi.mock('../../../renderer/src/components/molecules/SpendingWarningBanner', () => ({
  default: () => null
}))

import { useAppSelector, useAppDispatch } from '../../../renderer/src/hooks'

describe('SessionPage Auto-save', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('flushes pending updates on unmount', async () => {
    const mockSession = {
      id: 'sess_1',
      resume: { experience: [], education: [], skills: [] },
      coverLetter: { salutation: '', paragraphs: [], signoff: '' },
      jobDescription: 'test'
    }
    const mockDispatch = vi.fn()

    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const state = {
        sessions: { activeSessionId: 'sess_1', sessions: [mockSession] },
        settings: { contactInfo: {}, spendingLimit: 0 },
        ui: { saveState: 'saved' }
      }
      return selector(state)
    })
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)

    const { getByText, unmount } = render(React.createElement(SessionPage))

    // Trigger an update
    const updateButton = getByText('Update Resume')
    await act(async () => {
      updateButton.click()
    })

    // Verify it's in Redux and timer started
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'sessions/updateSession',
        payload: expect.objectContaining({ id: 'sess_1' })
      })
    )

    // Now unmount before the 2s timer fires
    await act(async () => {
      unmount()
    })

    // Verify IPC call was made despite timer not firing
    expect(window.api.sessions.update).toHaveBeenCalledWith(
      'sess_1',
      expect.objectContaining({
        resume: expect.any(Object)
      })
    )
  })

  it('flushes pending updates when switching sessions', async () => {
    const mockSession1 = {
      id: 'sess_1',
      resume: { experience: [], education: [], skills: [] },
      coverLetter: { salutation: '', paragraphs: [], signoff: '' },
      jobDescription: 'test 1'
    }
    const mockSession2 = {
      id: 'sess_2',
      resume: { experience: [], education: [], skills: [] },
      coverLetter: { salutation: '', paragraphs: [], signoff: '' },
      jobDescription: 'test 2'
    }
    const mockDispatch = vi.fn()

    let activeSessionId = 'sess_1'

    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const state = {
        sessions: { activeSessionId, sessions: [mockSession1, mockSession2] },
        settings: { contactInfo: {}, spendingLimit: 0 },
        ui: { saveState: 'saved' }
      }
      return selector(state)
    })
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)

    const { getByText, rerender } = render(React.createElement(SessionPage))

    // Trigger an update for sess_1
    const updateButton = getByText('Update Resume')
    await act(async () => {
      updateButton.click()
    })

    // Now switch to sess_2
    activeSessionId = 'sess_2'
    await act(async () => {
      rerender(React.createElement(SessionPage))
    })

    // Verify sess_1 was flushed
    expect(window.api.sessions.update).toHaveBeenCalledWith(
      'sess_1',
      expect.objectContaining({
        resume: expect.any(Object)
      })
    )

    // Clear call history for update
    vi.mocked(window.api.sessions.update).mockClear()

    // Trigger an update for sess_2
    await act(async () => {
      updateButton.click()
    })

    // Advance time by 2s
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    // Verify sess_2 was saved (and it didn't include sess_1 data because state was cleared)
    expect(window.api.sessions.update).toHaveBeenCalledWith(
      'sess_2',
      expect.objectContaining({
        resume: expect.any(Object)
      })
    )
  })

  it('triggers debounced save for cover letter updates', async () => {
    const mockSession = {
      id: 'sess_1',
      resume: { experience: [], education: [], skills: [] },
      coverLetter: { salutation: '', paragraphs: [], signoff: '' },
      jobDescription: 'test'
    }
    const mockDispatch = vi.fn()

    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const state = {
        sessions: { activeSessionId: 'sess_1', sessions: [mockSession] },
        settings: { contactInfo: {}, spendingLimit: 0 },
        ui: { saveState: 'saved' }
      }
      return selector(state)
    })
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)

    const { getByText } = render(React.createElement(SessionPage))

    // Switch to CL tab
    await act(async () => {
      getByText('CL Tab').click()
    })

    // Trigger an update
    const updateButton = getByText('Update CL')
    await act(async () => {
      updateButton.click()
    })

    // Advance time by 2s
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    // Verify IPC call was made
    expect(window.api.sessions.update).toHaveBeenCalledWith(
      'sess_1',
      expect.objectContaining({
        coverLetter: expect.objectContaining({ salutation: 'Hi' })
      })
    )
  })

  it('merges rapid resume and cover letter updates into one IPC call', async () => {
    const mockSession = {
      id: 'sess_1',
      resume: { experience: [], education: [], skills: [] },
      coverLetter: { salutation: '', paragraphs: [], signoff: '' },
      jobDescription: 'test'
    }
    const mockDispatch = vi.fn()

    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const state = {
        sessions: { activeSessionId: 'sess_1', sessions: [mockSession] },
        settings: { contactInfo: {}, spendingLimit: 0 },
        ui: { saveState: 'saved' }
      }
      return selector(state)
    })
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)

    const { getByText } = render(React.createElement(SessionPage))

    // Trigger resume update
    await act(async () => {
      getByText('Update Resume').click()
    })

    // Switch to CL tab and trigger CL update
    await act(async () => {
      getByText('CL Tab').click()
    })
    await act(async () => {
      getByText('Update CL').click()
    })

    // Advance time by 2s
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    // Verify ONE IPC call was made with both updates
    expect(window.api.sessions.update).toHaveBeenCalledTimes(1)
    expect(window.api.sessions.update).toHaveBeenCalledWith(
      'sess_1',
      expect.objectContaining({
        resume: expect.any(Object),
        coverLetter: expect.any(Object)
      })
    )
  })

  it('dispatches setSaveState(saving) before IPC and (saved) after', async () => {
    const mockSession = {
      id: 'sess_1',
      resume: { experience: [], education: [], skills: [] },
      coverLetter: { salutation: '', paragraphs: [], signoff: '' },
      jobDescription: 'test'
    }
    const mockDispatch = vi.fn()

    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const state = {
        sessions: { activeSessionId: 'sess_1', sessions: [mockSession] },
        settings: { contactInfo: {}, spendingLimit: 0 },
        ui: { saveState: 'saved' }
      }
      return selector(state)
    })
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)

    const { getByText } = render(React.createElement(SessionPage))

    // Trigger update
    await act(async () => {
      getByText('Update Resume').click()
    })

    // 'saving' should be dispatched immediately when triggerAutoSave is called
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ui/setSaveState', payload: 'saving' })
    )

    // Advance time by 2s
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    // 'saved' should be dispatched after IPC call
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ui/setSaveState', payload: 'saved' })
    )
  })
})
