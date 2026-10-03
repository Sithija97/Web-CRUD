import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFile, putToSignedUrl, requestUploadUrl } from '@/lib/api'
import type { UploadFormValues } from '@/lib/upload-schema'
import { COUNTS_KEY, FILES_KEY } from '@/hooks/use-files'
import { SUBJECTS_KEY } from '@/hooks/use-subjects'

export function useUploadFile() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(0)
  // If the bytes reached R2 but saving metadata failed, a retry reuses that
  // upload instead of sending the whole file again.
  const uploaded = useRef<{ file: File; key: string } | null>(null)

  const mutation = useMutation({
    mutationFn: async (values: UploadFormValues) => {
      const { file } = values
      setProgress(0)

      let key: string
      if (uploaded.current?.file === file) {
        key = uploaded.current.key
        setProgress(100)
      } else {
        const contentType = file.type || 'application/pdf'
        const signed = await requestUploadUrl(file.name, contentType)
        await putToSignedUrl(signed.uploadUrl, file, setProgress)
        key = signed.key
        uploaded.current = { file, key }
      }

      return createFile({
        key,
        filename: file.name,
        size: file.size,
        contentType: file.type || 'application/pdf',
        title: values.title,
        subject: values.subject,
        gradeLevel: values.gradeLevel,
        paperType: values.paperType,
        year: Number(values.year),
        term: values.term || undefined,
        description: values.description || undefined,
      })
    },
    onSuccess: () => {
      uploaded.current = null
      void queryClient.invalidateQueries({ queryKey: FILES_KEY })
      void queryClient.invalidateQueries({ queryKey: COUNTS_KEY })
      // An upload can add a subject; a delete can remove the last file of one.
      void queryClient.invalidateQueries({ queryKey: SUBJECTS_KEY })
    },
  })

  return { ...mutation, progress }
}
