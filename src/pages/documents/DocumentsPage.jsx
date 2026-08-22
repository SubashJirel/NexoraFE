import CrudPage from '@/components/operations/CrudPage'
import { useResource } from '@/hooks/useOperations'
import { useProperties } from '@/hooks/useProperties'
import { useLeads } from '@/hooks/useLeads'
import { FileText } from 'lucide-react'

const opts = (rows, label) => (rows || []).map((row) => ({ value: row.id, label: row[label] }))

export default function DocumentsPage() {
  const deals = useResource('deals'); const contacts = useResource('contacts'); const owners = useResource('owners'); const properties = useProperties(); const leads = useLeads()
  const fields = [
    { name: 'title', label: 'Document title', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['identity', 'ownership', 'contract', 'receipt', 'floor_plan', 'other'], defaultValue: 'other' },
    { name: 'file', label: 'File', type: 'file', required: true, accept: '.jpg,.jpeg,.png,.webp,.pdf,.mp4', hint: 'Images show a thumbnail; PDFs and other supported files show a file icon.' }, { name: 'lead', label: 'Lead', type: 'select', options: opts(leads.data, 'full_name') }, { name: 'property', label: 'Property', type: 'select', options: opts(properties.data, 'title') },
    { name: 'deal', label: 'Deal', type: 'select', options: opts(deals.data, 'title') }, { name: 'contact', label: 'Contact', type: 'select', options: opts(contacts.data, 'full_name') },
    { name: 'owner', label: 'Owner', type: 'select', options: opts(owners.data, 'full_name') },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
  ]
  return <CrudPage resource="documents" title="Documents" description="Securely organize identity, ownership, contract, receipt, floor-plan, lead, and transaction documents." fields={fields} columns={[{ key: 'title', label: 'Document', render: (row) => <DocumentSummary row={row} /> }, { key: 'category', label: 'Category' }, { key: 'lead_name', label: 'Lead' }, { key: 'uploaded_by_name', label: 'Uploaded by' }, { key: 'created_at', label: 'Uploaded', type: 'date' }]} />
}

function DocumentSummary({ row }) {
  const url = row.file_url || row.file
  const fileName = fileNameFromUrl(url)
  const isImage = /\.(jpe?g|png|webp)(?:$|[?#])/i.test(url || '')
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2.5 hover:text-[#496B5A]" title="Open document">
      {isImage && url
        ? <img src={url} alt="" className="h-9 w-9 shrink-0 rounded-md border border-[#DDE5E3] object-cover" />
        : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#eef3f0] text-[#496B5A]"><FileText size={17} /></span>}
      <span className="min-w-0"><span className="block truncate font-semibold text-[#263238]">{row.title}</span><span className="block truncate text-[11px] text-[#8b969d]">{fileName || 'File'}</span></span>
    </a>
  )
}

function fileNameFromUrl(value) {
  const raw = String(value || '').split('?')[0].split('/').pop() || ''
  try { return decodeURIComponent(raw) } catch { return raw }
}
