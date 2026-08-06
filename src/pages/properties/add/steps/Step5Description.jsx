import Textarea from '@/components/ui/Textarea'
import Input from '@/components/ui/Input'

export default function Step5Description({ form, errors, onChange, customFields = [] }) {
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
      <div className="grid gap-4 border-t border-[#DDE5E3] pt-5 sm:grid-cols-2">
        <Input label="SEO title" maxLength={70} value={form.seo_title || ''} onChange={(e) => onChange('seo_title', e.target.value)} hint="Recommended: 50–60 characters" />
        <Input label="SEO description" maxLength={180} value={form.seo_description || ''} onChange={(e) => onChange('seo_description', e.target.value)} hint="Recommended: 140–160 characters" />
      </div>
      {customFields.length > 0 && <div className="border-t border-[#DDE5E3] pt-5"><p className="mb-3 text-sm font-semibold text-[#263238]">Custom fields</p><div className="grid gap-4 sm:grid-cols-2">{customFields.map((field) => <CustomField key={field.key} field={field} value={form.custom_data?.[field.key]} onChange={(value) => onChange('custom_data', { ...(form.custom_data || {}), [field.key]: value })} />)}</div></div>}

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

function CustomField({ field, value = '', onChange }) {
  if (field.field_type === 'boolean') return <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />{field.label}</label>
  if (field.field_type === 'select') return <label className="text-xs font-medium">{field.label}<select className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] px-3" value={value} onChange={(e) => onChange(e.target.value)} required={field.is_required}><option value="">Select…</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
  if (field.field_type === 'multiselect') return <label className="text-xs font-medium">{field.label}<select multiple className="mt-1 min-h-24 w-full rounded-lg border border-[#DDE5E3] p-2" value={Array.isArray(value) ? value : []} onChange={(e) => onChange([...e.target.selectedOptions].map((option) => option.value))}>{(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
  return <Input label={field.label} type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} required={field.is_required} />
}

// local helper to avoid importing cn in this lightweight file
function cn(...args) {
  return args.filter(Boolean).join(' ')
}
