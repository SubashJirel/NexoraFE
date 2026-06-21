import { cn } from '@/lib/cn'

const variantMap = {
  default:  'bg-[#eef3f0] text-[#496B5A]',
  primary:  'bg-[#496B5A] text-white',
  secondary:'bg-[#d5e3da] text-[#2c4237]',
  success:  'bg-green-100 text-green-700',
  warning:  'bg-amber-100 text-amber-700',
  error:    'bg-red-100 text-red-700',
  info:     'bg-blue-100 text-blue-700',
  neutral:  'bg-[#f0f2f3] text-[#263238]',
}

const sizeMap = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

/**
 * Badge — status indicators, labels, counts
 * @param {string} variant - default | primary | secondary | success | warning | error | info | neutral
 * @param {string} size    - sm | md | lg
 * @param {boolean} dot    - shows a colored dot before text
 */
export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        variantMap[variant],
        sizeMap[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'error'   && 'bg-red-500',
            variant === 'info'    && 'bg-blue-500',
            variant === 'primary' && 'bg-white',
            (variant === 'default' || variant === 'secondary') && 'bg-[#496B5A]',
            variant === 'neutral' && 'bg-[#637079]',
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
