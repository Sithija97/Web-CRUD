import { useState } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { normalizeSubject } from '@/lib/subjects'
import { cn } from '@/lib/utils'

interface Props
  extends Omit<React.ComponentProps<typeof Button>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  /** Subjects to suggest; anything else the user types becomes a new subject. */
  options: readonly string[]
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/** Pick an existing subject or type a new one. Extra props go to the trigger button. */
export function SubjectCombobox({
  value,
  onChange,
  options,
  className,
  ...buttonProps
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const isNew = value !== '' && !options.some((o) => same(o, value))
  // A not-yet-saved subject (typed earlier, or detected from the file) stays selectable.
  const choices = isNew ? [value, ...options] : options

  const typed = normalizeSubject(query)
  const canAdd = typed !== '' && !choices.some((o) => same(o, typed))

  function choose(name: string) {
    onChange(name)
    setOpen(false)
    setQuery('')
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery('')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full min-w-0 max-w-full justify-between px-3 font-normal dark:bg-input/30',
            !value && 'text-muted-foreground',
            className,
          )}
          {...buttonProps}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">{value || 'Select or add subject'}</span>
            {isNew && (
              <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                New
              </span>
            )}
          </span>
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-56 p-0"
      >
        <Command>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search or type a new subject…"
          />
          <CommandList>
            {/* When a name can be added, the "Add" row below is the answer. */}
            {!canAdd && <CommandEmpty>Type a name to add a subject.</CommandEmpty>}
            <CommandGroup>
              {choices.map((name) => (
                <CommandItem key={name} value={name} onSelect={() => choose(name)}>
                  <Check
                    className={cn('opacity-0', same(name, value) && 'opacity-100')}
                  />
                  <span className="truncate" title={name}>
                    {name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            {canAdd && (
              // Its own group, force-mounted: cmdk hides a group (and an item inside
              // it) when nothing in the group matches the search text.
              <CommandGroup forceMount>
                <CommandItem
                  forceMount
                  value={`__add__${typed}`}
                  onSelect={() => choose(typed)}
                >
                  <Plus />
                  <span className="truncate">Add “{typed}”</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
