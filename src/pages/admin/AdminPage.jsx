import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Home, Users, UserRound } from 'lucide-react'
import operationsService from '@/services/operationsService'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { useResource } from '@/hooks/useOperations'

export default function AdminPage() {
  const query = useQuery({ queryKey: ['admin-summary'], queryFn: operationsService.adminSummary })
  const agencies = useResource('platform-agencies'); const client = useQueryClient()
  if (query.isLoading || agencies.isLoading) return <PageSpinner />
  const data = query.data || {}
  async function updateAgency(id, payload) { await operationsService.update('platform-agencies', id, payload); await Promise.all([client.invalidateQueries({ queryKey: ['operations', 'platform-agencies'] }), client.invalidateQueries({ queryKey: ['admin-summary'] })]) }
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#263238]">Platform administration</h2><p className="mt-1 text-sm text-[#637079]">Cross-agency health, adoption, subscriptions, and account oversight.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Building2} label="Agencies" value={data.agencies} /><Metric icon={Users} label="Active agencies" value={data.active_agencies} /><Metric icon={UserRound} label="Users" value={data.users} /><Metric icon={Home} label="Properties" value={data.properties} /></div><Card><h3 className="font-bold">Agency management</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[800px] text-sm"><thead><tr className="text-left text-xs text-[#637079]"><th className="pb-3">Agency</th><th className="pb-3">Users</th><th className="pb-3">Properties</th><th className="pb-3">Payment</th><th className="pb-3">Access</th></tr></thead><tbody>{(agencies.data || []).map((agency) => <tr key={agency.id} className="border-t border-[#EEF2F2]"><td className="py-4"><p className="font-semibold">{agency.name}</p><p className="text-xs text-[#637079]">{agency.license_number}</p></td><td className="py-4">{agency.users_count}</td><td className="py-4">{agency.properties_count}</td><td className="py-4"><select className="rounded-lg border border-[#DDE5E3] px-2 py-1 capitalize" value={agency.payment_status} onChange={(event) => updateAgency(agency.id, { payment_status: event.target.value })}><option value="unpaid">Unpaid</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option></select></td><td className="py-4"><Button size="sm" variant={agency.is_active ? 'outlined' : 'primary'} onClick={() => updateAgency(agency.id, { is_active: !agency.is_active })}>{agency.is_active ? 'Suspend' : 'Activate'}</Button></td></tr>)}</tbody></table></div></Card></div>
}
function Metric({ icon: Icon, label, value = 0 }) { return <Card className="flex items-center gap-3"><span className="rounded-xl bg-[#eef3f0] p-3 text-[#496B5A]"><Icon size={18} /></span><div><p className="text-2xl font-black">{value}</p><p className="text-xs text-[#637079]">{label}</p></div></Card> }
