import { useMemo, useState } from 'react'
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { PageSpinner } from '@/components/ui/Spinner'
import { useCreateResource, useDeleteResource, useResource, useUpdateResource } from '@/hooks/useOperations'
import { useLocalization } from '@/context/useLocalization'

const dateTypes = new Set(['date', 'datetime-local'])

function blankValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? '']))
}

function displayValue(value, column, localization) {
  if (value === null || value === undefined || value === '') return '—'
  if (column.type === 'currency') return localization.currency(value)
  if (column.type === 'date') return localization.date(value, true)
  if (column.type === 'phone') return localization.phone(value)
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value).replaceAll('_', ' ')
}

export default function CrudPage({ resource, title, description, fields, columns, actions, headerAction, emptyText, customModule }) {
  const localization = useLocalization()
  const customQuery = useResource('custom-fields', { module: customModule }, { enabled: Boolean(customModule) })
  const effectiveFields = useMemo(() => [
    ...fields,
    ...(customQuery.data || []).filter((item) => item.is_active).map((item) => ({
      name: `custom__${item.key}`,
      label: item.label,
      type: item.field_type === 'boolean' ? 'checkbox' : (item.field_type === 'select' ? 'select' : item.field_type),
      options: item.options,
      required: item.is_required,
    })),
  ], [customQuery.data, fields])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [values, setValues] = useState(() => blankValues(fields))
  const query = useResource(resource, search ? { search } : {})
  const createMutation = useCreateResource(resource)
  const updateMutation = useUpdateResource(resource)
  const deleteMutation = useDeleteResource(resource)
  const rows = useMemo(() => query.data || [], [query.data])

  function openCreate() {
    setEditing(null); setValues(blankValues(effectiveFields)); setFormOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setValues(Object.fromEntries(effectiveFields.map((field) => {
      let value = field.name.startsWith('custom__') ? row.custom_data?.[field.name.slice(8)] ?? '' : row[field.name] ?? ''
      if (dateTypes.has(field.type) && value) value = field.type === 'date' ? String(value).slice(0, 10) : new Date(value).toISOString().slice(0, 16)
      if (field.type === 'tags' && Array.isArray(value)) value = value.join(', ')
      return [field.name, value]
    })))
    setFormOpen(true)
  }

  function closeForm() { setFormOpen(false); setEditing(null) }

  function submit(event) {
    event.preventDefault()
    const multipart = fields.some((field) => field.type === 'file' && values[field.name] instanceof File)
    const payloadValues = {}
    const customData = { ...(editing?.custom_data || {}) }
    effectiveFields.forEach((field) => {
      let value = values[field.name]
      if (field.type === 'tags') value = String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
      if (field.type === 'multiselect') value = Array.isArray(value) ? value : []
      if (field.type === 'checkbox') value = Boolean(value)
      if (field.type === 'number' && value !== '') value = Number(value)
      if (field.name.startsWith('custom__')) { customData[field.name.slice(8)] = value; return }
      if (field.type === 'file' && !(value instanceof File)) return
      if (value !== '' && value !== null && value !== undefined) payloadValues[field.name] = value
      if (editing && field.clearable && value === '') payloadValues[field.name] = null
    })
    if (customModule) payloadValues.custom_data = customData
    const payload = multipart ? Object.entries(payloadValues).reduce((data, [key, value]) => { data.append(key, Array.isArray(value) ? JSON.stringify(value) : value); return data }, new FormData()) : payloadValues
    const mutation = editing ? updateMutation : createMutation
    mutation.mutate({ id: editing?.id, payload, multipart }, { onSuccess: closeForm })
  }

  if (query.isLoading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h2 className="text-2xl font-bold text-[#263238]">{localization.t(title)}</h2><p className="mt-1 max-w-2xl text-sm text-[#637079]">{description}</p></div>
        <div className="flex gap-2">{headerAction}<Button onClick={openCreate} leftIcon={<Plus size={16} />}>Add {title.replace(/s$/, '')}</Button></div>
      </div>
      <Card className="p-3"><div className="relative"><Search className="absolute left-3 top-2.5 text-[#8b969d]" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-full rounded-lg border border-[#DDE5E3] pl-9 pr-3 text-sm outline-none focus:border-[#496B5A]" placeholder={`Search ${title.toLowerCase()}…`} /></div></Card>
      {query.isError && <Card><p className="text-sm text-red-600">Unable to load {title.toLowerCase()}.</p></Card>}
      {!query.isError && <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#F8FAFA] text-[10px] uppercase tracking-wider text-[#637079]"><tr>{columns.map((column) => <th key={column.key} className="px-5 py-3">{localization.t(column.label)}</th>)}<th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[#EEF2F2] hover:bg-[#FAFCFC]">{columns.map((column) => <td key={column.key} className="max-w-[280px] truncate px-5 py-4 text-[#4f5c64]">{column.render ? column.render(row) : displayValue(row[column.key], column, localization)}</td>)}<td className="px-5 py-4"><div className="flex justify-end gap-1">{actions?.map((action) => <Button key={action.label} size="sm" variant="ghost" onClick={() => action.onClick(row)}>{action.label}</Button>)}<Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEdit(row)}><Edit3 size={15} /></Button><Button size="icon" variant="ghost-danger" aria-label="Delete" onClick={() => { if (window.confirm(`Delete ${row.title || row.full_name || 'this record'}?`)) deleteMutation.mutate(row.id) }}><Trash2 size={15} /></Button></div></td></tr>)}</tbody></table></div>{!rows.length && <p className="py-14 text-center text-sm text-[#637079]">{emptyText || `No ${title.toLowerCase()} yet.`}</p>}</Card>}
      {formOpen && <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}><Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"><div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-bold text-[#263238]">{editing ? 'Edit' : 'Add'} {title.replace(/s$/, '')}</h3><Button size="icon" variant="ghost" onClick={closeForm}><X size={18} /></Button></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{effectiveFields.map((field) => <Field key={field.name} field={field} value={values[field.name]} onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))} />)}<div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button><Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>{editing ? 'Save changes' : 'Create'}</Button></div></form></Card></div>}
    </div>
  )
}

