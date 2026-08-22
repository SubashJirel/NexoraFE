import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Edit3, ExternalLink, FileText, Plus, Search, Trash2, Upload, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { PageSpinner } from '@/components/ui/Spinner'
import { useCreateResource, useDeleteResource, useResource, useUpdateResource } from '@/hooks/useOperations'
import { useLocalization } from '@/context/useLocalization'

const dateTypes = new Set(['date', 'datetime-local'])
const deepLinkKeys = {
  tasks: 'task', deals: 'deal', leases: 'lease', appointments: 'appointment',
  'website-submissions': 'submission', 'agent-reviews': 'review',
}

function blankValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? '']))
}

function displayValue(value, column, localization) {
  if (value === null || value === undefined || value === '') return '—'
  if (column.type === 'currency') return localization.currency(value)
  if (column.type === 'date') return localization.date(value, true)
  if (column.type === 'phone') return localization.phone(value)
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return localization.t(value ? 'Yes' : 'No')
  return String(value).replaceAll('_', ' ')
}

export default function CrudPage({ resource, title, description, fields, columns, actions, headerAction, emptyText, customModule }) {
  const localization = useLocalization()
  const [searchParams, setSearchParams] = useSearchParams()
  const handledDeepLink = useRef(null)
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
  const deepLinkKey = deepLinkKeys[resource]
  const deepLinkId = deepLinkKey ? searchParams.get(deepLinkKey) : null

  useEffect(() => {
    if (!deepLinkId || handledDeepLink.current === deepLinkId || !rows.length) return
    const row = rows.find((item) => String(item.id) === String(deepLinkId))
    if (!row) return
    handledDeepLink.current = deepLinkId
    // URL state is an external navigation input that must open the matching record once loaded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditing(row)
    setValues(Object.fromEntries(effectiveFields.map((field) => {
      let value = field.name.startsWith('custom__') ? row.custom_data?.[field.name.slice(8)] ?? '' : row[field.name] ?? ''
      if (dateTypes.has(field.type) && value) value = field.type === 'date' ? String(value).slice(0, 10) : new Date(value).toISOString().slice(0, 16)
      if (field.type === 'tags' && Array.isArray(value)) value = value.join(', ')
      return [field.name, value]
    })))
    setFormOpen(true)
  }, [deepLinkId, effectiveFields, rows])

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

  function closeForm() {
    setFormOpen(false); setEditing(null)
    if (deepLinkKey && searchParams.has(deepLinkKey)) {
      const next = new URLSearchParams(searchParams)
      next.delete(deepLinkKey)
      setSearchParams(next, { replace: true })
    }
  }

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
        <div><h2 className="text-2xl font-bold text-[#263238]">{localization.t(title)}</h2><p className="mt-1 max-w-2xl text-sm text-[#637079]">{localization.t(description, description)}</p></div>
        <div className="flex gap-2">{headerAction}<Button onClick={openCreate} leftIcon={<Plus size={16} />}>{localization.t('Add')} {localization.t(title.replace(/s$/, ''))}</Button></div>
      </div>
      <Card className="p-3"><div className="relative"><Search className="absolute left-3 top-2.5 text-[#8b969d]" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-full rounded-lg border border-[#DDE5E3] pl-9 pr-3 text-sm outline-none focus:border-[#496B5A]" placeholder={`${localization.t('Search')} ${localization.t(title).toLowerCase()}…`} /></div></Card>
      {query.isError && <Card><p className="text-sm text-red-600">Unable to load {localization.t(title).toLowerCase()}.</p></Card>}
      {!query.isError && <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#F8FAFA] text-[10px] uppercase tracking-wider text-[#637079]"><tr>{columns.map((column) => <th key={column.key} className="px-5 py-3">{localization.t(column.label)}</th>)}<th className="px-5 py-3 text-right">{localization.t('Actions')}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[#EEF2F2] hover:bg-[#FAFCFC]">{columns.map((column) => <td key={column.key} className="max-w-[280px] truncate px-5 py-4 text-[#4f5c64]">{column.render ? column.render(row) : displayValue(row[column.key], column, localization)}</td>)}<td className="px-5 py-4"><div className="flex justify-end gap-1">{actions?.map((action) => <Button key={action.label} size="sm" variant="ghost" onClick={() => action.onClick(row)}>{localization.t(action.label)}</Button>)}<Button size="icon" variant="ghost" aria-label={localization.t('Edit')} onClick={() => openEdit(row)}><Edit3 size={15} /></Button><Button size="icon" variant="ghost-danger" aria-label={localization.t('Remove')} onClick={() => { if (window.confirm(`Delete ${row.title || row.full_name || 'this record'}?`)) deleteMutation.mutate(row.id) }}><Trash2 size={15} /></Button></div></td></tr>)}</tbody></table></div>{!rows.length && <p className="py-14 text-center text-sm text-[#637079]">{localization.t(emptyText || `No ${title.toLowerCase()} yet.`, emptyText || `No ${title.toLowerCase()} yet.`)}</p>}</Card>}
      {formOpen && <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}><Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"><div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-bold text-[#263238]">{localization.t(editing ? 'Edit' : 'Add')} {localization.t(title.replace(/s$/, ''))}</h3><Button size="icon" variant="ghost" onClick={closeForm}><X size={18} /></Button></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{effectiveFields.map((field) => <Field key={field.name} field={field} value={values[field.name]} onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))} localization={localization} />)}<div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={closeForm}>{localization.t('Cancel')}</Button><Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>{localization.t(editing ? 'Save changes' : 'Create')}</Button></div></form></Card></div>}
    </div>
  )
}

