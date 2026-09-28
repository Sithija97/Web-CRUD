import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PdfHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
      <h1 className="text-xl font-semibold">PDF Library</h1>
      <Button onClick={onAdd}>
        <Plus className="size-4" />
        Add
      </Button>
    </header>
  )
}
