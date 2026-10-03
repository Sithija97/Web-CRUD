import { FileText, SearchX, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

function StateShell({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
      {children}
    </div>
  )
}

export function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <StateShell
      icon={<FileText className="size-6" />}
      title="No study materials yet — upload the first one"
    >
      <Button onClick={onUpload}>Upload a PDF</Button>
    </StateShell>
  )
}

export function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <StateShell
      icon={<SearchX className="size-6" />}
      title="No materials match your filters"
    >
      <Button variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    </StateShell>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <StateShell
      icon={<TriangleAlert className="size-6" />}
      title="Couldn't load study materials"
    >
      <p className="max-w-sm text-sm wrap-anywhere text-muted-foreground">
        {message}
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </StateShell>
  )
}
