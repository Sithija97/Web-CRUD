import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { StudyFile } from '@/lib/types'

const PREVIEW_LIMIT = 5

interface Props {
  /** Files pending deletion; the dialog is open while this is non-null. */
  files: StudyFile[] | null
  pending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteDialog({ files, pending, onConfirm, onCancel }: Props) {
  const count = files?.length ?? 0

  return (
    <Dialog
      open={files !== null}
      // Don't allow dismissal while the request is in flight.
      onOpenChange={(open) => !open && !pending && onCancel()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Delete {count === 1 ? 'this file' : `${count} files`}?
          </DialogTitle>
          <DialogDescription>
            This permanently removes {count === 1 ? 'it' : 'them'} from the
            library and storage. This can't be undone.
          </DialogDescription>
        </DialogHeader>

        <ul className="min-w-0 space-y-1 rounded-lg border border-border bg-muted/60 p-3 text-sm">
          {files?.slice(0, PREVIEW_LIMIT).map((f) => (
            <li key={f.id} className="truncate font-medium" title={f.title}>
              {f.title}
            </li>
          ))}
          {count > PREVIEW_LIMIT && (
            <li className="text-muted-foreground">
              and {count - PREVIEW_LIMIT} more…
            </li>
          )}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
