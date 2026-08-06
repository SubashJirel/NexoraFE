import CrudPage from '@/components/operations/CrudPage'
import { useAgents } from '@/hooks/useAgents'
import { useLeads } from '@/hooks/useLeads'
import { useProperties } from '@/hooks/useProperties'
import { useResource } from '@/hooks/useOperations'

const opts = (rows, label) => (rows || []).map((row) => ({ value: row.id, label: row[label] }))

export default function TasksPage() {
  const agents = useAgents(); const leads = useLeads(); const deals = useResource('deals'); const properties = useProperties()
  const fields = [
    { name: 'title', label: 'Task title', required: true }, { name: 'status', label: 'Status', type: 'select', options: ['todo', 'in_progress', 'done', 'cancelled'], defaultValue: 'todo' },
    { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'urgent'], defaultValue: 'medium' }, { name: 'due_at', label: 'Due date & time', type: 'datetime-local' },
    { name: 'assigned_to', label: 'Assigned to', type: 'select', options: opts(agents.data, 'full_name') }, { name: 'recurrence', label: 'Recurrence', type: 'select', options: ['', 'daily', 'weekly', 'monthly'] },
    { name: 'lead', label: 'Lead', type: 'select', options: opts(leads.data, 'full_name') }, { name: 'deal', label: 'Deal', type: 'select', options: opts(deals.data, 'title') },
    { name: 'property', label: 'Property', type: 'select', options: opts(properties.data, 'title') }, { name: 'description', label: 'Description', type: 'textarea', full: true },
  ]
  return <CrudPage resource="tasks" title="Tasks" description="Plan calls, follow-ups, documents, and transaction work in one shared task calendar." fields={fields} columns={[{ key: 'title', label: 'Task' }, { key: 'priority', label: 'Priority' }, { key: 'assigned_to_name', label: 'Assigned to' }, { key: 'due_at', label: 'Due', type: 'date' }, { key: 'status', label: 'Status' }]} />
}
