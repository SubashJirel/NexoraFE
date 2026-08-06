import CrudPage from '@/components/operations/CrudPage'
import { useResource } from '@/hooks/useOperations'
import { useProperties } from '@/hooks/useProperties'
import { useAgents } from '@/hooks/useAgents'

const opts = (rows, label) => (rows || []).map((row) => ({ value: row.id, label: row[label] }))

export default function LeasesPage() {
  const properties = useProperties({ purpose: 'rent' }); const contacts = useResource('contacts'); const owners = useResource('owners'); const agents = useAgents()
  const fields = [
    { name: 'property', label: 'Rental property', type: 'select', options: opts(properties.data, 'title'), required: true }, { name: 'tenant', label: 'Tenant', type: 'select', options: opts(contacts.data, 'full_name'), required: true },
    { name: 'owner', label: 'Owner', type: 'select', options: opts(owners.data, 'full_name') }, { name: 'assigned_agent', label: 'Agent', type: 'select', options: opts(agents.data, 'full_name') },
    { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'expired', 'terminated', 'renewed'], defaultValue: 'draft' }, { name: 'monthly_rent', label: 'Monthly rent', type: 'number', step: '0.01', required: true },
    { name: 'security_deposit', label: 'Security deposit', type: 'number', step: '0.01', defaultValue: 0 }, { name: 'payment_day', label: 'Payment day', type: 'number', min: 1, defaultValue: 1 },
    { name: 'start_date', label: 'Start date', type: 'date', required: true }, { name: 'end_date', label: 'End date', type: 'date', required: true },
    { name: 'renewal_reminder_at', label: 'Renewal reminder', type: 'date' }, { name: 'terms', label: 'Terms', type: 'textarea', full: true },
  ]
  return <CrudPage resource="leases" customModule="lease" title="Leases" description="Manage rental agreements, tenants, deposits, rent schedules, renewals, and termination." fields={fields} columns={[{ key: 'property_title', label: 'Property' }, { key: 'tenant_name', label: 'Tenant' }, { key: 'monthly_rent', label: 'Monthly rent', type: 'currency' }, { key: 'status', label: 'Status' }, { key: 'end_date', label: 'Ends' }]} />
}
