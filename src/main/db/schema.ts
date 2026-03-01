import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const applications = sqliteTable('applications', {
  id: text('id').primaryKey(),
  companyName: text('company_name').notNull(),
  roleTitle: text('role_title').notNull(),
  briefSummary: text('brief_summary'),
  dateGenerated: text('date_generated').notNull(),
  resumeStatus: text('resume_status', { enum: ['draft', 'finalized'] }).notNull().default('draft'),
  coverLetterStatus: text('cover_letter_status', {
    enum: ['none', 'draft', 'finalized']
  })
    .notNull()
    .default('none'),
  applicationStatus: text('application_status', {
    enum: [
      'not_applied',
      'submitted',
      'interviewing',
      'offer_received',
      'rejected',
      'withdrawn'
    ]
  })
    .notNull()
    .default('not_applied'),
  notes: text('notes'),
  // User-entered date when the application was actually submitted to the company
  submittedDate: text('submitted_date'),
  resumeJsonPath: text('resume_json_path'),
  coverLetterJsonPath: text('cover_letter_json_path'),
  directoryPath: text('directory_path'),
  // Incorporation tracking: a document is "unincorporated" into the Master CV when
  // lastFinalizedAt is set and (incorporatedAt is null OR lastFinalizedAt > incorporatedAt).
  // Set resumeLastFinalizedAt when the user clicks Finalize on the resume.
  // Set resumeIncorporatedAt when the user commits a Master CV regeneration run that
  // included this document.
  resumeLastFinalizedAt: integer('resume_last_finalized_at', { mode: 'timestamp' }),
  resumeIncorporatedAt: integer('resume_incorporated_at', { mode: 'timestamp' }),
  coverLetterLastFinalizedAt: integer('cover_letter_last_finalized_at', { mode: 'timestamp' }),
  coverLetterIncorporatedAt: integer('cover_letter_incorporated_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

export const sourceDocs = sqliteTable('source_docs', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  type: text('type', { enum: ['resume', 'cover_letter'] }).notNull(),
  path: text('path').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull()
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  applicationId: text('application_id')
    .notNull()
    .references(() => applications.id),
  jobDescription: text('job_description').notNull(),
  // Stored as a serialized JSON string (MatchReport shape); null until generated.
  matchReport: text('match_report'),
  lastSaved: text('last_saved').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// Records every AI operation for spend tracking.
// The rolling 24-hour total is computed by summing estimatedCostUsd for rows
// where timestamp >= (now - 24h). Entries are never deleted automatically.
export const spendLog = sqliteTable('spend_log', {
  id: text('id').primaryKey(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  // Estimated cost in USD based on published model pricing at time of call.
  // May not match actual Anthropic charges.
  estimatedCostUsd: real('estimated_cost_usd').notNull()
})
