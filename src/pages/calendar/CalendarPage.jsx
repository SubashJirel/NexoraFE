import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useResource } from '@/hooks/useOperations'
import { useSiteVisits } from '@/hooks/useSiteVisits'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const tasks = useResource('tasks'); const appointments = useResource('appointments'); const visits = useSiteVisits()
  const events = useMemo(() => [
    ...(tasks.data || []).filter((item) => item.due_at).map((item) => ({ id: `task-${item.id}`, at: item.due_at, title: item.title, kind: 'Task', color: 'bg-amber-100 text-amber-800' })),
    ...(appointments.data || []).map((item) => ({ id: `appointment-${item.id}`, at: item.starts_at, title: item.full_name, kind: 'Appointment', color: 'bg-blue-100 text-blue-800' })),
    ...(visits.data || []).map((item) => ({ id: `visit-${item.id}`, at: item.scheduled_at, title: item.lead_name || item.property_title || 'Site visit', kind: 'Site visit', color: 'bg-emerald-100 text-emerald-800' })),
  ], [appointments.data, tasks.data, visits.data])
  const first = new Date(month.getFullYear(), month.getMonth(), 1); const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))]
  while (cells.length % 7) cells.push(null)
  function move(offset) { setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1)) }
  return <div className="space-y-6"><div className="flex items-end justify-between"><div><h2 className="text-2xl font-bold text-[#263238]">Calendar</h2><p className="mt-1 text-sm text-[#637079]">Tasks, appointments, and site visits in one schedule.</p></div><div className="flex items-center gap-2"><Button size="icon" variant="outlined" onClick={() => move(-1)}><ChevronLeft size={16} /></Button><p className="min-w-36 text-center font-bold">{month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</p><Button size="icon" variant="outlined" onClick={() => move(1)}><ChevronRight size={16} /></Button></div></div><Card className="overflow-x-auto p-0"><div className="grid min-w-[840px] grid-cols-7">{weekday.map((day) => <div key={day} className="border-b border-r border-[#EEF2F2] bg-[#F8FAFA] px-3 py-2 text-xs font-bold text-[#637079]">{day}</div>)}{cells.map((date, index) => { const dayEvents = date ? events.filter((event) => { const when = new Date(event.at); return when.getFullYear() === date.getFullYear() && when.getMonth() === date.getMonth() && when.getDate() === date.getDate() }) : []; return <div key={index} className="min-h-32 border-b border-r border-[#EEF2F2] p-2">{date && <><p className="text-xs font-semibold text-[#637079]">{date.getDate()}</p><div className="mt-2 space-y-1">{dayEvents.map((event) => <div key={event.id} className={`rounded px-2 py-1 text-[10px] ${event.color}`} title={`${event.kind}: ${event.title}`}><b>{new Date(event.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b> {event.title}</div>)}</div></>}</div> })}</div></Card></div>
}
