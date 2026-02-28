import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getAnthropicClient(apiKey: string): Anthropic {
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
  try {
    const anthropic = new Anthropic({ apiKey })
    await anthropic.models.list()
    return true
  } catch {
    return false
  }
}
