import CrudPage from '@/components/operations/CrudPage'

export default function WebsiteSubmissionsPage() {
  const fields = [
    { name: 'kind', label: 'Type', type: 'select', options: ['contact', 'property_inquiry', 'valuation', 'newsletter', 'buyer_guide', 'career', 'demo'], required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['new', 'in_progress', 'completed', 'spam'], required: true },
    { name: 'full_name', label: 'Name' }, { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ]
  return <CrudPage resource="website-submissions" title="Website submissions" description="Contact, valuation, newsletter, guide, career, and demo requests captured from the public storefront." fields={fields} columns={[{ key: 'kind', label: 'Type' }, { key: 'full_name', label: 'Visitor' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Received', type: 'date' }]} />
}
