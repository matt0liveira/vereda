interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function Input({ label, hint, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-semibold text-content">
          {label}
          {props.required && <span className="ml-0.5 text-brand">*</span>}
        </label>
      )}
      {hint && <p className="text-xs text-content-subtle -mt-0.5">{hint}</p>}
      <input
        className={`w-full rounded-[9px] border px-3.5 py-2.5 text-sm text-content outline-none transition-colors placeholder:text-content-subtle
          ${error
            ? 'border-status-error-text bg-surface focus:border-status-error-text'
            : 'border-surface-border bg-surface-bg focus:border-brand focus:bg-surface'
          }
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-status-error-text">{error}</p>}
    </div>
  )
}
