import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchCounts, fetchFiles } from '@/lib/api'
import type { FilesQuery } from '@/lib/types'

export const FILES_KEY = ['files'] as const
export const COUNTS_KEY = ['file-counts'] as const

export function useFiles(query: FilesQuery) {
  return useQuery({
    queryKey: [...FILES_KEY, query],
    queryFn: () => fetchFiles(query),
    // Keep the current rows on screen while the next page/filter loads.
    placeholderData: keepPreviousData,
  })
}

export function useFileCounts() {
  return useQuery({ queryKey: COUNTS_KEY, queryFn: fetchCounts })
}
