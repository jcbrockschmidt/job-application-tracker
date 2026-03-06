// Unit tests for the settings IPC handlers in src/main/ipc/index.ts.
//
// Strategy: mock `electron` so ipcMain.handle() captures each handler function,
// then call handlers directly. The electron app.getPath mock points at a real
// temporary directory so fs operations run against the actual filesystem.
//
// keytar and the ai module are mocked so no network calls or OS keychain
// access occur during tests.

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import type { Settings } from '@shared/types'

// Mutable reference updated in beforeEach. The mock reads it lazily so every
// handler invocation during a test sees the current temp directory.
let tempDir = ''

// Capture ipcMain.handle() callbacks so we can invoke them directly.
const capturedHandlers: Record<string, (...args: unknown[]) => Promise<unknown>> = {}

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => (name === 'userData' ? tempDir : '')
  },
  ipcMain: {
    handle: (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
      capturedHandlers[channel] = handler
    }
  }
}))

vi.mock('keytar', () => ({
  default: {
    setPassword: vi.fn().mockResolvedValue(undefined),
    getPassword: vi.fn().mockResolvedValue(null)
  }
}))

// pdf-parse reads a test PDF from disk at import time when not the main module.
// Mock it to prevent the ENOENT error when ipc/index.ts imports the ingestion module.
vi.mock('pdf-parse', () => ({ default: vi.fn() }))
vi.mock('mammoth', () => ({ default: { extractRawText: vi.fn() } }))

vi.mock('../../../main/ai', () => ({
  isPlaceholderMode: vi.fn().mockReturnValue(false),
  validateApiKey: vi.fn(),
  resetAnthropicClient: vi.fn(),
  listAvailableModels: vi.fn()
}))

import { registerIpcHandlers } from '../../../main/ipc/index'
import keytar from 'keytar'
import { validateApiKey, resetAnthropicClient, listAvailableModels } from '../../../main/ai'

// Register all handlers once. The handler functions close over app.getPath which
// reads tempDir at call time, so they work correctly with per-test temp dirs.
beforeAll(() => {
  registerIpcHandlers()
})

