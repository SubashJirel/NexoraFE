import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { useCreateLead, useUpdateLead } from '@/hooks/useLeads'
import { useAgents } from '@/hooks/useAgents'
import { LEAD_SOURCES, PROPERTY_TYPES, PURPOSES, LEAD_STATUSES } from '../leadsConstants'
import { useResource } from '@/hooks/useOperations'
import { isValidNepalPhone } from '@/utils/phone'

const EMPTY = {
  full_name:          '',
  phone:              '',
  email:              '',
  source:             'phone',
  status:             'new',
  assigned_agent:     '',
  budget_min:         '',
  budget_max:         '',
  preferred_location: '',
  purpose:            'sale',
  property_type:      'house',
  notes:              '',
  custom_data:        {},
}

export default function LeadFormModal({ lead, onClose }) {
  const isEdit = Boolean(lead)
  const { data: agents = [] } = useAgents()
  const customFields = useResource('custom-fields', { module: 'lead' })
  const customStages = useResource('pipeline-stages', { module: 'lead' })
  const leadStatuses = [
    ...LEAD_STATUSES,
    ...(customStages.data || []).filter((item) => !LEAD_STATUSES.some((status) => status.value === item.key)).map((item) => ({ value: item.key, label: item.name })),
  ]

  const [form, setForm] = useState(
    isEdit
      ? {
          full_name:          lead.full_name          ?? '',
          phone:              lead.phone              ?? '',
          email:              lead.email              ?? '',
          source:             lead.source             ?? 'website',
          status:             lead.status             ?? 'new',
          assigned_agent:     lead.assigned_agent     ?? '',
          budget_min:         lead.budget_min         ?? '',
          budget_max:         lead.budget_max         ?? '',
          preferred_location: lead.preferred_location ?? '',
          purpose:            lead.purpose            ?? 'sale',
          property_type:      lead.property_type      ?? 'house',
          notes:              lead.notes              ?? '',
          custom_data:        lead.custom_data        ?? {},
        }
      : EMPTY
  )
  const [errors, setErrors] = useState({})

  const createMutation = useCreateLead({ onSuccess: onClose })
  const updateMutation = useUpdateLead(lead?.id, { onSuccess: onClose })
  const isPending = createMutation.isPending || updateMutation.isPending

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Name is required.'
    if (!form.phone.trim()) e.phone = 'Phone is required.'
    else if (!isValidNepalPhone(form.phone)) e.phone = 'Enter 10 digits starting with 97, 98, or 01.'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email.'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const payload = {
      ...form,
      assigned_agent: form.assigned_agent || null,
      budget_min:     form.budget_min     || null,
      budget_max:     form.budget_max     || null,
    }

    if (isEdit) updateMutation.mutate(payload)
    else        createMutation.mutate(payload)
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE5E3] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#eef3f0] flex items-center justify-center">
              <UserPlus size={16} className="text-[#496B5A]" />
            </div>
            <h2 className="text-base font-semibold text-[#263238]">
              {isEdit ? 'Edit Lead' : 'Add New Lead'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#637079] hover:bg-[#F8FAFA] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-5">

            {/* ── Contact ── */}
            <Section title="Contact Info">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  placeholder="Bina Karki"
                  value={form.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                  error={errors.full_name}
                  disabled={isPending}
                  autoFocus
                />
                <PhoneInput
                  label="Phone *"
                  value={form.phone}
                  onChange={(value) => set('phone', value)}
                  error={errors.phone}
                  disabled={isPending}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="lead@example.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  error={errors.email}
                  disabled={isPending}
                />
                <Select
                  label="Source"
                  value={form.source}
                  onChange={(e) => set('source', e.target.value)}
                  disabled={isPending}
                >
                  {LEAD_SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>
            </Section>

            {/* ── Pipeline ── */}
            <Section title="Pipeline">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  disabled={isPending}
                >
                  {leadStatuses.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
                <Select
                  label="Assigned Agent"
                  value={form.assigned_agent}
                  onChange={(e) => set('assigned_agent', e.target.value)}
                  disabled={isPending}
                >
                  <option value="">— Unassigned —</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </Select>
              </div>
            </Section>

            {(customFields.data || []).length > 0 && <Section title="Custom Fields"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{customFields.data.filter((field) => field.is_active).map((field) => <CustomLeadField key={field.key} field={field} value={form.custom_data?.[field.key]} onChange={(value) => set('custom_data', { ...(form.custom_data || {}), [field.key]: value })} />)}</div></Section>}

            {/* ── Property requirement ── */}
            <Section title="Property Requirement">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Purpose"
                  value={form.purpose}
                  onChange={(e) => set('purpose', e.target.value)}
                  disabled={isPending}
                >
                  {PURPOSES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
                <Select
                  label="Property Type"
                  value={form.property_type}
                  onChange={(e) => set('property_type', e.target.value)}
                  disabled={isPending}
                >
                  {PROPERTY_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
                <Input
                  label="Budget Min (₹)"
                  type="number"
                  placeholder="e.g. 5000000"
                  value={form.budget_min}
                  onChange={(e) => set('budget_min', e.target.value)}
                  disabled={isPending}
                />
                <Input
                  label="Budget Max (₹)"
                  type="number"
                  placeholder="e.g. 15000000"
                  value={form.budget_max}
                  onChange={(e) => set('budget_max', e.target.value)}
                  disabled={isPending}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Preferred Location"
                    placeholder="e.g. Jhamsikhel, Lalitpur"
                    value={form.preferred_location}
                    onChange={(e) => set('preferred_location', e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>
            </Section>

            {/* ── Notes ── */}
            <Section title="Notes">
              <Textarea
                placeholder="Any additional context about this lead…"
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                disabled={isPending}
              />
            </Section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 pb-5 shrink-0">
            <Button variant="outlined" size="md" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={isPending}>
              {isEdit ? 'Save Changes' : 'Add Lead'}
            </Button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}

function CustomLeadField({ field, value = '', onChange }) {
  if (field.field_type === 'boolean') return <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />{field.label}</label>
  if (field.field_type === 'select') return <Select label={field.label} value={value} onChange={(e) => onChange(e.target.value)} required={field.is_required}><option value="">Select…</option>{(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</Select>
  if (field.field_type === 'multiselect') return <label className="text-xs font-medium">{field.label}<select multiple className="mt-1 min-h-24 w-full rounded-lg border border-[#DDE5E3] p-2" value={Array.isArray(value) ? value : []} onChange={(e) => onChange([...e.target.selectedOptions].map((option) => option.value))}>{(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
  return <Input label={field.label} type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} required={field.is_required} />
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#8b969d] uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  )
}

export function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {children}
    </div>
  )
}
