import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteFiles } from '@/lib/api'
import { COUNTS_KEY, FILES_KEY } from '@/hooks/use-files'
import { SUBJECTS_KEY } from '@/hooks/use-subjects'

export function useDeleteFiles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => deleteFiles(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FILES_KEY })
      void queryClient.invalidateQueries({ queryKey: COUNTS_KEY })
      // An upload can add a subject; a delete can remove the last file of one.
      void queryClient.invalidateQueries({ queryKey: SUBJECTS_KEY })
    },
  })
}
