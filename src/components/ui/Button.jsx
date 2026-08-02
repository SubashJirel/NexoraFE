import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

const sizeMap = {
  sm:  'h-8  px-3   text-xs  gap-1.5',
  md:  'h-9  px-4   text-sm  gap-2',
  lg:  'h-11 px-5   text-sm  gap-2',
  xl:  'h-12 px-6   text-base gap-2.5',
  icon:'h-9  w-9    text-sm',
}

const variantMap = {
  primary:   'bg-[#496B5A] text-white hover:bg-[#3a5649] active:bg-[#2c4237] shadow-sm',
  secondary: 'bg-[#8FAF9B] text-[#263238] hover:bg-[#769686] active:bg-[#5e7d6c]',
  inverted:  'bg-[#263238] text-white hover:bg-[#1f2a30] active:bg-[#182128]',
  outlined:  'bg-transparent border border-[#496B5A] text-[#496B5A] hover:bg-[#eef3f0] active:bg-[#d5e3da]',
  ghost:     'bg-transparent text-[#496B5A] hover:bg-[#eef3f0] active:bg-[#d5e3da]',
  danger:    'bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c] shadow-sm',
  'ghost-danger': 'bg-transparent text-[#ef4444] hover:bg-red-50 active:bg-red-100',
}

/**
 * Button
 *
 * @param {string}  variant   - primary | secondary | inverted | outlined | ghost | danger | ghost-danger
 * @param {string}  size      - sm | md | lg | xl | icon
 * @param {boolean} loading   - shows spinner and disables button
 * @param {boolean} fullWidth - stretches to container width
 * @param {node}    leftIcon  - icon element placed before label
 * @param {node}    rightIcon - icon element placed after label
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        // Base
        'inline-flex items-center justify-center rounded-lg font-semibold',
        'transition-all duration-150 select-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496B5A]',
        // Size
        sizeMap[size],
        // Variant
        variantMap[variant],
        // States
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 12 : 16} />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
})

function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Button
