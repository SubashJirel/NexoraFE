import CrudPage from '@/components/operations/CrudPage'
import { useAgents } from '@/hooks/useAgents'
import { useProperties } from '@/hooks/useProperties'

const opts = (rows, label) => (rows || []).map((row) => ({ value: row.id, label: row[label] }))

export default function AppointmentsPage() {
  const agents = useAgents(); const properties = useProperties()
  const fields = [
    { name: 'full_name', label: 'Customer name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone' }, { name: 'status', label: 'Status', type: 'select', options: ['requested', 'confirmed', 'completed', 'cancelled'], defaultValue: 'requested' },
    { name: 'agent', label: 'Agent', type: 'select', options: opts(agents.data, 'full_name'), required: true }, { name: 'property', label: 'Property', type: 'select', options: opts(properties.data, 'title') },
    { name: 'starts_at', label: 'Starts', type: 'datetime-local', required: true }, { name: 'ends_at', label: 'Ends', type: 'datetime-local', required: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ]
  return <CrudPage resource="appointments" title="Appointments" description="Confirm and manage public booking requests against agent availability." fields={fields} columns={[{ key: 'full_name', label: 'Customer' }, { key: 'property_title', label: 'Property' }, { key: 'agent_name', label: 'Agent' }, { key: 'starts_at', label: 'Starts', type: 'date' }, { key: 'status', label: 'Status' }]} />
}
