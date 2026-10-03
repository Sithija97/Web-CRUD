import { useState } from 'react'
import { toast } from 'sonner'
import { fetchDownloadUrl, getErrorMessage } from '@/lib/api'

export function useDownload() {
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function download(id: string) {
    setPendingId(id)
    try {
      const url = await fetchDownloadUrl(id)
      // Straight from R2 via the short-lived signed URL; no bytes pass through the app.
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      toast.error('Could not start download', {
        description: getErrorMessage(err),
        action: { label: 'Retry', onClick: () => void download(id) },
      })
    } finally {
      setPendingId(null)
    }
  }

  return { download, pendingId }
}
