// LLM prompt templates for all Claude API calls.
//
// Each function returns a PromptBody that can be spread directly into
// client.messages.create() alongside the model parameter:
//
//   const response = await client.messages.create({
//     model,
//     ...tailorResumePrompt(masterCV, jobDescription)
//   })
//
// All prompts use tool_use with tool_choice: { type: 'tool', name: '...' } to
// guarantee structured JSON output. Extract the result from the tool_use block:
//
//   const block = response.content.find(b => b.type === 'tool_use')
//   if (!block || block.type !== 'tool_use') throw new Error('No tool_use in response')
//   const data = block.input as MyType

import type { MasterCV } from '@shared/types'

type ToolDefinition = {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required: string[]
  }
}

type PromptBody = {
  system: string
  max_tokens: number
  tools: ToolDefinition[]
  tool_choice: { type: 'tool'; name: string }
  messages: Array<{ role: 'user'; content: string }>
}

// Experience/education/skills schema shared by both resume prompts.
const RESUME_TOOL_SCHEMA: ToolDefinition['input_schema'] = {
  type: 'object',
  properties: {
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          company: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } }
        },
        required: ['title', 'company', 'startDate', 'endDate', 'bullets']
      }
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          degree: { type: 'string' },
          institution: { type: 'string' },
          graduationDate: { type: 'string' }
        },
        required: ['degree', 'institution', 'graduationDate']
      }
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          items: { type: 'array', items: { type: 'string' } }
        },
        required: ['category', 'items']
      }
    }
  },
  required: ['experience', 'education', 'skills']
}

// Extract company name and role title from a job description.
// Returns tool input: { company: string, role: string }
export function extractCompanyRolePrompt(jobDescription: string): PromptBody {
  return {
    system: 'You are a resume analyst.',
    max_tokens: 256,
    tools: [
      {
        name: 'extract_company_role',
        description: 'Extract the company name and job title from a job description.',
        input_schema: {
          type: 'object',
          properties: {
            company: { type: 'string', description: 'Company name' },
            role: { type: 'string', description: 'Job title' }
          },
          required: ['company', 'role']
        }
      }
    ],
    tool_choice: { type: 'tool', name: 'extract_company_role' },
    messages: [{ role: 'user', content: jobDescription.slice(0, 3000) }]
  }
}

// Extract structured CV content from raw resume text.
// Returns tool input matching the RawExtractedCV schema (experience, education, skills).
export function extractResumePrompt(text: string): PromptBody {
  return {
    system:
      'You are a resume parser. Extract all content exhaustively — include all experience, education, and skills. Preserve all numbers and dates as written.',
    max_tokens: 4096,
    tools: [
      {
        name: 'extract_resume',
        description: 'Extract all structured content from a resume.',
        input_schema: RESUME_TOOL_SCHEMA
      }
    ],
    tool_choice: { type: 'tool', name: 'extract_resume' },
    messages: [{ role: 'user', content: `Extract all resume content:\n\n${text}` }]
  }
}

// Generate a tailored ATS-optimized resume from the Master CV and job description.
// Returns tool input matching the ResumeJson schema (experience, education, skills).
export function tailorResumePrompt(masterCV: MasterCV, jobDescription: string): PromptBody {
  return {
    system:
      'You are a resume writer. Select, reorder, and rephrase content from the Master CV to best match the job. Optimize for ATS keywords. Never invent content — only rephrase existing bullets. Include all education.',
    max_tokens: 8192,
    tools: [
      {
        name: 'tailor_resume',
        description:
          'Produce a tailored resume from the Master CV for the given job description.',
        input_schema: RESUME_TOOL_SCHEMA
      }
    ],
    tool_choice: { type: 'tool', name: 'tailor_resume' },
    messages: [
      {
        role: 'user',
        content:
          `Master CV:\n${JSON.stringify(masterCV)}\n\n` +
          `Job Description:\n${jobDescription}`
      }
    ]
  }
}
