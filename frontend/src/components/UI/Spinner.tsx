interface SpinnerProps {
  message?: string
}

export function Spinner({ message }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-surface-border border-t-brand" />
      {message && <p className="text-sm text-content-muted">{message}</p>}
    </div>
  )
}
