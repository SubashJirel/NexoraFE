import { useState, useMemo } from 'react'
import { Plus, Search, UserX, Mail, Shield, MoreVertical, Pencil, Trash2, UserCheck, Eye, EyeOff } from 'lucide-react'
import { useAgents } from '@/hooks/useAgents'
import { useCreateAgent } from '@/hooks/useCreateAgent'
import { useUpdateAgent } from '@/hooks/useUpdateAgent'
import { useDeleteAgent } from '@/hooks/useDeleteAgent'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'

// ── AgentsPage ────────────────────────────────────────────────
export default function AgentsPage() {
  const { data: agents = [], isLoading, isError } = useAgents()

  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editAgent, setEditAgent] = useState(null)    // agent object to edit
  const [deleteAgent, setDeleteAgent] = useState(null) // agent object to confirm delete

  // ── Client-side search ────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return agents
    return agents.filter(
      (a) =>
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q)
    )
  }, [agents, search])

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    agents.length,
    active:   agents.filter((a) => a.is_active).length,
    inactive: agents.filter((a) => !a.is_active).length,
  }), [agents])

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#263238]">Agents</h2>
          <p className="mt-1 text-sm text-[#637079]">
            Manage your agency's team members and their access.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={15} />}
          onClick={() => setAddOpen(true)}
        >
          Add Agent
        </Button>
      </div>

      {/* ── Stats strip ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Agents',    value: stats.total,    color: 'text-[#263238]' },
          { label: 'Active',          value: stats.active,   color: 'text-green-600' },
          { label: 'Inactive',        value: stats.inactive, color: 'text-[#8b969d]' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-[#DDE5E3] px-4 py-3 flex items-center justify-between"
          >
            <span className="text-xs text-[#637079] font-medium">{s.label}</span>
            <span className={cn('text-xl font-bold', s.color)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Search bar ───────────────────────────────────── */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b969d] pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents by name, email, or role…"
          className={cn(
            'w-full h-10 rounded-xl border border-[#DDE5E3] bg-white',
            'pl-10 pr-4 text-sm text-[#263238] placeholder:text-[#8b969d]',
            'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
            'transition-all duration-150'
          )}
        />
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <ErrorState />
      ) : filtered.length === 0 ? (
        <EmptyState
          hasSearch={Boolean(search)}
          onClear={() => setSearch('')}
          onAdd={() => setAddOpen(true)}
        />
      ) : (
        <>
          <p className="text-xs text-[#8b969d]">
            Showing <span className="font-semibold text-[#263238]">{filtered.length}</span> of {agents.length} agents
          </p>

          {/* ── Agent cards grid ─────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={() => setEditAgent(agent)}
                onDelete={() => setDeleteAgent(agent)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      {addOpen && (
        <AgentFormModal
          title="Add Agent"
          onClose={() => setAddOpen(false)}
        />
      )}

      {editAgent && (
        <AgentFormModal
          title="Edit Agent"
          agent={editAgent}
          onClose={() => setEditAgent(null)}
        />
      )}

      {deleteAgent && (
        <DeleteConfirmModal
          agent={deleteAgent}
          onClose={() => setDeleteAgent(null)}
        />
      )}
    </div>
  )
}

// ── AgentCard ────────────────────────────────────────────────
function AgentCard({ agent, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const joinedDate = agent.created_at
    ? new Date(agent.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  return (
    <Card padding="md" hoverable>
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + info */}
        <div className="flex items-start gap-3 min-w-0">
          <Avatar
            alt={agent.full_name || 'Agent'}
            src={agent.avatarUrl}
            size="lg"
            status={agent.is_active ? 'online' : 'offline'}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#263238] truncate">
              {agent.full_name || '—'}
            </p>
            <p className="text-xs text-[#637079] truncate flex items-center gap-1 mt-0.5">
              <Mail size={11} className="shrink-0" />
              {agent.email}
            </p>
            {agent.role && (
              <p className="text-xs text-[#8b969d] flex items-center gap-1 mt-0.5">
                <Shield size={11} className="shrink-0" />
                {agent.role}
              </p>
            )}
          </div>
        </div>

        {/* Action menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-[#637079] hover:bg-[#F8FAFA] transition-colors"
            aria-label="Agent actions"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-9 z-20 w-40 bg-white rounded-xl border border-[#DDE5E3] shadow-lg py-1 overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); onEdit() }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-[#263238] hover:bg-[#F8FAFA] transition-colors"
                >
                  <Pencil size={14} className="text-[#496B5A]" />
                  Edit Agent
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete() }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-[#ef4444] hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Remove Agent
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer row */}
      <div className="mt-4 pt-3 border-t border-[#DDE5E3] flex items-center justify-between gap-2">
        <Badge
          variant={agent.is_active ? 'success' : 'neutral'}
          dot
          size="sm"
        >
          {agent.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <span className="text-[10px] text-[#8b969d]">Joined {joinedDate}</span>
      </div>
    </Card>
  )
}

