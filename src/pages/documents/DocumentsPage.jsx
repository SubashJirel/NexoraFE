import CrudPage from '@/components/operations/CrudPage'
import { useResource } from '@/hooks/useOperations'
import { useProperties } from '@/hooks/useProperties'
import { useLeads } from '@/hooks/useLeads'

const opts = (rows, label) => (rows || []).map((row) => ({ value: row.id, label: row[label] }))

export default function DocumentsPage() {
  const deals = useResource('deals'); const contacts = useResource('contacts'); const owners = useResource('owners'); const properties = useProperties(); const leads = useLeads()
  const fields = [
    { name: 'title', label: 'Document title', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['identity', 'ownership', 'contract', 'receipt', 'floor_plan', 'other'], defaultValue: 'other' },
    { name: 'file', label: 'File', type: 'file', required: true }, { name: 'lead', label: 'Lead', type: 'select', options: opts(leads.data, 'full_name') }, { name: 'property', label: 'Property', type: 'select', options: opts(properties.data, 'title') },
    { name: 'deal', label: 'Deal', type: 'select', options: opts(deals.data, 'title') }, { name: 'contact', label: 'Contact', type: 'select', options: opts(contacts.data, 'full_name') },
    { name: 'owner', label: 'Owner', type: 'select', options: opts(owners.data, 'full_name') },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
  ]
  return <CrudPage resource="documents" title="Documents" description="Securely organize identity, ownership, contract, receipt, floor-plan, lead, and transaction documents." fields={fields} columns={[{ key: 'title', label: 'Document' }, { key: 'category', label: 'Category' }, { key: 'lead_name', label: 'Lead' }, { key: 'uploaded_by_name', label: 'Uploaded by' }, { key: 'created_at', label: 'Uploaded', type: 'date' }]} />
}
