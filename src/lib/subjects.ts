import { DEFAULT_SUBJECTS } from '@/lib/constants'

/** Collapses internal whitespace, as the Worker does when saving. */
export function normalizeSubject(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

/**
 * Subjects to offer: those already in the library plus the starter defaults,
 * de-duplicated ignoring case (the library's spelling wins), alphabetical with
 * "Other" last.
 */
export function mergeSubjects(inUse: readonly string[]): string[] {
  const byKey = new Map<string, string>()
  for (const name of [...inUse, ...DEFAULT_SUBJECTS]) {
    const key = normalizeSubject(name).toLowerCase()
    if (key && !byKey.has(key)) byKey.set(key, normalizeSubject(name))
  }
  return [...byKey.values()].sort((a, b) => {
    const aOther = a.toLowerCase() === 'other'
    const bOther = b.toLowerCase() === 'other'
    if (aOther !== bOther) return aOther ? 1 : -1
    return a.localeCompare(b)
  })
}
