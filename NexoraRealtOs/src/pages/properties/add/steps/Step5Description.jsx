import Textarea from '@/components/ui/Textarea'
import Input from '@/components/ui/Input'

export default function Step5Description({ form, errors, onChange }) {
  return (
    <div className="space-y-5">
      <Input
        label="Short Summary"
        placeholder="Brief one-sentence summary for property cards"
        value={form.summary}
        onChange={(e) => onChange('summary', e.target.value)}
        hint="Shown on property cards. Keep it under 100 characters."
      />

      <Textarea
        label="Full Description"
        rows={6}
        placeholder="Describe the property in detail. Highlight its selling points, neighbourhood amenities, and construction quality."
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
        error={errors.description}
      />
    </div>
  )
}
