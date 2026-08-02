import { useState } from 'react'
import { Phone, MapPin, MoreVertical } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { KANBAN_COLUMNS, STATUS_MAP, SOURCE_BADGE, formatBudget } from '../leadsConstants'

export default function LeadsKanban({ leads, onCardClick, onEdit, onDelete }) {
  // Group leads by status, only show pipeline columns (excludes closed/lost)
  const byStatus = {}
  KANBAN_COLUMNS.forEach((s) => { byStatus[s] = [] })
  leads.forEach((l) => {
    if (byStatus[l.status]) byStatus[l.status].push(l)
    // closed/lost leads are omitted from kanban — visible in table view
  })

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {KANBAN_COLUMNS.map((status) => {
        const info  = STATUS_MAP[status]
        const items = byStatus[status]
        return (
          <KanbanColumn
            key={status}
            status={status}
            label={info?.label ?? status}
            color={info?.color}
            leads={items}
            onCardClick={onCardClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      })}
    </div>
  )
}

function KanbanColumn({ status, label, color, leads, onCardClick, onEdit, onDelete }) {
  return (
    <div className="flex flex-col shrink-0 w-72">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span className="text-xs font-semibold text-[#263238] uppercase tracking-wide">
          {label}
        </span>
        <span className="ml-auto text-xs font-semibold text-white bg-[#8b969d] rounded-full px-2 py-0.5 min-w-[22px] text-center">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {leads.map((lead) => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            onCardClick={onCardClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {leads.length === 0 && (
          <div className="border-2 border-dashed border-[#DDE5E3] rounded-xl h-20 flex items-center justify-center">
            <span className="text-xs text-[#8b969d]">No leads</span>
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanCard({ lead, onCardClick, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const srcInfo = SOURCE_BADGE[lead.source] ?? { variant: 'neutral', short: 'OTH' }

  const agentName = typeof lead.assigned_agent === 'object'
    ? lead.assigned_agent?.full_name
    : null

  const budgetStr = (lead.budget_min || lead.budget_max)
    ? `${formatBudget(lead.budget_min) ?? '—'} – ${formatBudget(lead.budget_max) ?? '—'}`
    : null

  return (
    <div
      className="bg-white rounded-xl border border-[#DDE5E3] p-3.5 shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] cursor-pointer hover:border-[#496B5A]/40 hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.09)] transition-all duration-150 group relative"
      onClick={() => onCardClick(lead)}
    >
      {/* Source badge + menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant={srcInfo.variant} size="sm">{srcInfo.short}</Badge>

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="h-6 w-6 flex items-center justify-center rounded text-[#8b969d] hover:text-[#263238] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Lead actions"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 top-7 z-20 w-36 bg-white rounded-xl border border-[#DDE5E3] shadow-lg py-1 overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(lead) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#263238] hover:bg-[#F8FAFA]"
                >
                  Edit Lead
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(lead) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#ef4444] hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-[#263238] leading-tight mb-1">{lead.full_name}</p>

      {/* Location */}
      {lead.preferred_location && (
        <p className="text-xs text-[#637079] flex items-center gap-1 mb-2">
          <MapPin size={10} className="shrink-0" />
          {lead.preferred_location}
          {lead.property_type && ` · ${lead.property_type}`}
        </p>
      )}

      {/* Budget */}
      {budgetStr && (
        <p className="text-xs font-semibold text-[#496B5A] mb-2">{budgetStr}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#DDE5E3]">
        {agentName ? (
          <div className="flex items-center gap-1.5">
            <Avatar alt={agentName} size="xs" />
            <span className="text-[10px] text-[#8b969d] truncate max-w-[100px]">{agentName}</span>
          </div>
        ) : (
          <span className="text-[10px] text-[#8b969d]">Unassigned</span>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1 text-[10px] text-[#8b969d]">
            <Phone size={10} />
            {lead.phone}
          </div>
        )}
      </div>
    </div>
  )
}


