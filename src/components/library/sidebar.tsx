import { BookOpen, FolderOpen, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// Decorative for the POC: only the library item is "real".
const ITEMS = [
  { icon: FolderOpen, label: 'Library', active: true },
  { icon: Users, label: 'Students', active: false },
  { icon: Settings, label: 'Settings', active: false },
]

export function Sidebar() {
  return (
    <aside className="hidden w-14 shrink-0 flex-col md:flex items-center gap-2 border-r border-slate-800 bg-slate-900 py-4">
      <div
        className="mb-4 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        aria-label="Study Materials"
      >
        <BookOpen className="size-5" />
      </div>
      {ITEMS.map(({ icon: Icon, label, active }) => (
        <div
          key={label}
          title={label}
          className={cn(
            'flex size-9 items-center justify-center rounded-lg text-slate-400',
            active && 'bg-slate-800 text-white',
          )}
        >
          <Icon className="size-[18px]" />
        </div>
      ))}
    </aside>
  )
}