function Field({ field, value, onChange }) {
  const className = field.full ? 'sm:col-span-2' : ''
  if (field.type === 'textarea') return <Textarea className={className} label={field.label} value={value} onChange={(event) => onChange(event.target.value)} required={field.required} rows={3} />
  if (field.type === 'select') return <Select className={className} label={field.label} value={value} onChange={(event) => onChange(event.target.value)} required={field.required}><option value="">Select…</option>{(field.options || []).map((option) => { const item = typeof option === 'string' ? { value: option, label: option.replaceAll('_', ' ') } : option; return <option key={item.value} value={item.value}>{item.label}</option> })}</Select>
  if (field.type === 'multiselect') return <label className={`text-xs font-medium text-[#4f5c64] ${className}`}>{field.label}<select multiple className="mt-1 min-h-28 w-full rounded-lg border border-[#DDE5E3] p-2 text-sm" value={Array.isArray(value) ? value.map(String) : []} onChange={(event) => onChange([...event.target.selectedOptions].map((option) => Number(option.value)))}>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
  if (field.type === 'checkbox') return <label className={`flex items-center gap-2 pt-7 text-sm text-[#263238] ${className}`}><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />{field.label}</label>
  if (field.type === 'file') return <label className={`text-xs font-medium text-[#4f5c64] ${className}`}>{field.label}<input className="mt-1 block w-full rounded-lg border border-[#DDE5E3] p-2 text-sm" type="file" onChange={(event) => onChange(event.target.files?.[0])} required={field.required && !value} /></label>
  return <Input className={className} label={field.label} type={field.type === 'tags' ? 'text' : (field.type || 'text')} value={value} onChange={(event) => onChange(event.target.value)} required={field.required} min={field.min} step={field.step} placeholder={field.placeholder} />
}
