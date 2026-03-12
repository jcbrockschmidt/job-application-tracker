// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, act, screen } from '@testing-library/react'
import SettingsPage from '../../../renderer/src/components/pages/SettingsPage'
import React from 'react'
import type { Settings } from '@shared/types'

// Mock Redux hooks
vi.mock('../../../renderer/src/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn()
}))

// Mock window.api
const mockApi = {
  settings: {
    getAvailableModels: vi.fn().mockResolvedValue(['model-1', 'model-2']),
    save: vi.fn().mockResolvedValue(undefined),
    validateApiKey: vi.fn().mockResolvedValue(true)
  }
}
vi.stubGlobal('api', mockApi)
Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
})

import { useAppSelector, useAppDispatch } from '../../../renderer/src/hooks'

describe('SettingsPage', () => {
  const mockSettings: Settings = {
    contactInfo: { fullName: 'John', phone: '123', email: 'j@j.com', linkedin: '', github: '' },
    model: 'model-1',
    theme: 'system',
    backupLocation: '',
    spendingLimit: 0,
    onboardingComplete: true
  }

  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppSelector).mockReturnValue(mockSettings)
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
  })

  it('calls window.api.settings.save when filling contact info and clicking Save', async () => {
    render(React.createElement(SettingsPage))

    // Wait for models to load
    await act(async () => {})

    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: 'New Name' } })
    fireEvent.change(screen.getByLabelText(/LinkedIn URL/i), { target: { value: 'li-url' } })

    await act(async () => {
      fireEvent.click(screen.getByText('Save'))
    })

    expect(window.api.settings.save).toHaveBeenCalledWith({
      contactInfo: expect.objectContaining({
        fullName: 'New Name',
        linkedin: 'li-url'
      })
    })
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'settings/setContactInfo',
        payload: expect.objectContaining({ fullName: 'New Name' })
      })
    )
  })

  it('calls window.api.settings.save immediately when changing the model', async () => {
    render(React.createElement(SettingsPage))
    await act(async () => {})

    // MUI Select: click the select element (the one with the value) to open the menu
    const select = screen.getByLabelText('Model')
    fireEvent.mouseDown(select)

    const option = screen.getByText('model-2')
    fireEvent.click(option)

    expect(window.api.settings.save).toHaveBeenCalledWith({ model: 'model-2' })
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'settings/setModel', payload: 'model-2' })
    )
  })

  it('calls window.api.settings.save immediately when changing the theme', async () => {
    render(React.createElement(SettingsPage))
    await act(async () => {})

    const select = screen.getByLabelText('Theme')
    fireEvent.mouseDown(select)

    const option = screen.getByText('Dark')
    fireEvent.click(option)

    expect(window.api.settings.save).toHaveBeenCalledWith({ theme: 'dark' })
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'settings/setTheme', payload: 'dark' })
    )
  })

  it('calls window.api.settings.save when changing the spending limit', async () => {
    render(React.createElement(SettingsPage))
    await act(async () => {})

    const input = screen.getByLabelText(/Limit \(USD\)/i)
    fireEvent.change(input, { target: { value: '15.5' } })

    expect(window.api.settings.save).toHaveBeenCalledWith({ spendingLimit: 15.5 })
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'settings/setSpendingLimit', payload: 15.5 })
    )
  })
})
