import { useQuery } from '@tanstack/react-query'
import { fetchSubjects } from '@/lib/api'
import { mergeSubjects } from '@/lib/subjects'

export const SUBJECTS_KEY = ['subjects'] as const

export function useSubjects() {
  const query = useQuery({ queryKey: SUBJECTS_KEY, queryFn: fetchSubjects })

  // Subjects that have files; used by the filter menu.
  const inUse = (query.data ?? []).map((s) => s.name)
  // In-use subjects plus the starter defaults; used by the upload form.
  const options = mergeSubjects(inUse)

  return { inUse, options }
}
