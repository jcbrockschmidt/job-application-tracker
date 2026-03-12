import Anthropic from '@anthropic-ai/sdk'
import { app } from 'electron'

// Returns true when AI_PLACEHOLDER=true is set in the environment.
// Guarded by !app.isPackaged so placeholder mode can never run in a production build.
export function isPlaceholderMode(): boolean {
  return !app.isPackaged && process.env.AI_PLACEHOLDER === 'true'
}

/**
 * Artificial delay for placeholder mode to simulate LLM latency.
 * Most calls: 5s. Resume generation: 10s.
 */
export async function placeholderDelay(type: 'resume' | 'general' = 'general'): Promise<void> {
  if (!isPlaceholderMode()) return
  const ms = type === 'resume' ? 10000 : 5000
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let client: Anthropic | null = null

export function getAnthropicClient(apiKey: string): Anthropic {
  if (isPlaceholderMode()) {
    throw new Error(
      'getAnthropicClient called while AI_PLACEHOLDER=true — use placeholder data instead of making a real API call'
    )
  }
  if (!client) {
    client = new Anthropic({ apiKey })
  }
  return client
}

export function resetAnthropicClient(): void {
  client = null
}

export async function listAvailableModels(apiKey: string): Promise<string[]> {
  const anthropic = getAnthropicClient(apiKey)
  const response = await anthropic.models.list()
  return response.data.map((m) => m.id)
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (isPlaceholderMode()) {
    throw new Error(
      'validateApiKey called while AI_PLACEHOLDER=true — use placeholder data instead of making a real API call'
    )
  }
  try {
    const anthropic = new Anthropic({ apiKey })
    await anthropic.models.list()
    return true
  } catch {
    return false
  }
}
