PURPOSE
I want to build an app for helping me build optimized my resume for job applications. I want to apply to jobs faster, create resumes that both more likely to pass ATS systems and stand out to human readers, and create resumes that accurately represent my experience without hallucinations.

FEATURES
- Can be run offline.
- Generated resumes are ATS optimized, while being pretty to look at.
- Upload existing resume(s) as a baseline. Populates internal database.
- Generate an optimized resume based off a job description that's copy-pasted into the app.
- Ability to edit resume entries manually, as well as interactively prompt the AI/app to update it automatically.
- Session is auto-saved when app is closed, and auto-loaded when app is opened. This includes the resume(s) currently being worked on, knowldged of previously uploaded resumes, and previously generated resumes.
- Checks how well a generated resume fits the job description.
- Finalized resumes are saved for later reference. These resumes are categorized by company name, role title, summary of position, date generated.
- Saved resumes are used as references for future resumes.
 
IMPLEMENTATION
React app

ARCHITECTURE
React app, written in TypeScript that utilizes an atomic design pattern.

Use Storybook with automated testing.

Use a Justfile for common commands/targets.