import CrudPage from '@/components/operations/CrudPage'

export default function WebsiteSubmissionsPage() {
  const fields = [
    { name: 'kind', label: 'Type', type: 'select', options: ['contact', 'property_inquiry', 'listing_report', 'valuation', 'newsletter', 'buyer_guide', 'career', 'demo'], required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['new', 'in_progress', 'completed', 'spam'], required: true },
    { name: 'full_name', label: 'Name' }, { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone', type: 'phone' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ]
  return <CrudPage resource="website-submissions" title="Website submissions" description="Contact requests, listing reports, valuations, applications, and other public storefront submissions." fields={fields} columns={[{ key: 'kind', label: 'Type' }, { key: 'property_title', label: 'Property' }, { key: 'full_name', label: 'Visitor' }, { key: 'message', label: 'Details' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Received', type: 'date' }]} />
}
