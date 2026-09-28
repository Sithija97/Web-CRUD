import { useInfiniteQuery } from '@tanstack/react-query'
import { getFiles } from '@/lib/api'

export const filesQueryKey = ['files'] as const

export function useFiles() {
  return useInfiniteQuery({
    queryKey: filesQueryKey,
    queryFn: ({ pageParam }) => getFiles(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
