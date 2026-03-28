interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'danger-outline'
  loading?: boolean
}

export function Button({ variant = 'primary', loading = false, children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-brand text-white hover:bg-brand-dark',
    secondary: 'bg-surface text-content border-[1.5px] border-surface-border hover:border-surface-border-filled',
    danger:    'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
    'danger-outline': 'bg-transparent text-[#DC2626] border-0 hover:text-[#B91C1C]',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  )
}
