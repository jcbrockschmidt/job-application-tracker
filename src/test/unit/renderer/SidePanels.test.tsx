// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import SidePanels from '../../../renderer/src/components/organisms/SidePanels'
import React from 'react'
import type { Session } from '@shared/types'

// Mock Redux hooks
vi.mock('../../../renderer/src/hooks', () => ({
  useAppDispatch: vi.fn()
}))

// Mock window.api
vi.stubGlobal('window', {
  api: {
    sessions: { update: vi.fn().mockResolvedValue(undefined) }
  }
})

import { useAppDispatch } from '../../../renderer/src/hooks'

describe('SidePanels', () => {
  const mockSession: Session = {
    id: 'sess-1',
    applicationId: 'app-1',
    companyName: 'Acme',
    roleTitle: 'Engineer',
    jobDescription: 'Original JD',
    dateGenerated: new Date().toISOString(),
    resume: null,
    resumeStatus: 'draft',
    coverLetter: null,
    coverLetterStatus: 'none',
    matchReport: null,
    lastSaved: new Date().toISOString(),
    isOpen: true,
    isGenerating: false,
    generationError: null
  }

  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
  })

  it('reveals a TextField with current JD when clicking Edit icon', () => {
    const { getByLabelText, getByDisplayValue } = render(
      React.createElement(SidePanels, { session: mockSession, activeTab: 'resume' })
    )

    const editButton = getByLabelText('Edit job description')
    fireEvent.click(editButton)

    const textField = getByDisplayValue('Original JD')
    expect(textField).toBeTruthy()
  })

  it('calls window.api.sessions.update and dispatches when saving new JD', async () => {
    const { getByLabelText, getByDisplayValue, getByText } = render(
      React.createElement(SidePanels, { session: mockSession, activeTab: 'resume' })
    )

    fireEvent.click(getByLabelText('Edit job description'))
    const textField = getByDisplayValue('Original JD')
    fireEvent.change(textField, { target: { value: 'New JD' } })

    await act(async () => {
      fireEvent.click(getByText('Save'))
    })

    expect(window.api.sessions.update).toHaveBeenCalledWith(
      'sess-1',
      expect.objectContaining({ jobDescription: 'New JD' })
    )
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'sessions/updateSession',
        payload: expect.objectContaining({
          updates: { jobDescription: 'New JD', lastSaved: expect.any(String) }
        })
      })
    )
  })

  it('restores original text and does not call update when clicking Cancel', () => {
    const { getByLabelText, getByDisplayValue, getByText, queryByDisplayValue } = render(
      React.createElement(SidePanels, { session: mockSession, activeTab: 'resume' })
    )

    fireEvent.click(getByLabelText('Edit job description'))
    const textField = getByDisplayValue('Original JD')
    fireEvent.change(textField, { target: { value: 'Changed text' } })

    fireEvent.click(getByText('Cancel'))

    expect(window.api.sessions.update).not.toHaveBeenCalled()
    expect(queryByDisplayValue('Changed text')).toBeNull()
    expect(getByText('Original JD')).toBeTruthy()
  })
})
