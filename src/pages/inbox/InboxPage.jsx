import { useState } from 'react'
import {
  ArrowLeft,
  CheckCheck,
  Inbox,
  Link2,
  MessageCircle,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import {
  useAssignConversation,
  useConversation,
  useConversationMessages,
  useConversations,
  useCreateLeadFromConversation,
  useLinkConversationLead,
  useMarkConversationRead,
  useReplyToConversation,
  useUpdateConversationStatus,
} from '@/hooks/useInbox'
import { useAgents } from '@/hooks/useAgents'
import { useLeads } from '@/hooks/useLeads'
import { useAuthStore } from '@/store/authStore'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import UnifiedLeadInbox from './UnifiedLeadInbox'

const STATUSES = ['open', 'pending', 'closed', 'spam']

export default function InboxPage() {
  const [mode, setMode] = useState('leads')
  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><h2 className="text-2xl font-bold text-[#263238]">Unified Lead Inbox</h2><p className="mt-1 text-sm text-[#637079]">Every inquiry, property interest, conversation and follow-up in one place.</p></div>
      <div className="flex rounded-xl border border-[#DDE5E3] bg-white p-1"><button type="button" onClick={() => setMode('leads')} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold', mode === 'leads' ? 'bg-[#496B5A] text-white' : 'text-[#637079]')}><Users size={14} />All inquiries</button><button type="button" onClick={() => setMode('messages')} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold', mode === 'messages' ? 'bg-[#496B5A] text-white' : 'text-[#637079]')}><MessageCircle size={14} />Live messages</button></div>
    </div>
    {mode === 'leads' ? <UnifiedLeadInbox /> : <SocialInbox />}
  </div>
}

function SocialInbox() {
  const [filters, setFilters] = useState({ search: '', platform: '', status: '', unread: '' })
  const [selectedId, setSelectedId] = useState(null)
  const query = useConversations(filters)
  const conversations = query.data || []
  const activeId = selectedId || conversations[0]?.id

  return (
    <div>
      <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-[#DDE5E3] bg-white shadow-sm lg:grid-cols-[350px_1fr]">
        <section className={cn('border-r border-[#DDE5E3]', selectedId && 'hidden lg:block')}>
          <InboxFilters filters={filters} setFilters={setFilters} />
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={setSelectedId}
            isLoading={query.isLoading}
            isError={query.isError}
          />
        </section>

        <section className={cn(!selectedId && 'hidden lg:block')}>
          {activeId ? (
            <ConversationPanel id={activeId} onBack={() => setSelectedId(null)} />
          ) : (
            <EmptyConversation />
          )}
        </section>
      </div>
    </div>
  )
}

function InboxFilters({ filters, setFilters }) {
  const set = (field, value) => setFilters((current) => ({ ...current, [field]: value }))
  return (
    <div className="space-y-3 border-b border-[#DDE5E3] p-4">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-3 text-[#8b969d]" />
        <input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Search conversations..."
          className="h-10 w-full rounded-lg border border-[#DDE5E3] bg-[#F8FAFA] pl-9 pr-3 text-sm outline-none focus:border-[#496B5A] focus:ring-2 focus:ring-[#496B5A]/20"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <CompactSelect value={filters.platform} onChange={(value) => set('platform', value)} options={['facebook', 'instagram']} placeholder="Platform" />
        <CompactSelect value={filters.status} onChange={(value) => set('status', value)} options={STATUSES} placeholder="Status" />
        <CompactSelect value={filters.unread} onChange={(value) => set('unread', value)} options={['true']} labels={{ true: 'Unread' }} placeholder="All" />
      </div>
    </div>
  )
}

function ConversationList({ conversations, activeId, onSelect, isLoading, isError }) {
  if (isLoading) return <ListMessage text="Loading conversations..." />
  if (isError) return <ListMessage text="Unable to load conversations." error />
  if (!conversations.length) return <ListMessage text="No conversations match these filters." />

  return (
    <div className="max-h-[600px] overflow-y-auto divide-y divide-[#EEF2F2]">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={cn(
            'flex w-full gap-3 p-4 text-left transition-colors hover:bg-[#F8FAFA]',
            String(activeId) === String(conversation.id) && 'bg-[#eef3f0]'
          )}
        >
          <Avatar alt={conversation.contact?.display_name || 'Contact'} src={conversation.contact?.profile_image_url} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-[#263238]">{conversation.contact?.display_name || conversation.contact?.username || 'Unknown contact'}</p>
              <span className="shrink-0 text-[10px] text-[#8b969d]">{formatRelative(conversation.last_message_at)}</span>
            </div>
            <p className="mt-1 truncate text-xs text-[#637079]">{conversation.last_message_preview || 'No messages yet'}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase text-[#496B5A]">{conversation.platform}</span>
              <Badge size="sm" variant={statusVariant(conversation.status)}>{conversation.status}</Badge>
              {conversation.unread_count > 0 && <span className="ml-auto rounded-full bg-[#496B5A] px-2 py-0.5 text-[10px] font-bold text-white">{conversation.unread_count}</span>}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function ConversationPanel({ id, onBack }) {
  const conversationQuery = useConversation(id)
  const messagesQuery = useConversationMessages(id)
  const conversation = conversationQuery.data
  const messages = messagesQuery.data || []

  if (conversationQuery.isLoading) return <ListMessage text="Loading conversation..." />
  if (!conversation) return <ListMessage text="Conversation unavailable." error />

  return (
    <div className="flex h-full min-h-[680px] flex-col">
      <ConversationHeader conversation={conversation} onBack={onBack} />
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#F8FAFA] p-4 sm:p-6">
        {messagesQuery.isLoading ? (
          <ListMessage text="Loading messages..." />
        ) : messages.length ? messages.map((message) => <MessageBubble key={message.id} message={message} />) : (
          <ListMessage text="No messages in this conversation." />
        )}
      </div>
      <ConversationActions conversation={conversation} />
      <ReplyComposer conversationId={id} />
    </div>
  )
}

function ConversationHeader({ conversation, onBack }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#DDE5E3] p-4">
      <button onClick={onBack} className="rounded-lg p-2 text-[#637079] hover:bg-[#EEF2F2] lg:hidden" aria-label="Back"><ArrowLeft size={18} /></button>
      <Avatar alt={conversation.contact?.display_name || 'Contact'} src={conversation.contact?.profile_image_url} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#263238]">{conversation.contact?.display_name || conversation.contact?.username || 'Unknown contact'}</p>
        <p className="text-xs text-[#637079]">{conversation.platform} · {conversation.account_name}</p>
      </div>
      <Badge variant={statusVariant(conversation.status)}>{conversation.status}</Badge>
    </div>
  )
}

function ConversationActions({ conversation }) {
  const user = useAuthStore((state) => state.user)
  const { data: agents = [] } = useAgents()
  const { data: leads = [] } = useLeads()
  const assign = useAssignConversation(conversation.id)
  const linkLead = useLinkConversationLead(conversation.id)
  const markRead = useMarkConversationRead(conversation.id)
  const status = useUpdateConversationStatus(conversation.id)
  const [showCreateLead, setShowCreateLead] = useState(false)

  return (
    <>
      <div className="grid gap-2 border-t border-[#DDE5E3] bg-white p-3 sm:grid-cols-4">
        <select value={conversation.assigned_agent || ''} onChange={(e) => assign.mutate(e.target.value ? Number(e.target.value) : null)} className="h-9 rounded-lg border border-[#DDE5E3] px-2 text-xs">
          <option value="">Unassigned</option>
          {user?.role === 'agent' && <option value={user.id}>Claim for me</option>}
          {user?.role !== 'agent' && agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.full_name}</option>)}
        </select>
        <select value={conversation.status} onChange={(e) => status.mutate(e.target.value)} className="h-9 rounded-lg border border-[#DDE5E3] px-2 text-xs">
          {STATUSES.map((value) => <option key={value} value={value}>{capitalize(value)}</option>)}
        </select>
        {conversation.linked_lead ? (
          <div className="flex h-9 items-center gap-2 rounded-lg bg-[#eef3f0] px-3 text-xs font-medium text-[#496B5A]"><Link2 size={13} />{conversation.linked_lead_name}</div>
        ) : (
          <select defaultValue="" onChange={(e) => e.target.value && linkLead.mutate(Number(e.target.value))} className="h-9 rounded-lg border border-[#DDE5E3] px-2 text-xs">
            <option value="">Link existing lead</option>
            {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.full_name}</option>)}
          </select>
        )}
        <div className="flex gap-2">
          {conversation.unread_count > 0 && <button onClick={() => markRead.mutate()} className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-[#DDE5E3] text-xs text-[#496B5A]"><CheckCheck size={14} />Read</button>}
          {!conversation.linked_lead && <button onClick={() => setShowCreateLead(true)} className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-[#496B5A] px-2 text-xs font-semibold text-white"><UserPlus size={14} />New lead</button>}
        </div>
      </div>
      {showCreateLead && <CreateLeadDialog conversation={conversation} onClose={() => setShowCreateLead(false)} />}
    </>
  )
}

function ReplyComposer({ conversationId }) {
  const [text, setText] = useState('')
  const reply = useReplyToConversation(conversationId)
  function submit(event) {
    event.preventDefault()
    if (!text.trim()) return
    reply.mutate(text.trim(), { onSuccess: () => setText('') })
  }
  return (
    <form onSubmit={submit} className="flex items-end gap-2 border-t border-[#DDE5E3] bg-white p-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows="2" maxLength="2000" placeholder="Write a reply..." className="min-h-11 flex-1 resize-none rounded-xl border border-[#DDE5E3] px-3 py-2 text-sm outline-none focus:border-[#496B5A] focus:ring-2 focus:ring-[#496B5A]/20" />
      <Button type="submit" size="icon" loading={reply.isPending} aria-label="Send reply"><Send size={16} /></Button>
    </form>
  )
}

function CreateLeadDialog({ conversation, onClose }) {
  const mutation = useCreateLeadFromConversation(conversation.id)
  const [form, setForm] = useState({
    full_name: conversation.contact?.display_name || '', phone: '', email: '',
  })
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  function submit(event) {
    event.preventDefault()
    mutation.mutate(form, { onSuccess: onClose })
  }
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between"><div><h3 className="font-semibold text-[#263238]">Create lead</h3><p className="text-xs text-[#637079]">Link this conversation to a new CRM lead.</p></div><button type="button" onClick={onClose}><X size={17} /></button></div>
        <Input label="Full name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
        <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        <div className="flex justify-end gap-2"><Button type="button" variant="outlined" onClick={onClose}>Cancel</Button><Button type="submit" loading={mutation.isPending}>Create lead</Button></div>
      </form>
    </div>
  )
}

function MessageBubble({ message }) {
  const outbound = message.direction === 'outbound'
  return (
    <div className={cn('flex', outbound ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm', outbound ? 'rounded-br-md bg-[#496B5A] text-white' : 'rounded-bl-md bg-white text-[#263238]')}>
        <p className="whitespace-pre-wrap">{message.text || `[${message.message_type}]`}</p>
        {message.attachments?.length > 0 && <div className="mt-2 space-y-2">{message.attachments.map((attachment, index) => attachment.type === 'image' && attachment.url ? <a key={`${attachment.url}-${index}`} href={attachment.url} target="_blank" rel="noreferrer"><img src={attachment.url} alt={attachment.title || 'Message attachment'} className="max-h-60 rounded-lg object-cover" /></a> : <a key={`${attachment.url}-${index}`} href={attachment.url || '#'} target="_blank" rel="noreferrer" className="block rounded-lg bg-black/10 px-3 py-2 text-xs underline">{attachment.title || attachment.type || 'Attachment'}</a>)}</div>}
        <div className={cn('mt-1 flex items-center justify-end gap-1 text-[9px]', outbound ? 'text-white/60' : 'text-[#8b969d]')}>
          {formatMessageTime(message.sent_at)}
          {outbound && <span>{message.delivery_status}</span>}
        </div>
        {message.error_message && <p className="mt-1 text-[10px] text-red-200">{message.error_message}</p>}
      </div>
    </div>
  )
}

function CompactSelect({ value, onChange, options, labels = {}, placeholder }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 min-w-0 rounded-lg border border-[#DDE5E3] bg-white px-2 text-[11px] text-[#637079]"><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{labels[option] || capitalize(option)}</option>)}</select>
}

function EmptyConversation() {
  return <div className="flex h-full min-h-[680px] flex-col items-center justify-center text-center"><div className="rounded-2xl bg-[#eef3f0] p-4 text-[#496B5A]"><Inbox size={28} /></div><p className="mt-4 font-semibold text-[#263238]">Select a conversation</p><p className="mt-1 text-sm text-[#637079]">Messages and lead actions will appear here.</p></div>
}

function ListMessage({ text, error }) {
  return <div className={cn('flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center text-sm', error ? 'text-red-600' : 'text-[#637079]')}>{error ? <MessageCircle size={22} /> : <Users size={22} />}<p>{text}</p></div>
}

function statusVariant(status) {
  return { open: 'success', pending: 'warning', closed: 'neutral', spam: 'error' }[status] || 'neutral'
}
function capitalize(value = '') { return value.charAt(0).toUpperCase() + value.slice(1) }
function formatRelative(value) {
  if (!value) return ''
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
function formatMessageTime(value) { return value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' }
