import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

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
  resumeJsonPath: text('resume_json_path'),
  coverLetterJsonPath: text('cover_letter_json_path'),
  directoryPath: text('directory_path'),
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
  matchReport: text('match_report'),
  lastSaved: text('last_saved').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})
