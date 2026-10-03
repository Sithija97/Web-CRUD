import { PAPER_TYPES } from '@/lib/constants'
import type { PaperType } from '@/lib/types'
import { cn } from '@/lib/utils'

const STYLES: Record<PaperType, { pill: string; dot: string }> = {
  past_paper: { pill: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300', dot: 'bg-blue-500' },
  model_paper: { pill: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300', dot: 'bg-green-500' },
  marking_scheme: { pill: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', dot: 'bg-amber-500' },
  notes: { pill: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300', dot: 'bg-purple-500' },
  other: { pill: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300', dot: 'bg-slate-400' },
}

function paperTypeLabel(type: PaperType) {
  return PAPER_TYPES.find((t) => t.value === type)?.label ?? type
}

export function PaperTypeBadge({ type }: { type: PaperType }) {
  const style = STYLES[type] ?? STYLES.other
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        style.pill,
      )}
    >
      <span className={cn('size-1.5 rounded-full', style.dot)} />
      {paperTypeLabel(type)}
    </span>
  )
}
