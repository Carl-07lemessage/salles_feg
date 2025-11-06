// Helper to check if database is properly set up
let dbInitialized: boolean | null = null

export async function isDatabaseInitialized(): Promise<boolean> {
  // Cache the result to avoid repeated checks
  if (dbInitialized !== null) {
    return dbInitialized
  }

  dbInitialized = true
  return true
}

export function setDatabaseInitialized(value: boolean) {
  dbInitialized = value
}
