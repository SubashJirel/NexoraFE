import CrudPage from '@/components/operations/CrudPage'
import { useLeads } from '@/hooks/useLeads'
import { useProperties } from '@/hooks/useProperties'
import { useAgents } from '@/hooks/useAgents'
import { useResource } from '@/hooks/useOperations'

const STAGES = ['qualified', 'offer', 'negotiation', 'token', 'contract', 'closed_won', 'closed_lost']
const options = (rows, label) => (rows || []).map((row) => ({ value: row.id, label: row[label] }))

export default function DealsPage() {
  const leads = useLeads(); const contacts = useResource('contacts'); const properties = useProperties(); const agents = useAgents()
  const customStages = useResource('pipeline-stages', { module: 'deal' })
  const stages = [...new Set([...STAGES, ...(customStages.data || []).map((item) => item.key)])]
  const fields = [
    { name: 'title', label: 'Deal title', required: true }, { name: 'stage', label: 'Stage', type: 'select', options: stages, required: true, defaultValue: 'qualified' },
    { name: 'lead', label: 'Lead', type: 'select', options: options(leads.data, 'full_name') }, { name: 'contact', label: 'Contact', type: 'select', options: options(contacts.data, 'full_name') },
    { name: 'property', label: 'Property', type: 'select', options: options(properties.data, 'title') }, { name: 'assigned_agent', label: 'Agent', type: 'select', options: options(agents.data, 'full_name') },
    { name: 'value', label: 'Deal value', type: 'number', step: '0.01', defaultValue: 0 }, { name: 'token_amount', label: 'Token / booking amount', type: 'number', step: '0.01', defaultValue: 0 },
    { name: 'commission_rate', label: 'Commission %', type: 'number', step: '0.001', defaultValue: 0 }, { name: 'commission_amount', label: 'Commission amount', type: 'number', step: '0.01', defaultValue: 0 },
    { name: 'expected_close_date', label: 'Expected close', type: 'date' }, { name: 'lost_reason', label: 'Lost reason' },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ]
  return <CrudPage resource="deals" customModule="deal" title="Deals" description="Track each transaction from qualification and offers through token, contract, closing, and commission." fields={fields} columns={[{ key: 'title', label: 'Deal' }, { key: 'stage', label: 'Stage' }, { key: 'property_title', label: 'Property' }, { key: 'contact_name', label: 'Client' }, { key: 'value', label: 'Value', type: 'currency' }, { key: 'expected_close_date', label: 'Expected close' }]} />
}
