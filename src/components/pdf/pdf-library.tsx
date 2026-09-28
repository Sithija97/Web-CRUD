import { useState } from 'react'
import { LayoutGrid, List, Loader2 } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { PdfHeader } from '@/components/pdf/pdf-header'
import { PdfGrid } from '@/components/pdf/pdf-grid'
import { PdfTable } from '@/components/pdf/pdf-table'
import { PdfGridSkeleton, PdfTableSkeleton } from '@/components/pdf/pdf-list-skeleton'
import { PdfEmptyState } from '@/components/pdf/pdf-empty-state'
import { PdfErrorState } from '@/components/pdf/pdf-error-state'
import { UploadPdfDialog } from '@/components/pdf/upload-pdf-dialog'
import { useFiles } from '@/hooks/use-files'

type ViewMode = 'grid' | 'table'

export function PdfLibrary() {
  const [view, setView] = useState<ViewMode>('grid')
  const [uploadOpen, setUploadOpen] = useState(false)

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFiles()

  const files = data?.pages.flatMap((page) => page.files) ?? []

  return (
    <div className="flex min-h-screen flex-col">
      <PdfHeader onAdd={() => setUploadOpen(true)} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        {!isPending && !isError && files.length > 0 && (
          <div className="flex justify-end">
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) => value && setView(value as ViewMode)}
              variant="outline"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <List className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {isPending ? (
          view === 'grid' ? (
            <PdfGridSkeleton />
          ) : (
            <PdfTableSkeleton />
          )
        ) : isError ? (
          <PdfErrorState onRetry={() => refetch()} />
        ) : files.length === 0 ? (
          <PdfEmptyState onAdd={() => setUploadOpen(true)} />
        ) : (
          <>
            {view === 'grid' ? (
              <PdfGrid files={files} />
            ) : (
              <PdfTable files={files} />
            )}

            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <UploadPdfDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
