import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

/**
 * Input
 *
 * @param {string} label       - visible label above input
 * @param {string} hint        - helper text below input
 * @param {string} error       - error message (replaces hint, turns border red)
 * @param {node}   leftAddon   - icon or element inside left of input
 * @param {node}   rightAddon  - icon or element inside right of input
 * @param {string} size        - sm | md | lg
 */
const sizeMap = {
  sm: 'h-8  text-xs px-3',
  md: 'h-10 text-sm px-3',
  lg: 'h-11 text-sm px-4',
}

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    leftAddon,
    rightAddon,
    size = 'md',
    className,
    id,
    disabled,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id || `input-${generatedId}`
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#263238]"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3 flex items-center text-[#637079] pointer-events-none">
            {leftAddon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'w-full rounded-lg border bg-white font-[inherit]',
            'text-[#263238] placeholder:text-[#8b969d]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
            sizeMap[size],
            leftAddon && 'pl-9',
            rightAddon && 'pr-9',
            hasError
              ? 'border-[#ef4444] focus:ring-[#ef4444]/30 focus:border-[#ef4444]'
              : 'border-[#DDE5E3] hover:border-[#B8C9C5]',
            disabled && 'opacity-50 cursor-not-allowed bg-[#EEF2F2]',
            className
          )}
          {...props}
        />

        {rightAddon && (
          <span className="absolute right-3 flex items-center text-[#637079]">
            {rightAddon}
          </span>
        )}
      </div>

      {(error || hint) && (
        <p
          id={error ? `${inputId}-error` : `${inputId}-hint`}
          className={cn('text-xs', error ? 'text-[#ef4444]' : 'text-[#637079]')}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
})

export default Input
