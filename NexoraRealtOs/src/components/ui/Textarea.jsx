import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * Textarea — styled textarea matching Input design
 */
const Textarea = forwardRef(function Textarea(
  { label, hint, error, rows = 4, className, id, disabled, ...props },
  ref
) {
  const inputId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#263238]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        disabled={disabled}
        aria-invalid={hasError}
        className={cn(
          'w-full rounded-lg border bg-white font-[inherit] resize-y',
          'text-sm text-[#263238] placeholder:text-[#8b969d]',
          'px-3 py-2.5 transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
          hasError
            ? 'border-[#ef4444] focus:ring-[#ef4444]/30'
            : 'border-[#DDE5E3] hover:border-[#B8C9C5]',
          disabled && 'opacity-50 cursor-not-allowed bg-[#EEF2F2]',
          className
        )}
        {...props}
      />
      {(error || hint) && (
        <p className={cn('text-xs', error ? 'text-[#ef4444]' : 'text-[#637079]')}>
          {error || hint}
        </p>
      )}
    </div>
  )
})

export default Textarea
