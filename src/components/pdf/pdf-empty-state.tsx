import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PdfEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <FileText className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">No PDFs yet</p>
        <p className="text-sm text-muted-foreground">
          Upload your first one to get started.
        </p>
      </div>
      <Button onClick={onAdd}>
        <Plus className="size-4" />
        Add PDF
      </Button>
    </div>
  )
}
