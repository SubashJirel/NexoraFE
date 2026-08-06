import CrudPage from '@/components/operations/CrudPage'
import { useResource } from '@/hooks/useOperations'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import operationsService from '@/services/operationsService'

const options = (rows) => (rows || []).map((row) => ({ value: row.id, label: row.title }))

export default function OffersPage() {
  const deals = useResource('deals')
  const client = useQueryClient()
  async function respond(row, status) { await operationsService.action('offers', row.id, 'respond', { status }); await client.invalidateQueries({ queryKey: ['operations', 'offers'] }); await client.invalidateQueries({ queryKey: ['operations', 'deals'] }); toast.success(`Offer ${status}`) }
  const fields = [
    { name: 'deal', label: 'Deal', type: 'select', options: options(deals.data), required: true },
    { name: 'amount', label: 'Offer amount', type: 'number', step: '0.01', required: true },
    { name: 'currency', label: 'Currency', defaultValue: 'NPR', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['draft', 'submitted', 'countered', 'accepted', 'rejected', 'withdrawn', 'expired'], defaultValue: 'draft' },
    { name: 'expires_at', label: 'Expires at', type: 'datetime-local' },
    { name: 'terms', label: 'Terms', type: 'textarea', full: true },
  ]
  return <CrudPage resource="offers" title="Offers" description="Record written offers, counters, terms, acceptance, rejection, withdrawal, and expiry." fields={fields} columns={[{ key: 'deal_title', label: 'Deal' }, { key: 'amount', label: 'Amount', type: 'currency' }, { key: 'status', label: 'Status' }, { key: 'expires_at', label: 'Expiry', type: 'date' }, { key: 'submitted_by_name', label: 'Submitted by' }]} actions={[{ label: 'Accept', onClick: (row) => respond(row, 'accepted') }, { label: 'Counter', onClick: (row) => respond(row, 'countered') }, { label: 'Reject', onClick: (row) => respond(row, 'rejected') }]} />
}