beforeEach(async () => {
  tempDir = mkdtempSync(join(tmpdir(), 'job-app-settings-test-'))
  vi.clearAllMocks()

  // Reset the module-level cachedModels by triggering a successful validation
  vi.mocked(validateApiKey).mockResolvedValue(true)
  await settingsValidateApiKey('reset-key')
  vi.clearAllMocks()
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

// Convenience wrappers — the first argument is the IPC event (unused by these handlers).
const settingsGet = (): Promise<Settings> =>
  capturedHandlers['settings:get'](null) as Promise<Settings>

const settingsSave = (updates: Partial<Settings>): Promise<void> =>
  capturedHandlers['settings:save'](null, updates) as Promise<void>

const settingsValidateApiKey = (apiKey: string): Promise<boolean> =>
  capturedHandlers['settings:validateApiKey'](null, apiKey) as Promise<boolean>

const settingsGetAvailableModels = (): Promise<string[]> =>
  capturedHandlers['settings:getAvailableModels'](null) as Promise<string[]>

const DEFAULT_SETTINGS: Settings = {
  contactInfo: { fullName: '', phone: '', email: '', linkedin: '', github: '' },
  model: 'claude-opus-4-6',
  theme: 'system',
  backupLocation: '',
  spendingLimit: 0,
  onboardingComplete: false
}

// ── settings:get ──────────────────────────────────────────────────────────────

describe('settings:get', () => {
  it('returns default settings when settings.json does not exist', async () => {
    const result = await settingsGet()
    expect(result).toEqual(DEFAULT_SETTINGS)
  })

  it('returns default settings when settings.json contains invalid JSON', async () => {
    writeFileSync(join(tempDir, 'settings.json'), 'not-valid-json', 'utf-8')
    const result = await settingsGet()
    expect(result).toEqual(DEFAULT_SETTINGS)
  })

  it('fills in missing keys with defaults when the stored file is partial', async () => {
    const partial = { model: 'claude-haiku-4-5-20251001', onboardingComplete: true }
    writeFileSync(join(tempDir, 'settings.json'), JSON.stringify(partial), 'utf-8')
    const result = await settingsGet()
    expect(result.model).toBe('claude-haiku-4-5-20251001')
    expect(result.onboardingComplete).toBe(true)
    // Keys absent from the stored file should fall back to defaults.
    expect(result.theme).toBe('system')
    expect(result.backupLocation).toBe('')
    expect(result.spendingLimit).toBe(0)
  })

  it('returns the exact stored values when the file is complete and valid', async () => {
    const stored: Settings = {
      contactInfo: {
        fullName: 'Alice',
        phone: '555-1234',
        email: 'alice@example.com',
        linkedin: 'alice-li',
        github: 'alice-gh'
      },
      model: 'claude-sonnet-4-6',
      theme: 'dark',
      backupLocation: '/backups',
      spendingLimit: 5,
      onboardingComplete: true
    }
    writeFileSync(join(tempDir, 'settings.json'), JSON.stringify(stored), 'utf-8')
    expect(await settingsGet()).toEqual(stored)
  })
})

// ── settings:save ─────────────────────────────────────────────────────────────

describe('settings:save', () => {
  it('persists settings so a subsequent settings:get returns them', async () => {
    await settingsSave({ model: 'claude-sonnet-4-6', onboardingComplete: true })
    const result = await settingsGet()
    expect(result.model).toBe('claude-sonnet-4-6')
    expect(result.onboardingComplete).toBe(true)
  })

  it('does not change fields that are not included in the update', async () => {
    await settingsSave({ model: 'claude-sonnet-4-6' })
    await settingsSave({ onboardingComplete: true })
    const result = await settingsGet()
    // First save should still be in effect.
    expect(result.model).toBe('claude-sonnet-4-6')
    // Second save applied correctly.
    expect(result.onboardingComplete).toBe(true)
    // Unmodified field stays at its default.
    expect(result.theme).toBe('system')
  })

  it('deep-merges contactInfo so a partial update preserves existing contact fields', async () => {
    await settingsSave({
      contactInfo: { fullName: 'Alice', phone: '555', email: 'alice@test.com' }
    })
    // Second save adds only linkedin — fullName/phone/email must survive.
    await settingsSave({ contactInfo: { linkedin: 'alice-li' } })
    const result = await settingsGet()
    expect(result.contactInfo.fullName).toBe('Alice')
    expect(result.contactInfo.phone).toBe('555')
    expect(result.contactInfo.email).toBe('alice@test.com')
    expect(result.contactInfo.linkedin).toBe('alice-li')
  })

  it('can set onboardingComplete to true and retrieve it', async () => {
    await settingsSave({ onboardingComplete: true })
    expect((await settingsGet()).onboardingComplete).toBe(true)
  })

  it('can update the spending limit', async () => {
    await settingsSave({ spendingLimit: 10 })
    expect((await settingsGet()).spendingLimit).toBe(10)
  })
})

// ── settings:validateApiKey ───────────────────────────────────────────────────

describe('settings:validateApiKey', () => {
  it('returns true, saves the key to the keychain, and resets the client when the key is valid', async () => {
    vi.mocked(validateApiKey).mockResolvedValue(true)

    const result = await settingsValidateApiKey('sk-valid-key')

    expect(result).toBe(true)
    expect(keytar.setPassword).toHaveBeenCalledWith(
      'job-application-kit',
      'anthropic-api-key',
      'sk-valid-key'
    )
    expect(resetAnthropicClient).toHaveBeenCalled()
  })

  it('returns false and does not touch the keychain when the key is invalid', async () => {
    vi.mocked(validateApiKey).mockResolvedValue(false)

    const result = await settingsValidateApiKey('sk-bad-key')

    expect(result).toBe(false)
    expect(keytar.setPassword).not.toHaveBeenCalled()
    expect(resetAnthropicClient).not.toHaveBeenCalled()
  })
})

// ── settings:getAvailableModels ───────────────────────────────────────────────

describe('settings:getAvailableModels', () => {
  it('throws when no API key is configured', async () => {
    vi.mocked(keytar.getPassword).mockResolvedValue(null)
    await expect(settingsGetAvailableModels()).rejects.toThrow('API key not configured')
  })

  it('calls listAvailableModels and returns the list when a key exists', async () => {
    vi.mocked(keytar.getPassword).mockResolvedValue('sk-test-key')
    const models = ['model-1', 'model-2']
    vi.mocked(listAvailableModels).mockResolvedValue(models)

    const result = await settingsGetAvailableModels()

    expect(result).toEqual(models)
    expect(listAvailableModels).toHaveBeenCalledWith('sk-test-key')
  })

  it('caches the models list across calls', async () => {
    vi.mocked(keytar.getPassword).mockResolvedValue('sk-test-key')
    const models = ['model-1']
    vi.mocked(listAvailableModels).mockResolvedValue(models)

    // First call populates cache
    await settingsGetAvailableModels()
    // Second call should use cache
    const result = await settingsGetAvailableModels()

    expect(result).toEqual(models)
    expect(listAvailableModels).toHaveBeenCalledTimes(1)
  })

  it('clears the cache when a new API key is validated', async () => {
    vi.mocked(keytar.getPassword).mockResolvedValue('sk-key-1')
    vi.mocked(listAvailableModels).mockResolvedValue(['model-1'])

    // Populate cache
    await settingsGetAvailableModels()
    expect(listAvailableModels).toHaveBeenCalledTimes(1)

    // Validate new key
    vi.mocked(validateApiKey).mockResolvedValue(true)
    await settingsValidateApiKey('sk-key-2')

    // Next call to getAvailableModels should call listAvailableModels again
    vi.mocked(keytar.getPassword).mockResolvedValue('sk-key-2')
    vi.mocked(listAvailableModels).mockResolvedValue(['model-2'])
    const result = await settingsGetAvailableModels()

    expect(result).toEqual(['model-2'])
    expect(listAvailableModels).toHaveBeenCalledTimes(2)
  })
})
