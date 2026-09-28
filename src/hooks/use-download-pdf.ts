import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getDownloadUrl } from '@/lib/api'

export function useDownloadPdf() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { downloadUrl } = await getDownloadUrl(id)
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    },
    onError: () => {
      toast.error('Could not get download link. Please try again.')
    },
  })
}
