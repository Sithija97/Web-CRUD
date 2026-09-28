import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRecord, getUploadUrl, uploadFileToUrl } from '@/lib/api'
import { filesQueryKey } from '@/hooks/use-files'
import type { UploadFormValues } from '@/lib/upload-schema'

interface UploadPdfArgs extends UploadFormValues {
  onProgress: (percent: number) => void
}

export function useUploadPdf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      title,
      category,
      description,
      onProgress,
    }: UploadPdfArgs) => {
      const { key, uploadUrl } = await getUploadUrl(file.name, file.type)
      await uploadFileToUrl(uploadUrl, file, onProgress)
      await createFileRecord({
        key,
        filename: file.name,
        size: file.size,
        contentType: file.type,
        title,
        category,
        description: description || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesQueryKey })
    },
  })
}
