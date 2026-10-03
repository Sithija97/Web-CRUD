import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatBytes, formatDateTime } from '@/lib/format'
import type { StudyFile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Ellipsis } from '@/components/library/ellipsis'
import { PaperTypeBadge } from '@/components/library/paper-type-badge'

const COLUMNS = 10

interface Props {
  files: StudyFile[]
  /** Rows before this page, so numbering continues across pages. */
  rowOffset: number
  downloadingId: string | null
  onDownload: (id: string) => void
  selected: ReadonlySet<string>
  onSelectionChange: (next: Set<string>) => void
}

function DownloadButton({
  file,
  pending,
  onDownload,
  className,
}: {
  file: StudyFile
  pending: boolean
  onDownload: (id: string) => void
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={`Download ${file.title}`}
      disabled={pending}
      onClick={() => onDownload(file.id)}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Download />}
    </Button>
  )
}

/**
 * The full table on large screens; a card list below `lg`, where a
 * ten-column table would force sideways scrolling.
 */
export function FilesTable({
  files,
  rowOffset,
  downloadingId,
  onDownload,
  selected,
  onSelectionChange,
}: Props) {
  const selectedOnPage = files.filter((f) => selected.has(f.id)).length
  const headerState: boolean | 'indeterminate' =
    files.length > 0 && selectedOnPage === files.length
      ? true
      : selectedOnPage > 0
        ? 'indeterminate'
        : false

  function toggleAll(checked: boolean) {
    onSelectionChange(checked ? new Set(files.map((f) => f.id)) : new Set())
  }

  function toggleOne(id: string, checked: boolean) {
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    onSelectionChange(next)
  }

  return (
    <>
      <div className="hidden lg:block">
        <Table className="min-w-225">
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="w-10">
                <Checkbox
                  checked={headerState}
                  onCheckedChange={(c) => toggleAll(c === true)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Grade/Level</TableHead>
              <TableHead>Paper Type</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file, i) => (
              <TableRow
                key={file.id}
                data-state={selected.has(file.id) ? 'selected' : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(file.id)}
                    onCheckedChange={(c) => toggleOne(file.id, c === true)}
                    aria-label={`Select ${file.title}`}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {rowOffset + i + 1}
                </TableCell>
                <TableCell className="max-w-xs">
                  <span
                    className="block truncate font-semibold text-primary dark:text-indigo-400"
                    title={file.title}
                  >
                    {file.title}
                  </span>
                  {file.term && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {file.term}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Ellipsis className="max-w-44">{file.subject}</Ellipsis>
                </TableCell>
                <TableCell>
                  <Ellipsis className="max-w-32">{file.gradeLevel}</Ellipsis>
                </TableCell>
                <TableCell>
                  <PaperTypeBadge type={file.paperType} />
                </TableCell>
                <TableCell className="tabular-nums">
                  {file.year ?? '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(file.uploadedAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatBytes(file.sizeBytes)}
                </TableCell>
                <TableCell className="text-right">
                  <DownloadButton
                    file={file}
                    pending={downloadingId === file.id}
                    onDownload={onDownload}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden">
        <label className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-3 text-sm font-medium">
          <Checkbox
            checked={headerState}
            onCheckedChange={(c) => toggleAll(c === true)}
            aria-label="Select all"
          />
          Select all
        </label>
        <ul className="divide-y divide-border">
          {files.map((file) => (
            <li
              key={file.id}
              className={cn(
                'flex items-start gap-3 px-4 py-3',
                selected.has(file.id) && 'bg-muted',
              )}
            >
              <Checkbox
                className="mt-1"
                checked={selected.has(file.id)}
                onCheckedChange={(c) => toggleOne(file.id, c === true)}
                aria-label={`Select ${file.title}`}
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p
                  className="line-clamp-2 font-semibold wrap-anywhere text-primary dark:text-indigo-400"
                  title={file.title}
                >
                  {file.title}
                </p>
                {file.term && (
                  <Ellipsis className="text-xs text-muted-foreground">
                    {file.term}
                  </Ellipsis>
                )}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <PaperTypeBadge type={file.paperType} />
                  <Ellipsis className="min-w-0 flex-1 text-sm">
                    {`${file.subject} · ${file.gradeLevel}`}
                  </Ellipsis>
                </div>
                <p className="text-xs text-muted-foreground">
                  {[
                    file.year,
                    formatDateTime(file.uploadedAt),
                    formatBytes(file.sizeBytes),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <DownloadButton
                className="-my-1 -mr-2 size-10 shrink-0"
                file={file}
                pending={downloadingId === file.id}
                onDownload={onDownload}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export function FilesTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading study materials">
      <div className="hidden lg:block">
        <Table className="min-w-225">
          <TableBody>
            {Array.from({ length: rows }, (_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: COLUMNS }, (_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="divide-y divide-border lg:hidden">
        {Array.from({ length: Math.min(rows, 5) }, (_, i) => (
          <li key={i} className="flex gap-3 px-4 py-4">
            <Skeleton className="mt-1 size-4 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
