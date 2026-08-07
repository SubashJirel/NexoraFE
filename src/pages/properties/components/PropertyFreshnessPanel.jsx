import { useState } from 'react'
import { CalendarCheck2, CheckCircle2, Clock3, Copy, History, RefreshCw } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useConfirmPropertyFreshness, useDecidePropertyRepublish, usePropertyDuplicates, usePropertyHistory, useRequestPropertyRepublish, useReviewPropertyDuplicate } from '@/hooks/usePropertyLifecycle'

export default function PropertyFreshnessPanel({ property }) {
  const id = property.id
  const role = useAuthStore((state) => state.user?.role)
  const isManager = ['agency_owner', 'agency_manager'].includes(role)
  const history = usePropertyHistory(id)
  const duplicates = usePropertyDuplicates(id)
  const confirmFreshness = useConfirmPropertyFreshness(id)
  const requestRepublish = useRequestPropertyRepublish(id)
  const decideRepublish = useDecidePropertyRepublish(id)
  const reviewDuplicate = useReviewPropertyDuplicate(id)
  const [days, setDays] = useState(30)
  const [ownerConfirmed, setOwnerConfirmed] = useState(false)
  const [error, setError] = useState('')
  const run = (mutation, payload) => { setError(''); mutation.mutate(payload, { onError: (requestError) => setError(readApiError(requestError)) }) }
  const freshnessTone = property.freshness_state === 'fresh' ? 'success' : property.freshness_state === 'expiring_soon' ? 'warning' : 'error'

  return <section className="space-y-6 rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><div className="flex items-center gap-2"><CalendarCheck2 size={18} className="text-[#496B5A]" /><h3 className="font-semibold text-[#263238]">Listing Freshness & Availability</h3></div><p className="mt-1 text-xs text-[#637079]">Every public listing must be recently confirmed by its agency.</p></div>
      <div className="text-right"><Badge variant={freshnessTone}>{words(property.freshness_state)}</Badge><p className="mt-1 text-xs text-[#637079]">{property.days_until_expiry == null ? 'Not confirmed' : `${property.days_until_expiry} day(s) remaining`}</p></div>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <DateCard label="Last verified" value={property.availability_verified_at} />
      <DateCard label="Listing expires" value={property.listing_expires_at} />
      <DateCard label="Owner confirmed" value={property.owner_confirmed_at} />
    </div>

    <div className="grid items-end gap-3 rounded-xl bg-[#F8FAFA] p-4 sm:grid-cols-[150px_1fr_auto]">
      <Input label="Valid for days" type="number" min="1" max="90" value={days} onChange={(event) => setDays(event.target.value)} />
      <label className="flex h-10 items-center gap-2 text-sm text-[#263238]"><input type="checkbox" checked={ownerConfirmed} onChange={(event) => setOwnerConfirmed(event.target.checked)} />Owner confirmed availability</label>
      <Button size="sm" loading={confirmFreshness.isPending} leftIcon={<RefreshCw size={14} />} onClick={() => run(confirmFreshness, { valid_for_days: Number(days), owner_confirmed: ownerConfirmed })}>Reconfirm listing</Button>
    </div>

    {property.requires_republish_approval && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-amber-900">Manager approval required to republish</p><p className="text-xs text-amber-800">Status: {words(property.republish_approval_status)}{property.republish_rejection_reason ? ` · ${property.republish_rejection_reason}` : ''}</p></div>
        <div className="flex gap-2">{property.republish_approval_status !== 'pending' && <Button size="sm" variant="outlined" loading={requestRepublish.isPending} onClick={() => run(requestRepublish)}>Request approval</Button>}{isManager && property.republish_approval_status === 'pending' && <><Button size="sm" loading={decideRepublish.isPending} onClick={() => run(decideRepublish, { decision: 'approve' })}>Approve</Button><Button size="sm" variant="danger" onClick={() => { const reason = window.prompt('Reason for rejecting republication'); if (reason) run(decideRepublish, { decision: 'reject', reason }) }}>Reject</Button></>}</div>
      </div>
    </div>}
    {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

    <div>
      <div className="mb-3 flex items-center gap-2"><Copy size={16} className="text-[#496B5A]" /><h4 className="text-sm font-semibold text-[#263238]">Duplicate detection</h4></div>
      {duplicates.isLoading ? <p className="text-xs text-[#637079]">Checking for duplicates…</p> : duplicates.data?.length ? <div className="space-y-2">{duplicates.data.map((flag) => <div key={flag.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DDE5E3] p-3"><div><p className="text-sm font-semibold text-[#263238]">{flag.candidate_display_id} · {flag.candidate_title}</p><p className="text-xs text-[#637079]">{flag.score}% match · {flag.reasons.join(', ')}</p></div><div className="flex items-center gap-2"><Badge variant={flag.status === 'pending' ? 'warning' : flag.status === 'confirmed' ? 'error' : 'success'}>{flag.status_display}</Badge>{flag.status === 'pending' && <><Button size="sm" variant="outlined" onClick={() => reviewDuplicate.mutate({ flagId: flag.id, status: 'dismissed' })}>Not duplicate</Button><Button size="sm" variant="danger" onClick={() => reviewDuplicate.mutate({ flagId: flag.id, status: 'confirmed' })}>Confirm duplicate</Button></>}</div></div>)}</div> : <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><CheckCircle2 size={13} className="mr-1 inline" />No likely duplicates detected.</p>}
    </div>

    <div>
      <div className="mb-3 flex items-center gap-2"><History size={16} className="text-[#496B5A]" /><h4 className="text-sm font-semibold text-[#263238]">Property history</h4></div>
      {history.isLoading ? <p className="text-xs text-[#637079]">Loading history…</p> : <div className="max-h-72 space-y-3 overflow-y-auto">{history.data?.map((event) => <div key={event.id} className="flex gap-3 border-l-2 border-[#B8C9C5] pl-3"><Clock3 size={14} className="mt-0.5 shrink-0 text-[#496B5A]" /><div><p className="text-sm font-medium text-[#263238]">{event.summary}</p><p className="text-xs text-[#637079]">{event.actor_name || 'System'} · {new Date(event.created_at).toLocaleString()}</p>{event.note && <p className="mt-1 text-xs text-[#637079]">{event.note}</p>}</div></div>)}{!history.data?.length && <p className="text-xs text-[#637079]">No history recorded yet.</p>}</div>}
    </div>
  </section>
}

function DateCard({ label, value }) { return <div className="rounded-xl border border-[#EEF2F2] bg-[#F8FAFA] p-3"><p className="text-xs text-[#637079]">{label}</p><p className="mt-1 text-sm font-semibold text-[#263238]">{value ? new Date(value).toLocaleString() : 'Not recorded'}</p></div> }
function words(value) { return value ? String(value).split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Unknown' }
function readApiError(error) { const data = error?.response?.data; if (!data) return 'Unable to update listing lifecycle.'; return typeof data === 'string' ? data : Object.values(data).flat().join(' ') }
