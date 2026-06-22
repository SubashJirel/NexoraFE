import Textarea from '@/components/ui/Textarea'
import Input from '@/components/ui/Input'

export default function Step5Description({ form, errors, onChange }) {
  const shortLen = (form.short_description || '').length
  const descLen  = (form.description || '').length

  return (
    <div className="space-y-5">

      {/* short_description → API field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#263238]">Short Description</label>
          <span className={cn('text-xs', shortLen > 160 ? 'text-[#ef4444]' : 'text-[#8b969d]')}>
            {shortLen} / 160
          </span>
        </div>
        <Input
          placeholder="Brief one-sentence summary shown on property cards"
          value={form.short_description}
          onChange={(e) => onChange('short_description', e.target.value)}
          error={errors.short_description}
          hint="Appears on listing cards and search results."
        />
      </div>

      {/* description → API field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#263238]">Full Description</label>
          <span className="text-xs text-[#8b969d]">{descLen} chars</span>
        </div>
        <Textarea
          rows={7}
          placeholder="Describe the property in detail. Highlight its selling points, neighbourhood amenities, construction quality, nearby facilities, and what makes it unique."
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          error={errors.description}
        />
      </div>
    </div>
  )
}

// local helper to avoid importing cn in this lightweight file
function cn(...args) {
  return args.filter(Boolean).join(' ')
}
