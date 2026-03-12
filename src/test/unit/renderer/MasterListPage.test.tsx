// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import MasterListPage from '../../../renderer/src/components/pages/MasterListPage'
import React from 'react'
import type { Application } from '@shared/types'

// Mock Redux hooks
vi.mock('../../../renderer/src/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn()
}))

// Mock window.api
const mockApi = {
  applications: {
    getAll: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined)
  },
  sessions: {
    getForApplication: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(undefined)
  }
}

vi.stubGlobal('api', mockApi)
// In Electron, window.api is often used. We need to make sure both work if needed,
// but our code uses window.api.
Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
})

import { useAppSelector, useAppDispatch } from '../../../renderer/src/hooks'

describe('MasterListPage', () => {
  const mockApplications: Application[] = [
    {
      id: 'app-1',
      companyName: 'Acme',
      roleTitle: 'Engineer',
      briefSummary: 'Summary',
      dateGenerated: new Date().toISOString(),
      resumeStatus: 'draft',
      coverLetterStatus: 'none',
      applicationStatus: 'not_applied',
      notes: 'Initial notes',
      submittedDate: null,
      directoryPath: '/path/1',
      resumeLastFinalizedAt: null,
      resumeIncorporatedAt: null,
      coverLetterLastFinalizedAt: null,
      coverLetterIncorporatedAt: null,
      coverLetterWritingProfileIncorporatedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppSelector).mockReturnValue([]) // Default for sessions
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    vi.mocked(window.api.applications.getAll).mockResolvedValue(mockApplications)
  })

  it('enters edit mode for notes and calls update on blur', async () => {
    const { getByText, getByDisplayValue } = render(React.createElement(MasterListPage))

    // Wait for applications to load
    await act(async () => {})

    const notesCell = getByText('Initial notes')
    fireEvent.click(notesCell)

    const input = getByDisplayValue('Initial notes')
    fireEvent.change(input, { target: { value: 'Updated notes' } })
    fireEvent.blur(input)

    expect(window.api.applications.update).toHaveBeenCalledWith('app-1', { notes: 'Updated notes' })
  })

  it('cancels notes edit on Escape without calling update', async () => {
    const { getByText, getByDisplayValue, queryByDisplayValue } = render(
      React.createElement(MasterListPage)
    )

    await act(async () => {})

    fireEvent.click(getByText('Initial notes'))
    const input = getByDisplayValue('Initial notes')
    fireEvent.change(input, { target: { value: 'Canceled' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(window.api.applications.update).not.toHaveBeenCalled()
    expect(queryByDisplayValue('Canceled')).toBeNull()
    expect(getByText('Initial notes')).toBeTruthy()
  })

  it('cancels date edit on Escape without calling update', async () => {
    const { getByText, container, queryByDisplayValue } = render(
      React.createElement(MasterListPage)
    )

    await act(async () => {})

    fireEvent.click(getByText('—'))
    const input = container.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2026-03-12' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(window.api.applications.update).not.toHaveBeenCalled()
    expect(queryByDisplayValue('2026-03-12')).toBeNull()
    expect(getByText('—')).toBeTruthy()
  })

  it('updates status immediately when selecting from menu', async () => {
    const { getByText } = render(React.createElement(MasterListPage))

    await act(async () => {})

    const statusChip = getByText('not applied')
    fireEvent.click(statusChip)

    // MUI Menu renders in a portal, so we search globally
    const submittedOption = getByText('submitted')
    fireEvent.click(submittedOption)

    expect(window.api.applications.update).toHaveBeenCalledWith('app-1', {
      applicationStatus: 'submitted'
    })
  })

  it('enters edit mode for submitted date and calls update on blur', async () => {
    const { getByText, container } = render(React.createElement(MasterListPage))

    await act(async () => {})

    const dateCell = getByText('—') // submittedDate is null
    fireEvent.click(dateCell)

    const input = container.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2026-03-12' } })
    fireEvent.blur(input)

    expect(window.api.applications.update).toHaveBeenCalledWith('app-1', {
      submittedDate: '2026-03-12'
    })
  })
})
