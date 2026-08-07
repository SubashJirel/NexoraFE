import { useEffect, useState } from 'react'
import { Check, ChevronDown, ChevronUp, FileCheck2, ShieldCheck, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import { usePropertyVerification, useUpdatePropertyVerification, useUpdatePropertyVerificationDocument } from '@/hooks/usePropertyVerification'

const MILESTONES = [
  ['owner_identity_verified', 'Owner identity verified'],
  ['ownership_document_received', 'Ownership document received'],
  ['physically_inspected', 'Agency physically inspected'],
  ['documents_reviewed', 'Documents reviewed'],
  ['fully_verified', 'Fully verified'],
]
const STATUSES = [
  ['missing', 'Missing'], ['received', 'Received'], ['under_review', 'Under review'],
  ['approved', 'Approved'], ['rejected', 'Needs correction'], ['not_applicable', 'Not applicable'],
]

export default function PropertyVerificationPanel({ propertyId }) {
  const { data, isLoading, isError } = usePropertyVerification(propertyId)
  const updateVerification = useUpdatePropertyVerification(propertyId)
  const updateDocument = useUpdatePropertyVerificationDocument(propertyId)
  const [openDocument, setOpenDocument] = useState(null)
  const [error, setError] = useState('')

  if (isLoading) return <PanelShell><p className="text-sm text-[#637079]">Loading verification checklist…</p></PanelShell>
  if (isError || !data) return <PanelShell><p className="text-sm text-red-600">Unable to load verification workflow.</p></PanelShell>

  function updateMilestone(field, checked) {
    const index = MILESTONES.findIndex(([key]) => key === field)
    const payload = Object.fromEntries(MILESTONES.map(([key], itemIndex) => [
      key,
      itemIndex === index ? checked : (!checked && itemIndex > index ? false : Boolean(data[key])),
    ]))
    setError('')
    updateVerification.mutate(payload, { onError: (requestError) => setError(readApiError(requestError)) })
  }

  return (
    <PanelShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-[#496B5A]" /><h3 className="font-semibold text-[#263238]">Verification & Due Diligence</h3></div>
          <p className="mt-1 text-xs text-[#637079]">Private agency workflow. Uploaded legal documents are never shown publicly.</p>
        </div>
        <div className="text-right">
          <Badge variant={data.fully_verified ? 'success' : 'warning'}>{data.verification_level_display}</Badge>
          <p className="mt-1 text-xs text-[#637079]">{data.approved_document_count}/{data.total_document_count} documents resolved</p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        {MILESTONES.map(([field, label], index) => (
          <label key={field} className={`rounded-xl border p-3 text-xs transition ${data[field] ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-[#DDE5E3] bg-[#F8FAFA] text-[#637079]'}`}>
            <input type="checkbox" className="mr-2" checked={Boolean(data[field])} disabled={updateVerification.isPending || (index > 0 && !data[MILESTONES[index - 1][0]])} onChange={(event) => updateMilestone(field, event.target.checked)} />
            {label}
          </label>
        ))}
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      <div className="space-y-2">
        {data.documents.map((document) => (
          <DocumentRow key={document.document_type} document={document} open={openDocument === document.document_type} onToggle={() => setOpenDocument((value) => value === document.document_type ? null : document.document_type)} onSave={(payload) => { setError(''); updateDocument.mutate({ documentType: document.document_type, payload }, { onError: (requestError) => setError(readApiError(requestError)) }) }} saving={updateDocument.isPending} />
        ))}
      </div>

      <NotesEditor data={data} saving={updateVerification.isPending} onSave={(payload) => updateVerification.mutate(payload, { onError: (requestError) => setError(readApiError(requestError)) })} />
    </PanelShell>
  )
}

function DocumentRow({ document, open, onToggle, onSave, saving }) {
  const [form, setForm] = useState(document)
  useEffect(() => setForm(document), [document])
  const statusTone = document.status === 'approved' || document.status === 'not_applicable' ? 'success' : document.status === 'rejected' ? 'error' : document.status === 'missing' ? 'neutral' : 'warning'
  return <div className="overflow-hidden rounded-xl border border-[#DDE5E3] bg-white">
    <div className="flex items-center gap-3 p-3">
      <FileCheck2 size={16} className="shrink-0 text-[#496B5A]" />
      <button type="button" onClick={onToggle} className="flex flex-1 items-center justify-between gap-3 text-left"><span className="text-sm font-medium text-[#263238]">{document.document_type_display}</span>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
      <Badge variant={statusTone} size="sm">{document.status_display}</Badge>
    </div>
    {open && <div className="space-y-4 border-t border-[#EEF2F2] bg-[#F8FAFA] p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-medium text-[#637079]">Review status<select value={form.status} onChange={(event) => setForm((value) => ({ ...value, status: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] bg-white px-3 text-sm">{STATUSES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <Input label="Document number" value={form.document_number || ''} onChange={(event) => setForm((value) => ({ ...value, document_number: event.target.value }))} />
        <Input label="External secure link" value={form.external_url || ''} onChange={(event) => setForm((value) => ({ ...value, external_url: event.target.value }))} />
        <Input label="Issued date" type="date" value={form.issued_date || ''} onChange={(event) => setForm((value) => ({ ...value, issued_date: event.target.value }))} />
        <Input label="Expiry date" type="date" value={form.expiry_date || ''} onChange={(event) => setForm((value) => ({ ...value, expiry_date: event.target.value }))} />
        <Input label="Review notes" value={form.notes || ''} onChange={(event) => setForm((value) => ({ ...value, notes: event.target.value }))} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><label className="cursor-pointer rounded-lg border border-[#DDE5E3] bg-white px-3 py-2 text-xs font-semibold text-[#496B5A]"><Upload size={13} className="mr-1 inline" />Choose document<input type="file" accept=".pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => setForm((value) => ({ ...value, file: event.target.files?.[0] }))} /></label>{form.file instanceof File && <span className="text-xs text-[#637079]">{form.file.name}</span>}{document.file && !(form.file instanceof File) && <a href={document.file} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#496B5A]">View current file</a>}</div>
        <Button size="sm" loading={saving} leftIcon={<Check size={13} />} onClick={() => onSave({ status: form.status, document_number: form.document_number || '', external_url: form.external_url || '', issued_date: form.issued_date || null, expiry_date: form.expiry_date || null, notes: form.notes || '', ...(form.file instanceof File ? { file: form.file } : {}) })}>Save document</Button>
      </div>
      {document.reviewed_by_name && <p className="text-[11px] text-[#8b969d]">Last reviewed by {document.reviewed_by_name}{document.reviewed_at ? ` on ${new Date(document.reviewed_at).toLocaleString()}` : ''}</p>}
    </div>}
  </div>
}

function NotesEditor({ data, onSave, saving }) {
  const [inspectionNotes, setInspectionNotes] = useState(data.inspection_notes || '')
  const [reviewNotes, setReviewNotes] = useState(data.review_notes || '')
  useEffect(() => { setInspectionNotes(data.inspection_notes || ''); setReviewNotes(data.review_notes || '') }, [data])
  return <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><Input label="Physical inspection notes" value={inspectionNotes} onChange={(event) => setInspectionNotes(event.target.value)} /><Input label="Due-diligence review notes" value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} /><Button className="self-end" size="sm" loading={saving} onClick={() => onSave({ inspection_notes: inspectionNotes, review_notes: reviewNotes })}>Save notes</Button></div>
}

function PanelShell({ children }) { return <section className="space-y-5 rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:p-6">{children}</section> }
function readApiError(error) { const data = error?.response?.data; if (!data) return 'Unable to update verification.'; if (typeof data === 'string') return data; return Object.values(data).flat().join(' ') }
