// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import CoverLetterPaper from '../../../renderer/src/components/organisms/CoverLetterPaper'
import React from 'react'
import type { CoverLetterJson, ContactInfo } from '@shared/types'

describe('CoverLetterPaper', () => {
  const mockCoverLetter: CoverLetterJson = {
    salutation: 'Dear Hiring Manager,',
    paragraphs: ['Paragraph 1', 'Paragraph 2'],
    signoff: 'Sincerely,'
  }

  const mockContact: ContactInfo = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890'
  }

  it('enters edit mode when clicking a paragraph', () => {
    const { getByText, container } = render(
      React.createElement(CoverLetterPaper, {
        coverLetter: mockCoverLetter,
        contact: mockContact,
        sessionId: 'sess-1'
      })
    )

    const paragraph = getByText('Paragraph 1')
    fireEvent.click(paragraph)

    const textarea = container.querySelector('textarea')
    expect(textarea).toBeTruthy()
    expect(textarea?.value).toBe('Paragraph 1')
  })

  it('calls onUpdateCoverLetter when saving a paragraph update with Ctrl+Enter', () => {
    const onUpdateCoverLetter = vi.fn()
    const { getByText, container } = render(
      React.createElement(CoverLetterPaper, {
        coverLetter: mockCoverLetter,
        contact: mockContact,
        sessionId: 'sess-1',
        onUpdateCoverLetter
      })
    )

    fireEvent.click(getByText('Paragraph 1'))
    const textarea = container.querySelector('textarea')!
    fireEvent.change(textarea, { target: { value: 'Updated Paragraph' } })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    expect(onUpdateCoverLetter).toHaveBeenCalledWith({
      paragraphs: ['Updated Paragraph', 'Paragraph 2']
    })
  })

  it('restores original text and does not call onUpdateCoverLetter when canceling edit with Escape', () => {
    const onUpdateCoverLetter = vi.fn()
    const { getByText, container, queryByDisplayValue } = render(
      React.createElement(CoverLetterPaper, {
        coverLetter: mockCoverLetter,
        contact: mockContact,
        sessionId: 'sess-1',
        onUpdateCoverLetter
      })
    )

    fireEvent.click(getByText('Paragraph 1'))
    const textarea = container.querySelector('textarea')!
    fireEvent.change(textarea, { target: { value: 'Changed' } })
    fireEvent.keyDown(textarea, { key: 'Escape' })

    expect(onUpdateCoverLetter).not.toHaveBeenCalled()
    expect(queryByDisplayValue('Changed')).toBeNull()
    expect(getByText('Paragraph 1')).toBeTruthy()
  })

  it('calls onUpdateCoverLetter when salutation is edited and saved', () => {
    const onUpdateCoverLetter = vi.fn()
    const { getByText, container } = render(
      React.createElement(CoverLetterPaper, {
        coverLetter: mockCoverLetter,
        contact: mockContact,
        sessionId: 'sess-1',
        onUpdateCoverLetter
      })
    )

    fireEvent.click(getByText('Dear Hiring Manager,'))
    const input = container.querySelector('input')!
    fireEvent.change(input, { target: { value: 'Hi,' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onUpdateCoverLetter).toHaveBeenCalledWith({ salutation: 'Hi,' })
  })

  it('calls onUpdateCoverLetter when sign-off is edited and saved', () => {
    const onUpdateCoverLetter = vi.fn()
    const { getByText, container } = render(
      React.createElement(CoverLetterPaper, {
        coverLetter: mockCoverLetter,
        contact: mockContact,
        sessionId: 'sess-1',
        onUpdateCoverLetter
      })
    )

    fireEvent.click(getByText('Sincerely,'))
    const input = container.querySelector('input')!
    fireEvent.change(input, { target: { value: 'Best,' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onUpdateCoverLetter).toHaveBeenCalledWith({ signoff: 'Best,' })
  })
})
