import { useAgents } from '@/hooks/useAgents'
import CrudPage from '@/components/operations/CrudPage'
import Button from '@/components/ui/Button'
import operationsService from '@/services/operationsService'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const TYPES = ['buyer', 'seller', 'tenant', 'landlord', 'investor', 'vendor', 'other']
const opts = (rows, label = 'full_name') => (rows || []).map((row) => ({ value: row.id, label: row[label] }))

export default function ContactsPage() {
  const agents = useAgents()
  const client = useQueryClient()
  const fields = [
    { name: 'full_name', label: 'Full name', required: true }, { name: 'contact_type', label: 'Contact type', type: 'select', options: TYPES, required: true },
    { name: 'email', label: 'Email', type: 'email' }, { name: 'phone', label: 'Phone' },
    { name: 'company', label: 'Company' }, { name: 'source', label: 'Source' },
    { name: 'assigned_to', label: 'Assigned agent', type: 'select', options: opts(agents.data) },
    { name: 'tags', label: 'Tags (comma separated)', type: 'tags' },
    { name: 'address', label: 'Address', type: 'textarea', full: true }, { name: 'notes', label: 'Notes', type: 'textarea', full: true },
    { name: 'is_active', label: 'Active contact', type: 'checkbox', defaultValue: true },
  ]
  const importButton = <Button variant="outlined" onClick={async () => { const result = await operationsService.importLeadContacts(); await client.invalidateQueries({ queryKey: ['operations', 'contacts'] }); toast.success(`${result.created} lead contacts imported`) }}>Import leads</Button>
  return <CrudPage resource="contacts" customModule="contact" title="Contacts" description="A reusable address book for buyers, sellers, tenants, landlords, investors, and partners." fields={fields} columns={[{ key: 'full_name', label: 'Name' }, { key: 'contact_type', label: 'Type' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'assigned_to_name', label: 'Owner' }]} headerAction={importButton} />
}
