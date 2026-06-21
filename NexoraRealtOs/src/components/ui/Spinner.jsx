import { cn } from '@/lib/cn'

const sizeMap = {
  sm:  'h-4 w-4',
  md:  'h-6 w-6',
  lg:  'h-8 w-8',
  xl:  'h-12 w-12',
}

/**
 * Spinner — loading indicator
 * @param {string} size  - sm | md | lg | xl
 * @param {string} color - any tailwind text color class
 */
export default function Spinner({ size = 'md', className }) {
  return (
    <svg
      className={cn('animate-spin text-[#496B5A]', sizeMap[size], className)}
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="status"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PageSpinner() {
  return (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
