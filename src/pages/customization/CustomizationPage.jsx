import CrudPage from '@/components/operations/CrudPage'

export default function CustomizationPage() {
  const customFields = [
    { name: 'module', label: 'Module', type: 'select', options: ['lead', 'contact', 'property', 'deal', 'owner', 'lease'], required: true },
    { name: 'key', label: 'API key', required: true, placeholder: 'e.g. preferred_school' }, { name: 'label', label: 'Display label', required: true },
    { name: 'field_type', label: 'Field type', type: 'select', options: ['text', 'number', 'date', 'boolean', 'select', 'multiselect'], defaultValue: 'text' },
    { name: 'options', label: 'Options (comma separated)', type: 'tags' }, { name: 'sort_order', label: 'Order', type: 'number', defaultValue: 0 },
    { name: 'is_required', label: 'Required', type: 'checkbox' }, { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ]
  const stages = [
    { name: 'module', label: 'Pipeline', type: 'select', options: ['lead', 'deal'], required: true }, { name: 'key', label: 'Stage key', required: true },
    { name: 'name', label: 'Stage name', required: true }, { name: 'color', label: 'Color', type: 'color', defaultValue: '#496B5A' },
    { name: 'sort_order', label: 'Order', type: 'number', defaultValue: 0 }, { name: 'is_closed', label: 'Closed stage', type: 'checkbox' }, { name: 'is_won', label: 'Won stage', type: 'checkbox' },
  ]
  return <div className="space-y-12"><CrudPage resource="custom-fields" title="Custom fields" description="Extend core CRM records without code changes. Values are stored in each record's custom data." fields={customFields} columns={[{ key: 'module', label: 'Module' }, { key: 'label', label: 'Label' }, { key: 'key', label: 'Key' }, { key: 'field_type', label: 'Type' }, { key: 'is_required', label: 'Required' }, { key: 'is_active', label: 'Active' }]} /><CrudPage resource="pipeline-stages" title="Pipeline stages" description="Define the labels, order, colors, and closed/won semantics used by lead and deal boards." fields={stages} columns={[{ key: 'module', label: 'Pipeline' }, { key: 'name', label: 'Stage' }, { key: 'key', label: 'Key' }, { key: 'sort_order', label: 'Order' }, { key: 'is_closed', label: 'Closed' }, { key: 'is_won', label: 'Won' }]} /></div>
}
