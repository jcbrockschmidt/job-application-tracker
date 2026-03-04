// Utilities for estimating and tracking AI spend.
//
// estimateCostUsd — compute the estimated cost of a single Claude API call
//   based on published per-token pricing. Used when inserting spend_log rows.
//
// computeRolling24hTotal and isOverLimit are Phase 3 utilities (spendLog:getTotal IPC
// and the spending-limit warning banner). The types and implementations are defined
// here now so spend logging in docs:ingest and later IPC handlers can share the
// same estimateCostUsd function.

import type { SpendTotal } from '../../shared/types'

// ─── Model pricing ────────────────────────────────────────────────────────────

// Cost per 1 000 000 tokens in USD (input / output).
// Figures reflect Anthropic's published pricing as of early 2026.
// Unknown models fall back to claude-sonnet-4-6 rates.
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-4-6': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4 }
}

const DEFAULT_PRICING = MODEL_PRICING['claude-sonnet-4-6']

// ─── Public API ──────────────────────────────────────────────────────────────

// Estimate the cost in USD for a single Claude API call.
export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? DEFAULT_PRICING
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output
}

// Represents a spend_log row for computation purposes.
export interface SpendLogEntry {
  id: string
  timestamp: Date
  model: string
  inputTokens: number
  outputTokens: number
  estimatedCostUsd: number
}

// Sum estimated costs for log entries within the last 24 hours.
// Pass an explicit `now` for deterministic tests; defaults to the current time.
export function computeRolling24hTotal(
  entries: SpendLogEntry[],
  now: Date = new Date()
): SpendTotal {
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const totalUsd = entries
    .filter((e) => e.timestamp >= cutoff)
    .reduce((sum, e) => sum + e.estimatedCostUsd, 0)
  return { totalUsd, periodHours: 24 }
}

// Returns true when the rolling 24-hour spend exceeds the configured limit.
// A limit of 0 means "disabled" — always returns false.
export function isOverLimit(total: SpendTotal, limitUsd: number): boolean {
  if (limitUsd === 0) return false
  return total.totalUsd > limitUsd
}
