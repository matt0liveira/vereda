type BadgeVariant = 'planned' | 'draft' | 'done' | 'error'

// Map DB status values → visual variants
export const STATUS_BADGE: Record<string, BadgeVariant> = {
  saved:  'planned',
  draft:  'draft',
  done:   'done',
  error:  'error',
}

interface BadgeProps {
  variant?: BadgeVariant
  label: string
}

export function Badge({ variant = 'draft', label }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    planned: 'bg-status-planned-bg text-status-planned-text',
    draft:   'bg-status-draft-bg text-status-draft-text',
    done:    'bg-status-done-bg text-status-done-text',
    error:   'bg-status-error-bg text-status-error-text',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.5px] ${styles[variant]}`}>
      {label}
    </span>
  )
}
