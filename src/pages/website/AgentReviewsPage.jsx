import CrudPage from '@/components/operations/CrudPage'

export default function AgentReviewsPage() {
  const fields = [
    { name: 'agent', label: 'Agent ID', type: 'number', required: true }, { name: 'reviewer_name', label: 'Reviewer', required: true },
    { name: 'reviewer_email', label: 'Email' }, { name: 'rating', label: 'Rating', type: 'number', required: true },
    { name: 'title', label: 'Title' }, { name: 'comment', label: 'Comment', type: 'textarea', required: true },
    { name: 'is_approved', label: 'Approved', type: 'checkbox' },
  ]
  return <CrudPage resource="agent-reviews" title="Agent reviews" description="Moderate customer feedback before it appears on public agent profiles." fields={fields} columns={[{ key: 'agent_name', label: 'Agent' }, { key: 'reviewer_name', label: 'Reviewer' }, { key: 'rating', label: 'Rating' }, { key: 'title', label: 'Title' }, { key: 'is_approved', label: 'Approved' }, { key: 'created_at', label: 'Submitted', type: 'date' }]} />
}
