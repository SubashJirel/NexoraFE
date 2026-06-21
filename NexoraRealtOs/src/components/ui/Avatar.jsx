import { cn } from '@/lib/cn'

const sizeMap = {
  xs:  { container: 'h-6 w-6',   text: 'text-[10px]' },
  sm:  { container: 'h-8 w-8',   text: 'text-xs' },
  md:  { container: 'h-10 w-10', text: 'text-sm' },
  lg:  { container: 'h-12 w-12', text: 'text-base' },
  xl:  { container: 'h-16 w-16', text: 'text-xl' },
  '2xl': { container: 'h-20 w-20', text: 'text-2xl' },
}

/**
 * Avatar — user profile picture or initials fallback
 * @param {string} src      - image URL
 * @param {string} alt      - alt text / used to generate initials
 * @param {string} size     - xs | sm | md | lg | xl | 2xl
 * @param {string} status   - online | away | busy | offline — shows status dot
 */
export default function Avatar({ src, alt = '', size = 'md', status, className }) {
  const { container, text } = sizeMap[size]

  const initials = alt
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  const statusColor = {
    online:  'bg-green-500',
    away:    'bg-amber-400',
    busy:    'bg-red-500',
    offline: 'bg-[#8b969d]',
  }

  return (
    <div className={cn('relative shrink-0 inline-flex', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center',
          'bg-[#d5e3da] text-[#496B5A] font-semibold select-none',
          container
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span className={text}>{initials || '?'}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white',
            size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
            statusColor[status] || 'bg-[#8b969d]'
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}
