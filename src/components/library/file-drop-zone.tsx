import { useRef, useState } from 'react'
import { FileText, UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Props {
  value: File | undefined
  onChange: (file: File | undefined) => void
  disabled?: boolean
  invalid?: boolean
}

export function FileDropZone({ value, onChange, disabled, invalid }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  if (value) {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-muted/60 p-3">
        <FileText className="size-8 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{value.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(value.size)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove file"
          disabled={disabled}
          onClick={() => onChange(undefined)}
        >
          <X />
        </Button>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && !disabled) onChange(file)
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-input px-4 py-6 text-center transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        dragging && 'border-primary bg-accent',
        invalid && 'border-destructive',
      )}
    >
      <UploadCloud className="size-7 text-muted-foreground" />
      <p className="text-sm">
        <span className="font-medium text-primary">Browse</span> or drag a PDF here
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.files?.[0])
          // Allow re-picking the same file after removing it.
          e.target.value = ''
        }}
      />
    </div>
  )
}
