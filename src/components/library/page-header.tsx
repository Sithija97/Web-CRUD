import { Bell, BookOpen, CircleHelp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/library/theme-toggle'

export function PageHeader({ total }: { total: number | undefined }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* The sidebar (and its logo) is hidden on phones. */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground md:hidden" aria-hidden>
          <BookOpen className="size-4" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight whitespace-nowrap sm:text-2xl">
          Study Materials
        </h1>
        {total !== undefined && (
          <Badge
            variant="secondary"
            className="rounded-full border border-border bg-card px-2.5 text-muted-foreground"
          >
            {total}
          </Badge>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Notifications">
          <Bell />
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Help">
          <CircleHelp />
        </Button>
        <div
          className="ml-1 flex size-8 shrink-0 sm:ml-2 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
          aria-hidden
        >
          ST
        </div>
      </div>
    </header>
  )
}
