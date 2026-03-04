// LLM prompt templates for all Claude API calls.
//
// Each function returns a PromptBody that can be spread directly into
// client.messages.create() alongside the model parameter:
//
//   const response = await client.messages.create({
//     model,
//     ...tailorResumePrompt(masterCV, jobDescription)
//   })

import type { MasterCV } from '@shared/types'

// Strip markdown code fences that Claude may wrap around JSON responses.
export function stripCodeFence(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  return match ? match[1].trim() : text.trim()
}

type PromptBody = {
  system: string
  max_tokens: number
  messages: Array<{ role: 'user'; content: string }>
}

// Extract company name and role title from a job description.
// Returns JSON: { company: string, role: string }
export function extractCompanyRolePrompt(jobDescription: string): PromptBody {
  return {
    system: 'Output valid JSON only.',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content:
          `Extract company name and job title. Return JSON: {"company":"...","role":"..."}\n\n` +
          jobDescription.slice(0, 3000)
      }
    ]
  }
}

// Extract structured CV content from raw resume text.
// Returns JSON matching the RawExtractedCV schema (experience, education, skills).
export function extractResumePrompt(text: string): PromptBody {
  return {
    system: 'Output valid JSON only — no markdown, no explanation.',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content:
          `Extract resume content as JSON:\n` +
          `{"experience":[{"title":string,"company":string,"startDate":string,"endDate":string,"bullets":string[]}],"education":[{"degree":string,"institution":string,"graduationDate":string}],"skills":[{"category":string,"items":string[]}]}\n\n` +
          `- Exhaustive: include all experience, education, skills\n` +
          `- One bullet per achievement; preserve all numbers\n` +
          `- Dates as written; skills grouped by category or "Technical Skills"\n\n` +
          `Resume:\n${text}`
      }
    ]
  }
}

// Generate a tailored ATS-optimized resume from the Master CV and job description.
// Returns JSON matching the ResumeJson schema (experience, education, skills).
export function tailorResumePrompt(masterCV: MasterCV, jobDescription: string): PromptBody {
  return {
    system: 'You are a resume writer. Output valid JSON only — no markdown, no explanation.',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content:
          `Tailor this Master CV for the job description. Return JSON:\n` +
          `{"experience":[{"title":string,"company":string,"startDate":string,"endDate":string,"bullets":string[]}],"education":[{"degree":string,"institution":string,"graduationDate":string}],"skills":[{"category":string,"items":string[]}]}\n\n` +
          `- Select/reorder/omit entries and bullets by relevance to the job; match keywords\n` +
          `- Optimize for ATS\n` +
          `- Only rephrase bullets; never invent content\n` +
          `- Include all education\n` +
          `- Include most relevant skills; rearrange/rename/omit categories if helpful\n\n` +
          `Master CV:\n${JSON.stringify(masterCV, null, 2)}\n\n` +
          `Job Description:\n${jobDescription}`
      }
    ]
  }
}
