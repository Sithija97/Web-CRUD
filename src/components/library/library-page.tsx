import { useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useDeleteFiles } from '@/hooks/use-delete-files'
import { useDownload } from '@/hooks/use-download'
import { useFileCounts, useFiles } from '@/hooks/use-files'
import { useSubjects } from '@/hooks/use-subjects'
import { getErrorMessage } from '@/lib/api'
import { PAGE_SIZE } from '@/lib/constants'
import type { PaperType, StudyFile } from '@/lib/types'
import { DeleteDialog } from '@/components/library/delete-dialog'
import { FilesPagination } from '@/components/library/files-pagination'
import {
  FilesTable,
  FilesTableSkeleton,
} from '@/components/library/files-table'
import { FilterTabs } from '@/components/library/filter-tabs'
import { PageHeader } from '@/components/library/page-header'
import { SelectionBar } from '@/components/library/selection-bar'
import { Sidebar } from '@/components/library/sidebar'
import {
  EmptyState,
  ErrorState,
  NoResultsState,
} from '@/components/library/states'
import { Toolbar } from '@/components/library/toolbar'
import { UploadDialog } from '@/components/library/upload-dialog'

export function LibraryPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [paperType, setPaperType] = useState<PaperType | ''>('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [deleteTargets, setDeleteTargets] = useState<StudyFile[] | null>(null)

  const search = useDebouncedValue(searchInput.trim(), 300)
  const query = { page, pageSize: PAGE_SIZE, search, subject, gradeLevel, paperType }

  const files = useFiles(query)
  const counts = useFileCounts()
  const { download, pendingId } = useDownload()
  const deleteFiles = useDeleteFiles()
  const subjects = useSubjects()

  const hasFilters = !!(search || subject || gradeLevel || paperType)

  // Any filter change sends the user back to the first page.
  function filterSetter<T>(set: (value: T) => void) {
    return (value: T) => {
      set(value)
      changePage(1)
    }
  }

  // Selection only ever refers to rows on the current page.
  function changePage(next: number) {
    setPage(next)
    setSelected(new Set())
  }

  function clearFilters() {
    setSearchInput('')
    setSubject('')
    setGradeLevel('')
    setPaperType('')
    changePage(1)
  }

  const data = files.data
  const openUpload = () => setUploadOpen(true)

  function requestDelete() {
    setDeleteTargets(data?.files.filter((f) => selected.has(f.id)) ?? [])
  }

  function confirmDelete() {
    if (!deleteTargets?.length) return
    const ids = deleteTargets.map((f) => f.id)
    deleteFiles.mutate(ids, {
      onSuccess: ({ deleted }) => {
        toast.success(deleted === 1 ? 'File deleted' : `${deleted} files deleted`)
        setDeleteTargets(null)
        setSelected(new Set())
        // Deleting every row on the last page would otherwise leave us on an empty page.
        if (data && page > 1 && ids.length >= data.files.length) setPage(page - 1)
      },
      onError: (err) => {
        toast.error('Delete failed', {
          description: getErrorMessage(err),
          action: { label: 'Retry', onClick: confirmDelete },
        })
      },
    })
  }

  let body: React.ReactNode
  if (files.isError) {
    body = (
      <ErrorState
        message={getErrorMessage(files.error)}
        onRetry={() => void files.refetch()}
      />
    )
  } else if (!data) {
    body = <FilesTableSkeleton />
  } else if (data.files.length === 0) {
    body = hasFilters ? (
      <NoResultsState onClear={clearFilters} />
    ) : (
      <EmptyState onUpload={openUpload} />
    )
  } else {
    body = (
      <FilesTable
        files={data.files}
        rowOffset={(data.page - 1) * data.pageSize}
        downloadingId={pendingId}
        onDownload={(id) => void download(id)}
        selected={selected}
        onSelectionChange={setSelected}
      />
    )
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 space-y-4 p-4 sm:space-y-5 sm:p-6">
        <PageHeader total={counts.data?.all} />
        <Toolbar
          search={searchInput}
          subject={subject}
          gradeLevel={gradeLevel}
          subjects={subjects.inUse}
          onSearchChange={filterSetter(setSearchInput)}
          onSubjectChange={filterSetter(setSubject)}
          onGradeLevelChange={filterSetter(setGradeLevel)}
          onNew={openUpload}
        />
        <FilterTabs
          value={paperType}
          counts={counts.data}
          onChange={filterSetter(setPaperType)}
        />

        {selected.size > 0 && (
          <SelectionBar
            count={selected.size}
            onClear={() => setSelected(new Set())}
            onDelete={requestDelete}
          />
        )}

        <div
          className={
            'overflow-x-auto rounded-lg border border-border bg-card shadow-sm transition-opacity' +
            (files.isPlaceholderData ? ' opacity-60' : '')
          }
        >
          {body}
        </div>

        {data && data.totalPages > 1 && (
          <FilesPagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={changePage}
          />
        )}
      </main>
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <DeleteDialog
        files={deleteTargets}
        pending={deleteFiles.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargets(null)}
      />
    </div>
  )
}
