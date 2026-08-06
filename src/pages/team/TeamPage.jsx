import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import CrudPage from '@/components/operations/CrudPage'
import { useResource } from '@/hooks/useOperations'
import operationsService from '@/services/operationsService'
import { Card } from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

export default function TeamPage() {
  const members = useResource('team-members'); const client = useQueryClient()
  async function update(id, payload) { try { await operationsService.update('team-members', id, payload); await client.invalidateQueries({ queryKey: ['operations', 'team-members'] }); toast.success('Access updated') } catch (error) { toast.error(error.response?.data?.detail || 'Unable to update access') } }
  const fields = [
    { name: 'full_name', label: 'Full name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Role', type: 'select', options: [{ value: 'agent', label: 'Agent' }, { value: 'agency_manager', label: 'Agency manager' }], defaultValue: 'agent', required: true },
  ]
  return <div className="space-y-12"><div className="space-y-5"><div><h2 className="text-2xl font-bold text-[#263238]">Team access</h2><p className="mt-1 text-sm text-[#637079]">Activate or deactivate accounts and apply owner, manager, or agent permissions.</p></div><Card className="overflow-x-auto p-0"><table className="w-full min-w-[720px] text-sm"><thead><tr className="bg-[#F8FAFA] text-left text-xs text-[#637079]"><th className="px-5 py-3">Member</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Access</th></tr></thead><tbody>{(members.data || []).map((member) => <tr key={member.id} className="border-t border-[#EEF2F2]"><td className="px-5 py-4 font-semibold">{member.full_name}</td><td className="px-5 py-4 text-[#637079]">{member.email}</td><td className="px-5 py-4"><Select size="sm" value={member.role} onChange={(event) => update(member.id, { role: event.target.value })}><option value="agency_owner">Owner</option><option value="agency_manager">Manager</option><option value="agent">Agent</option></Select></td><td className="px-5 py-4"><Button size="sm" variant={member.is_active ? 'outlined' : 'primary'} onClick={() => update(member.id, { is_active: !member.is_active })}>{member.is_active ? 'Deactivate' : 'Activate'}</Button></td></tr>)}</tbody></table></Card></div><CrudPage resource="invitations" title="Invitations" description="Invite agents and managers with role-scoped access. Links expire after seven days and can only be accepted once." fields={fields} columns={[{ key: 'full_name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'expires_at', label: 'Expires', type: 'date' }, { key: 'accepted_at', label: 'Accepted', type: 'date' }, { key: 'delivery_error', label: 'Delivery' }]} /></div>
}
