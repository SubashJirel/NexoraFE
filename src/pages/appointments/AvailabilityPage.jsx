import CrudPage from '@/components/operations/CrudPage'
import { useAgents } from '@/hooks/useAgents'

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((label, value) => ({ value, label }))

export default function AvailabilityPage() {
  const agents = useAgents()
  const fields = [
    { name: 'agent', label: 'Agent', type: 'select', options: (agents.data || []).map((row) => ({ value: row.id, label: row.full_name })), required: true },
    { name: 'weekday', label: 'Weekday', type: 'select', options: weekdays, required: true },
    { name: 'start_time', label: 'Start time', type: 'time', required: true }, { name: 'end_time', label: 'End time', type: 'time', required: true },
    { name: 'slot_minutes', label: 'Slot length (minutes)', type: 'number', defaultValue: 30, min: 10 }, { name: 'is_active', label: 'Accept bookings', type: 'checkbox', defaultValue: true },
  ]
  return <CrudPage resource="availability" title="Availability" description="Publish bookable working hours for each agent. Customers use these windows when requesting appointments." fields={fields} columns={[{ key: 'agent_name', label: 'Agent' }, { key: 'weekday', label: 'Weekday', render: (row) => weekdays[row.weekday]?.label || row.weekday }, { key: 'start_time', label: 'Start' }, { key: 'end_time', label: 'End' }, { key: 'slot_minutes', label: 'Minutes' }, { key: 'is_active', label: 'Active' }]} />
}
