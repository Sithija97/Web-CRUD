import { PdfCard } from '@/components/pdf/pdf-card'
import type { PdfFile } from '@/lib/types'

export function PdfGrid({ files }: { files: PdfFile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => (
        <PdfCard key={file.id} file={file} />
      ))}
    </div>
  )
}
