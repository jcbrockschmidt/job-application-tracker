// TODO: Implement incremental backup logic
//
// Responsibilities:
// - Copy changed files since last backup to the configured backup directory
// - Run automatically every 5 minutes and on app close
// - Support manual full backup export
// - Support importing a backup archive to restore data

export async function runIncrementalBackup(_backupDir: string): Promise<void> {
  throw new Error('Not implemented')
}

export async function exportFullBackup(_destPath: string): Promise<void> {
  throw new Error('Not implemented')
}

export async function importBackup(_backupPath: string): Promise<void> {
  throw new Error('Not implemented')
}
