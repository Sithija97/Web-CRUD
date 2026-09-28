import { formatDistanceToNow } from 'date-fns'
import { Download, Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/format'
import { useDownloadPdf } from '@/hooks/use-download-pdf'
import type { PdfFile } from '@/lib/types'

function PdfTableRow({ file }: { file: PdfFile }) {
  const download = useDownloadPdf()

  return (
    <TableRow>
      <TableCell className="max-w-64 truncate font-medium">
        {file.title}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{file.category}</Badge>
      </TableCell>
      <TableCell>{formatFileSize(file.size_bytes)}</TableCell>
      <TableCell>
        {formatDistanceToNow(new Date(file.uploaded_at), {
          addSuffix: true,
        })}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={download.isPending}
          onClick={() => download.mutate(file.id)}
        >
          {download.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          <span className="sr-only">Download</span>
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function PdfTable({ files }: { files: PdfFile[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <PdfTableRow key={file.id} file={file} />
        ))}
      </TableBody>
    </Table>
  )
}
