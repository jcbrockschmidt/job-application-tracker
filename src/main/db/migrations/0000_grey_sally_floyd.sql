CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`role_title` text NOT NULL,
	`brief_summary` text,
	`date_generated` text NOT NULL,
	`resume_status` text DEFAULT 'draft' NOT NULL,
	`cover_letter_status` text DEFAULT 'none' NOT NULL,
	`application_status` text DEFAULT 'not_applied' NOT NULL,
	`notes` text,
	`submitted_date` text,
	`directory_path` text,
	`resume_last_finalized_at` integer,
	`resume_incorporated_at` integer,
	`cover_letter_last_finalized_at` integer,
	`cover_letter_incorporated_at` integer,
	`cover_letter_writing_profile_incorporated_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`job_description` text NOT NULL,
	`match_report` text,
	`last_saved` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `source_docs` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`type` text NOT NULL,
	`path` text NOT NULL,
	`uploaded_at` integer NOT NULL,
	`writing_profile_incorporated_at` integer
);
--> statement-breakpoint
CREATE TABLE `spend_log` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL,
	`model` text NOT NULL,
	`input_tokens` integer NOT NULL,
	`output_tokens` integer NOT NULL,
	`estimated_cost_usd` real NOT NULL
);
