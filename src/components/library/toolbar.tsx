import { ChevronDown, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GRADE_LEVELS } from '@/lib/constants'

// Radix radio items can't carry an empty value, so "All" uses a sentinel.
const ALL = '__all__'

interface Props {
  search: string
  subject: string
  gradeLevel: string
  /** Subjects that have files in the library. */
  subjects: readonly string[]
  onSearchChange: (value: string) => void
  onSubjectChange: (value: string) => void
  onGradeLevelChange: (value: string) => void
  onNew: () => void
}

export function Toolbar({
  search,
  subject,
  gradeLevel,
  subjects,
  onSearchChange,
  onSubjectChange,
  onGradeLevelChange,
  onNew,
}: Props) {
  const activeCount = Number(!!subject) + Number(!!gradeLevel)
  const label =
    activeCount === 0
      ? 'All'
      : activeCount === 1
        ? subject || gradeLevel
        : `${activeCount} filters`

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-24 justify-between">
            <span className="max-w-40 truncate" title={label}>
              {label}
            </span>
            <ChevronDown className="opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 max-w-[calc(100vw-2rem)]">
          <DropdownMenuLabel>Subject</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={subject || ALL}
            onValueChange={(v) => onSubjectChange(v === ALL ? '' : v)}
          >
            <DropdownMenuRadioItem value={ALL}>All subjects</DropdownMenuRadioItem>
            {subjects.map((s) => (
              <DropdownMenuRadioItem key={s} value={s}>
                <span className="truncate" title={s}>
                  {s}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Grade / Level</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={gradeLevel || ALL}
            onValueChange={(v) => onGradeLevelChange(v === ALL ? '' : v)}
          >
            <DropdownMenuRadioItem value={ALL}>All grades</DropdownMenuRadioItem>
            {GRADE_LEVELS.map((g) => (
              <DropdownMenuRadioItem key={g} value={g}>
                {g}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative order-last basis-full sm:order-none sm:max-w-2xl sm:flex-1 sm:basis-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title..."
          className="rounded-lg pl-9"
          aria-label="Search by title"
        />
      </div>

      <Button onClick={onNew} className="ml-auto rounded-lg shadow-sm">
        <Plus /> New
      </Button>
    </div>
  )
}
