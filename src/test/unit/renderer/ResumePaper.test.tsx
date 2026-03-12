// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act, fireEvent } from '@testing-library/react'
import ResumePaper from '../../../renderer/src/components/organisms/ResumePaper'
import React from 'react'
import type { ResumeJson, ContactInfo } from '@shared/types'

describe('ResumePaper', () => {
  const mockResume: ResumeJson = {
    experience: [
      {
        title: 'Software Engineer',
        company: 'Acme Corp',
        startDate: '2020',
        endDate: 'Present',
        bullets: ['Bullet 1']
      }
    ],
    education: [],
    skills: [
      {
        category: 'Languages',
        items: ['TypeScript', 'JavaScript']
      }
    ]
  }

  const mockContact: ContactInfo = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890'
  }

  it('calls onUpdateResume when a bullet is edited and saved', async () => {
    const onUpdateResume = vi.fn()
    const { getByText, getByRole, container } = render(
      React.createElement(ResumePaper, {
        resume: mockResume,
        contact: mockContact,
        onUpdateResume
      })
    )

    // Click on the bullet to edit
    const bullet = getByText('Bullet 1')
    fireEvent.click(bullet)

    // Find the input and change text
    const input = container.querySelector('input')
    expect(input).toBeDefined()
    fireEvent.change(input!, { target: { value: 'Updated Bullet' } })

    // Press Enter to save
    fireEvent.keyDown(input!, { key: 'Enter', code: 'Enter' })

    expect(onUpdateResume).toHaveBeenCalledWith(
      expect.objectContaining({
        experience: expect.arrayContaining([
          expect.objectContaining({
            bullets: ['Updated Bullet']
          })
        ])
      })
    )
  })

  it('calls onUpdateResume when a skill category is edited and saved', async () => {
    const onUpdateResume = vi.fn()
    const { getByText, container } = render(
      React.createElement(ResumePaper, {
        resume: mockResume,
        contact: mockContact,
        onUpdateResume
      })
    )

    // Click on the skill to edit
    const skill = getByText(/Languages :/)
    fireEvent.click(skill)

    // Find the input and change text
    const input = container.querySelector('input')
    expect(input).toBeDefined()
    fireEvent.change(input!, { target: { value: 'Frontend: React, Vue' } })

    // Press Enter to save
    fireEvent.keyDown(input!, { key: 'Enter', code: 'Enter' })

    expect(onUpdateResume).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: [
          {
            category: 'Frontend',
            items: ['React', 'Vue']
          }
        ]
      })
    )
  })
})
