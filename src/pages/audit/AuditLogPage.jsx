import { useResource } from '@/hooks/useOperations'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'

export default function AuditLogPage() {
  const query = useResource('audit-logs')
  if (query.isLoading) return <PageSpinner />
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#263238]">Audit log</h2><p className="mt-1 text-sm text-[#637079]">A tamper-resistant activity trail of creates, edits, deletes, invitations, and deal decisions.</p></div><Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="bg-[#F8FAFA] text-left text-[10px] uppercase tracking-wide text-[#637079]"><tr><th className="px-5 py-3">When</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Record</th><th className="px-5 py-3">Summary</th></tr></thead><tbody>{(query.data || []).map((row) => <tr key={row.id} className="border-t border-[#EEF2F2]"><td className="px-5 py-4 text-[#637079]">{new Date(row.created_at).toLocaleString()}</td><td className="px-5 py-4">{row.actor_name || 'System'}</td><td className="px-5 py-4 capitalize">{row.action}</td><td className="px-5 py-4 capitalize">{row.entity_type} #{row.entity_id}</td><td className="px-5 py-4 text-[#637079]">{row.summary}</td></tr>)}</tbody></table></div></Card></div>
}
