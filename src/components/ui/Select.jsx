import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

/**
 * Select — styled native select matching Input design
 */
const Select = forwardRef(function Select(
  { label, hint, error, size = 'md', className, id, disabled, children, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id || `select-${generatedId}`
  const hasError = Boolean(error)

  const sizeMap = { sm: 'h-8 text-xs px-3', md: 'h-10 text-sm px-3', lg: 'h-11 text-sm px-4' }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#263238]">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        disabled={disabled}
        aria-invalid={hasError}
        className={cn(
          'w-full rounded-lg border bg-white font-[inherit] appearance-none cursor-pointer',
          'text-[#263238] pr-9',
          'bg-[right_0.75rem_center] bg-no-repeat',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
          sizeMap[size],
          hasError
            ? 'border-[#ef4444] focus:ring-[#ef4444]/30'
            : 'border-[#DDE5E3] hover:border-[#B8C9C5]',
          disabled && 'opacity-50 cursor-not-allowed bg-[#EEF2F2]',
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23637079' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
        {...props}
      >
        {children}
      </select>
      {(error || hint) && (
        <p className={cn('text-xs', error ? 'text-[#ef4444]' : 'text-[#637079]')}>
          {error || hint}
        </p>
      )}
    </div>
  )
})

export default Select
