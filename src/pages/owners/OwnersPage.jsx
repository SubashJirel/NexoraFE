import CrudPage from '@/components/operations/CrudPage'
import { useProperties } from '@/hooks/useProperties'

export default function OwnersPage() {
  const properties = useProperties()
  const fields = [
    { name: 'full_name', label: 'Owner name', required: true }, { name: 'phone', label: 'Phone', required: true },
    { name: 'email', label: 'Email', type: 'email' }, { name: 'tax_id', label: 'Tax / citizenship ID' },
    { name: 'properties', label: 'Owned properties', type: 'multiselect', options: (properties.data || []).map((item) => ({ value: item.id, label: item.title })), full: true },
    { name: 'address', label: 'Address', type: 'textarea', full: true }, { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ]
  return <CrudPage resource="owners" customModule="owner" title="Owners" description="Keep seller and landlord records separate from buyer leads, with property and document relationships." fields={fields} columns={[{ key: 'full_name', label: 'Owner' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'property_titles', label: 'Properties' }]} />
}
