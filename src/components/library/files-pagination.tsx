import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { getPageItems } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Props {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const DISABLED = 'pointer-events-none opacity-50'

export function FilesPagination({ page, totalPages, onPageChange }: Props) {
  const go = (target: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (target >= 1 && target <= totalPages && target !== page) {
      onPageChange(target)
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={go(page - 1)}
            aria-disabled={page <= 1}
            className={cn(page <= 1 && DISABLED)}
          />
        </PaginationItem>
        {getPageItems(page, totalPages).map((p, i) =>
          p === null ? (
            <PaginationItem key={`gap-${i}`} className="hidden sm:block">
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            // On phones only the current page is shown, followed by "of N".
            <PaginationItem key={p} className={p === page ? undefined : "hidden sm:block"}>
              <PaginationLink href="#" isActive={p === page} onClick={go(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <li className="px-1 text-sm text-muted-foreground sm:hidden">of {totalPages}</li>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={go(page + 1)}
            aria-disabled={page >= totalPages}
            className={cn(page >= totalPages && DISABLED)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
