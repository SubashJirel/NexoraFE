import { cn } from '@/lib/cn'

/**
 * Card — surface container with consistent spacing and shadow
 * @param {string}  padding  - none | sm | md | lg
 * @param {boolean} hoverable - adds hover lift effect
 * @param {boolean} bordered  - adds a border
 */
export function Card({
  padding = 'md',
  hoverable = false,
  bordered = true,
  className,
  children,
  ...props
}) {
  const paddingMap = {
    none: '',
    sm:   'p-4',
    md:   'p-5',
    lg:   'p-6',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl',
        bordered && 'border border-[#DDE5E3]',
        'shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]',
        hoverable && 'transition-shadow duration-200 hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.10)] cursor-pointer',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 pb-4 border-b border-[#DDE5E3]', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn('text-base font-semibold text-[#263238]', className)}>
      {children}
    </h3>
  )
}

export function CardBody({ className, children }) {
  return (
    <div className={cn('pt-4', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('pt-4 mt-4 border-t border-[#DDE5E3] flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  )
}
