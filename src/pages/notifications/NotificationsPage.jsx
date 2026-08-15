import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useResource } from '@/hooks/useOperations'
import operationsService from '@/services/operationsService'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { useLocalization } from '@/context/useLocalization'

export default function NotificationsPage() {
  const query = useResource('notifications')
  const localization = useLocalization()
  const client = useQueryClient(); const navigate = useNavigate()
  const readAll = useMutation({ mutationFn: operationsService.readAllNotifications, onSuccess: () => client.invalidateQueries({ queryKey: ['operations', 'notifications'] }) })
  if (query.isLoading) return <PageSpinner />
  const items = query.data || []
  async function open(item) {
    if (item.link?.startsWith('/')) navigate(item.link)
    if (!item.is_read) {
      try {
        await operationsService.action('notifications', item.id, 'read')
        await client.invalidateQueries({ queryKey: ['operations', 'notifications'] })
      } catch {
        // Opening the target is more important than blocking on a read-receipt failure.
      }
    }
  }
  return <div className="space-y-6"><div className="flex items-end justify-between"><div><h2 className="text-2xl font-bold text-[#263238]">{localization.t('Notifications')}</h2><p className="mt-1 text-sm text-[#637079]">{localization.t('Assignments, appointments, offers, tasks, and system updates.', 'Assignments, appointments, offers, tasks, and system updates.')}</p></div><Button variant="outlined" leftIcon={<CheckCheck size={16} />} onClick={() => readAll.mutate()}>{localization.t('Mark all read')}</Button></div><div className="space-y-2">{items.map((item) => <button key={item.id} onClick={() => open(item)} className="block w-full text-left"><Card className={`flex items-start gap-3 ${item.is_read ? 'opacity-70' : 'border-[#8FAF9B] bg-[#f8fbf9]'}`}><div className="rounded-full bg-[#eef3f0] p-2 text-[#496B5A]"><Bell size={16} /></div><div className="min-w-0"><p className="font-semibold text-[#263238]">{item.title}</p><p className="mt-1 text-sm text-[#637079]">{item.message}</p><p className="mt-2 text-[10px] uppercase tracking-wide text-[#8b969d]">{localization.date(item.created_at, true)}</p></div></Card></button>)}{!items.length && <Card className="py-14 text-center text-sm text-[#637079]">{localization.t('You are all caught up.')}</Card>}</div></div>
}
