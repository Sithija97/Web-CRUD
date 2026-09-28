import { formatDistanceToNow } from 'date-fns'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/format'
import { useDownloadPdf } from '@/hooks/use-download-pdf'
import type { PdfFile } from '@/lib/types'

export function PdfCard({ file }: { file: PdfFile }) {
  const download = useDownloadPdf()

  return (
    <Card className="gap-3">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <FileText className="size-8 shrink-0 text-muted-foreground" />
          <Badge variant="secondary">{file.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-2 font-medium">{file.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatFileSize(file.size_bytes)} ·{' '}
          {formatDistanceToNow(new Date(file.uploaded_at), {
            addSuffix: true,
          })}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={download.isPending}
          onClick={() => download.mutate(file.id)}
        >
          {download.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}