// ── AgentFormModal ────────────────────────────────────────────
function AgentFormModal({ title, agent, onClose }) {
  const isEdit = Boolean(agent)

  const [form, setForm] = useState({
    full_name: agent?.full_name ?? '',
    email:     agent?.email    ?? '',
    password:  '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const createMutation = useCreateAgent({ onSuccess: onClose })
  const updateMutation = useUpdateAgent(agent?.id, { onSuccess: onClose })

  const isPending = createMutation.isPending || updateMutation.isPending

  function validate() {
    const e = {}
    if (!form.full_name.trim())           e.full_name = 'Full name is required.'
    if (!form.email.trim())               e.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.'
    if (!isEdit && form.password.length < 8)   e.password = 'Password must be at least 8 characters.'
    return e
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    if (isEdit) {
      // Only send password if the user filled it in
      const payload = { full_name: form.full_name.trim(), email: form.email.trim().toLowerCase() }
      if (form.password) payload.password = form.password
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate({
        full_name: form.full_name.trim(),
        email:     form.email.trim().toLowerCase(),
        password:  form.password,
      })
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE5E3]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#eef3f0] flex items-center justify-center">
              <UserCheck size={16} className="text-[#496B5A]" />
            </div>
            <h2 className="text-base font-semibold text-[#263238]">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-[#637079] hover:bg-[#F8FAFA] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Priya Thapa"
              value={form.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              error={errors.full_name}
              disabled={isPending}
              autoFocus
            />
            <Input
              label="Email"
              type="email"
              placeholder="agent@example.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              disabled={isPending}
            />
            <Input
              label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
              type={showPassword ? 'text' : 'password'}
              placeholder={isEdit ? '••••••••' : 'At least 8 characters'}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              disabled={isPending}
              autoComplete="new-password"
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="text-[#8b969d] transition-colors hover:text-[#496B5A]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 pb-5">
            <Button variant="outlined" size="md" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={isPending}>
              {isEdit ? 'Save Changes' : 'Add Agent'}
            </Button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}

// ── DeleteConfirmModal ────────────────────────────────────────
function DeleteConfirmModal({ agent, onClose }) {
  const deleteMutation = useDeleteAgent(agent.id, { onSuccess: onClose })

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Confirm removal"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-[#ef4444]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#263238]">Remove Agent</p>
            <p className="text-xs text-[#637079] mt-0.5">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-[#637079]">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-[#263238]">{agent.full_name}</span>?
          They will lose access to the platform immediately.
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="outlined" size="md" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Remove
          </Button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── ModalOverlay ──────────────────────────────────────────────
function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {children}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────
function EmptyState({ hasSearch, onClear, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#eef3f0] flex items-center justify-center">
        {hasSearch
          ? <Search size={28} className="text-[#496B5A]" />
          : <UserX size={28} className="text-[#496B5A]" />
        }
      </div>
      <div>
        <p className="text-base font-semibold text-[#263238]">
          {hasSearch ? 'No agents found' : 'No agents yet'}
        </p>
        <p className="mt-1 text-sm text-[#637079]">
          {hasSearch
            ? 'Try adjusting your search terms.'
            : 'Add your first agent to get started.'}
        </p>
      </div>
      {hasSearch
        ? <Button variant="outlined" size="sm" onClick={onClear}>Clear search</Button>
        : <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={onAdd}>Add Agent</Button>
      }
    </div>
  )
}

// ── ErrorState ────────────────────────────────────────────────
function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <p className="text-base font-semibold text-[#263238]">Failed to load agents</p>
      <p className="text-sm text-[#637079]">Check your connection and try again.</p>
      <Button variant="outlined" size="sm" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  )
}
