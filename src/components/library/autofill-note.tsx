import { Loader2, Sparkles } from 'lucide-react'

interface Props {
  status: 'idle' | 'reading' | 'done'
  filled: string[]
  readText: boolean
  newSubject?: string
}

export function AutofillNote({ status, filled, readText, newSubject }: Props) {
  if (status === 'idle') return null

  if (status === 'reading') {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Reading the file to fill in the details…
      </p>
    )
  }

  if (filled.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Couldn't detect any details from this file. Please fill them in below.
      </p>
    )
  }

  return (
    <p className="flex items-start gap-2 text-xs text-muted-foreground">
      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <span className="min-w-0 wrap-anywhere">
        Filled in from the file: {filled.join(', ')}. Check them and edit
        anything that's wrong.
        {newSubject &&
          ` “${newSubject}” is a new subject and will be added when you upload.`}
        {!readText && ' (No text found in the PDF, so only the filename was used.)'}
      </span>
    </p>
  )
}
