import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PdfErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <AlertTriangle className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">Couldn't load the PDF library</p>
        <p className="text-sm text-muted-foreground">
          The API may be unreachable. Check VITE_API_BASE and try again.
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
