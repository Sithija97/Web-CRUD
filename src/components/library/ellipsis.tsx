import { cn } from '@/lib/utils'

/**
 * One line of user-entered text that is cut off with "…" at the edge of its box
 * instead of stretching the layout. The full text is available as a tooltip.
 */
export function Ellipsis({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <span className={cn('block truncate', className)} title={children}>
      {children}
    </span>
  )
}
