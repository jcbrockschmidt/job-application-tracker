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
    system: 'You are a structured data extractor. Output valid JSON only.',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content:
          `Extract the company name and job title from this job description.\n` +
          `Return JSON: {"company": "...", "role": "..."}\n\n` +
          `Job description:\n${jobDescription.slice(0, 3000)}`
      }
    ]
  }
}

// Extract structured CV content from raw resume text.
// Returns JSON matching the RawExtractedCV schema (experience, education, skills).
export function extractResumePrompt(text: string): PromptBody {
  return {
    system:
      'You are a structured data extractor. Output valid JSON only — no markdown, no explanation.',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content:
          `Extract all structured content from this resume and output it as JSON matching this exact schema:\n\n` +
          `{\n` +
          `  "experience": [{ "title": string, "company": string, "startDate": string, "endDate": string, "bullets": string[] }],\n` +
          `  "education": [{ "degree": string, "institution": string, "graduationDate": string }],\n` +
          `  "skills": [{ "category": string, "items": string[] }]\n` +
          `}\n\n` +
          `Rules:\n` +
          `- Include ALL experience, education, and skills — be exhaustive\n` +
          `- One bullet per achievement/responsibility; preserve all numbers and detail\n` +
          `- Dates: use the format as written in the resume (e.g. "Jan 2023", "Present")\n` +
          `- Skills: group by category if already grouped; otherwise use "Technical Skills"\n\n` +
          `Resume:\n${text}`
      }
    ]
  }
}

// Generate a tailored ATS-optimized resume from the Master CV and job description.
// Returns JSON matching the ResumeJson schema (experience, education, skills).
export function tailorResumePrompt(masterCV: MasterCV, jobDescription: string): PromptBody {
  return {
    system:
      'You are a professional resume writer. Output valid JSON only — no markdown, no explanation.',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content:
          `Create a tailored ATS-optimized resume from the Master CV below for the given job description.\n\n` +
          `Rules:\n` +
          `- Select the most relevant experience entries and bullets from the Master CV\n` +
          `- Prioritize entries that match keywords, skills, and responsibilities in the job description\n` +
          `- Refine bullet phrasing for ATS alignment — all content must exist in the Master CV, nothing invented\n` +
          `- Include all education entries\n` +
          `- Include the most relevant skill categories\n` +
          `- Return JSON matching this schema exactly:\n` +
          `  { "experience": [{ "title": string, "company": string, "startDate": string, "endDate": string, "bullets": string[] }],\n` +
          `    "education": [{ "degree": string, "institution": string, "graduationDate": string }],\n` +
          `    "skills": [{ "category": string, "items": string[] }] }\n\n` +
          `Master CV:\n${JSON.stringify(masterCV, null, 2)}\n\n` +
          `Job Description:\n${jobDescription}`
      }
    ]
  }
}