function Field({ field, value, onChange, localization }) {
  const className = field.full ? 'sm:col-span-2' : ''
  if (field.type === 'textarea') return <Textarea className={className} label={localization.t(field.label)} value={value} onChange={(event) => onChange(event.target.value)} required={field.required} rows={3} />
  if (field.type === 'select') return <Select className={className} label={localization.t(field.label)} value={value} onChange={(event) => onChange(event.target.value)} required={field.required}><option value="">{localization.t('Select')}…</option>{(field.options || []).map((option) => { const item = typeof option === 'string' ? { value: option, label: option.replaceAll('_', ' ') } : option; return <option key={item.value} value={item.value}>{localization.t(item.label, item.label)}</option> })}</Select>
  if (field.type === 'multiselect') return <label className={`text-xs font-medium text-[#4f5c64] ${className}`}>{localization.t(field.label)}<select multiple className="mt-1 min-h-28 w-full rounded-lg border border-[#DDE5E3] p-2 text-sm" value={Array.isArray(value) ? value.map(String) : []} onChange={(event) => onChange([...event.target.selectedOptions].map((option) => Number(option.value)))}>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{localization.t(option.label, option.label)}</option>)}</select></label>
  if (field.type === 'checkbox') return <label className={`flex items-center gap-2 pt-7 text-sm text-[#263238] ${className}`}><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />{localization.t(field.label)}</label>
  if (field.type === 'file') return <FileField field={field} value={value} onChange={onChange} localization={localization} className={className} />
  return <Input className={className} label={localization.t(field.label)} type={field.type === 'tags' ? 'text' : (field.type || 'text')} value={value} onChange={(event) => onChange(event.target.value)} required={field.required} min={field.min} step={field.step} placeholder={field.placeholder ? localization.t(field.placeholder, field.placeholder) : undefined} />
}

function FileField({ field, value, onChange, localization, className }) {
  const objectUrl = useMemo(() => value instanceof File ? URL.createObjectURL(value) : '', [value])
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }, [objectUrl])

  const previewUrl = objectUrl || (typeof value === 'string' ? value : '')
  const fileName = value instanceof File ? value.name : fileNameFromUrl(value)
  const type = value instanceof File ? value.type : fileTypeFromName(fileName)
  const isImage = type.startsWith('image/')
  const isPdf = type === 'application/pdf'

  return (
    <div className={`text-xs font-medium text-[#4f5c64] ${className}`}>
      <span>{localization.t(field.label)}</span>
      {value && (
        <div className="mt-1.5 flex min-h-16 items-center gap-3 rounded-lg border border-[#DDE5E3] bg-[#F8FAFA] p-2.5">
          {isImage && previewUrl ? (
            <img src={previewUrl} alt="Selected document preview" className="h-12 w-12 shrink-0 rounded-md border border-[#DDE5E3] object-cover" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white text-[#496B5A] ring-1 ring-[#DDE5E3]">
              <FileText size={isPdf ? 23 : 22} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#263238]" title={fileName}>{fileName || 'Current file'}</p>
            <p className="mt-0.5 text-[11px] font-normal text-[#8b969d]">{value instanceof File ? 'New file selected' : 'Currently saved file'}</p>
          </div>
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noreferrer" title="Open preview" aria-label={`Open ${fileName || 'file'}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#496B5A] hover:bg-[#eef3f0]">
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      )}
      <label className="mt-2 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#B8C9C5] bg-white px-3 text-sm font-semibold text-[#496B5A] transition hover:border-[#496B5A] hover:bg-[#eef3f0]">
        <Upload size={15} />
        {value ? 'Replace file' : 'Choose file'}
        <input
          className="sr-only"
          type="file"
          accept={field.accept}
          onChange={(event) => onChange(event.target.files?.[0] || value)}
          required={field.required && !value}
        />
      </label>
      {field.hint && <p className="mt-1.5 text-[11px] font-normal text-[#8b969d]">{field.hint}</p>}
    </div>
  )
}

function fileNameFromUrl(value) {
  if (!value || typeof value !== 'string') return ''
  const raw = value.split('?')[0].split('#')[0].split('/').pop() || ''
  try { return decodeURIComponent(raw) } catch { return raw }
}

function fileTypeFromName(name = '') {
  const extension = name.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) return `image/${extension === 'jpg' ? 'jpeg' : extension}`
  if (extension === 'pdf') return 'application/pdf'
  return 'application/octet-stream'
}
