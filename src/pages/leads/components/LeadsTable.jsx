import { useState } from 'react'
import { MoreVertical, Phone, MapPin } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { STATUS_MAP, SOURCE_BADGE, formatBudget } from '../leadsConstants'
import { cn } from '@/lib/cn'

export default function LeadsTable({ leads, onRowClick, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-[#DDE5E3] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DDE5E3] bg-[#F8FAFA]">
              <Th>Lead</Th>
              <Th>Contact</Th>
              <Th>Status</Th>
              <Th>Source</Th>
              <Th>Requirement</Th>
              <Th>Budget</Th>
              <Th>Agent</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                lead={lead}
                onRowClick={onRowClick}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TableRow({ lead, onRowClick, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const statusInfo = STATUS_MAP[lead.status]
  const srcInfo    = SOURCE_BADGE[lead.source] ?? { variant: 'neutral', short: 'OTH' }

  const agentName = typeof lead.assigned_agent === 'object'
    ? lead.assigned_agent?.full_name
    : null

  const budgetStr = (lead.budget_min || lead.budget_max)
    ? `${formatBudget(lead.budget_min) ?? '—'} – ${formatBudget(lead.budget_max) ?? '—'}`
    : '—'

  return (
    <tr
      className="border-b border-[#DDE5E3] last:border-0 hover:bg-[#F8FAFA] cursor-pointer transition-colors group"
      onClick={() => onRowClick(lead)}
    >
      {/* Lead name */}
      <Td>
        <div className="flex items-center gap-2.5">
          <Avatar alt={lead.full_name} size="sm" />
          <span className="font-medium text-[#263238]">{lead.full_name}</span>
        </div>
      </Td>

      {/* Contact */}
      <Td>
        <div className="space-y-0.5">
          <p className="text-xs text-[#637079] flex items-center gap-1">
            <Phone size={10} />{lead.phone || '—'}
          </p>
          {lead.email && (
            <p className="text-xs text-[#8b969d] truncate max-w-[160px]">{lead.email}</p>
          )}
        </div>
      </Td>

      {/* Status */}
      <Td>
        <Badge variant={statusInfo?.badge ?? 'neutral'} dot size="sm">
          {statusInfo?.label ?? lead.status}
        </Badge>
      </Td>

      {/* Source */}
      <Td>
        <Badge variant={srcInfo.variant} size="sm">{srcInfo.short}</Badge>
      </Td>

      {/* Requirement */}
      <Td>
        <div className="space-y-0.5">
          <p className="text-xs text-[#263238] capitalize">
            {lead.property_type} · {lead.purpose}
          </p>
          {lead.preferred_location && (
            <p className="text-xs text-[#8b969d] flex items-center gap-1">
              <MapPin size={10} />{lead.preferred_location}
            </p>
          )}
        </div>
      </Td>

      {/* Budget */}
      <Td>
        <span className="text-xs font-semibold text-[#496B5A]">{budgetStr}</span>
      </Td>

      {/* Agent */}
      <Td>
        {agentName ? (
          <div className="flex items-center gap-1.5">
            <Avatar alt={agentName} size="xs" />
            <span className="text-xs text-[#637079] truncate max-w-[100px]">{agentName}</span>
          </div>
        ) : (
          <span className="text-xs text-[#8b969d]">—</span>
        )}
      </Td>

      {/* Actions */}
      <Td>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-[#8b969d] hover:bg-[#EEF2F2] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Row actions"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl border border-[#DDE5E3] shadow-lg py-1 overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(lead) }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-[#263238] hover:bg-[#F8FAFA]"
                >
                  Edit Lead
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(lead) }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-[#ef4444] hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </Td>
    </tr>
  )
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#8b969d] uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  )
}

function Td({ children }) {
  return <td className="px-4 py-3 text-sm text-[#263238]">{children}</td>
}
