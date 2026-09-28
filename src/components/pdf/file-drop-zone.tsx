import { useRef, useState } from 'react'
import { FileText, UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/format'

interface FileDropZoneProps {
  value: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
  error?: string
}

export function FileDropZone({
  value,
  onChange,
  disabled,
  error,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    onChange(file)
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-md border p-3">
        <FileText className="size-8 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{value.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(value.size)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          onClick={() => {
            onChange(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
        >
          <X className="size-4" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors',
          isDragging ? 'border-primary bg-accent' : 'border-input',
          error && 'border-destructive',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <UploadCloud className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          Click to browse or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">PDF files only</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
