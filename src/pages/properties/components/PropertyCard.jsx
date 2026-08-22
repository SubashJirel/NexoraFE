import { useState } from 'react'
import { MapPin, Bed, Bath, Maximize2, MoreVertical, Heart, Eye, PhoneCall, Layers, Globe2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { useDeleteProperty } from '@/hooks/useDeleteProperty'
import { useLocalization } from '@/context/useLocalization'
import { formatAddress } from '@/lib/localization'
import { usePropertyPublication } from '@/hooks/usePropertyPublication'
import { useAuthStore } from '@/store/authStore'

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:             { label: 'Draft',             variant: 'neutral' },
  available:         { label: 'Available',         variant: 'success' },
  under_negotiation: { label: 'Under Negotiation', variant: 'warning' },
  sold:              { label: 'Sold',              variant: 'error' },
  rented:            { label: 'Rented',            variant: 'info' },
  hidden:            { label: 'Hidden',            variant: 'neutral' },
  archived:          { label: 'Archived',          variant: 'neutral' },
}

// ── Purpose pill ──────────────────────────────────────────────
// ── Price formatter ───────────────────────────────────────────
function formatPrice(price, purpose, localization) {
  const suffix = purpose === 'rent' ? (localization.language === 'ne' ? ' / महिना' : ' / month') : ''
  return `${localization.currency(price)}${suffix}`
}

// ── Property type icons ───────────────────────────────────────
export default function PropertyCard({ property, view = 'grid' }) {
  const localization = useLocalization()
  const [liked, setLiked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.user?.role)
  const canManagePublication = ['agency_owner', 'agency_manager'].includes(role)
  const publication = usePropertyPublication(property)
  const { mutate: deleteProperty, isPending: isDeletingProperty } = useDeleteProperty(property.id, {
    onSuccess: () => setMenuOpen(false),
  })

  const primaryMedia = property.media?.find((m) => m.is_primary) || property.media?.[0]
  const imageUrl = primaryMedia?.file || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80'

  const status  = STATUS_CONFIG[property.status] || { label: property.status, variant: 'neutral' }
  const isCommercial = property.property_type === 'commercial'

  if (view === 'list') {
    return <PropertyListRow property={property} status={status} imageUrl={imageUrl} liked={liked} setLiked={setLiked} canManagePublication={canManagePublication} publication={publication} />
  }

  return (
    <div className="group bg-white rounded-xl border border-[#DDE5E3] overflow-hidden shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] hover:shadow-[0_6px_20px_0_rgb(0_0_0/0.10)] transition-all duration-200 flex flex-col">

      {/* ── Image ── */}
      <div className="relative h-48 overflow-hidden bg-[#EEF2F2] shrink-0">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Status badge — top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge variant={status.variant} size="sm">{status.label}</Badge>
          {property.featured && (
            <Badge variant="warning" size="sm">Featured</Badge>
          )}
        </div>

        {/* Wishlist — top right */}
        <button
          onClick={() => setLiked((v) => !v)}
          className={cn(
            'absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center',
            'bg-white/90 backdrop-blur-sm shadow-sm',
            'transition-all duration-150 hover:scale-110',
            liked ? 'text-red-500' : 'text-[#8b969d] hover:text-red-400'
          )}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-[#263238] leading-snug line-clamp-1 flex-1">
            {property.title}
          </h3>
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              disabled={isDeletingProperty}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-[#8b969d] hover:bg-[#F8FAFA] hover:text-[#263238] transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <PropertyMenu
                onClose={() => setMenuOpen(false)}
                onViewDetails={() => navigate(`/properties/${property.id}`)}
                onEdit={() => navigate(`/properties/${property.id}/edit`)}
                onDelete={() => {
                  const confirmed = window.confirm(`Delete ${property.title}? This cannot be undone.`)
                  if (!confirmed) return
                  deleteProperty()
                }}
              />
            )}
          </div>
        </div>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-[#637079]">
          <MapPin size={12} className="text-[#8FAF9B] shrink-0" />
          <span className="truncate">{formatAddress(property, localization) || property.address}</span>
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-[#637079]">
          {isCommercial ? (
            <>
              {property.floors && <Spec icon={<Layers size={13} className="text-[#6FAFA8]" />} label={`${property.floors} Floors`} />}
              {property.parking && <Spec icon={<span className="text-[#6FAFA8] font-bold text-[11px]">P</span>} label={property.parking} />}
              {property.area && <Spec icon={<Maximize2 size={13} className="text-[#6FAFA8]" />} label={property.area} />}
            </>
          ) : (
            <>
              {property.bedrooms  != null && <Spec icon={<Bed     size={13} className="text-[#6FAFA8]" />} label={property.bedrooms} />}
              {property.bathrooms != null && <Spec icon={<Bath    size={13} className="text-[#6FAFA8]" />} label={property.bathrooms} />}
              {property.area && <Spec icon={<Maximize2 size={13} className="text-[#6FAFA8]" />} label={property.area} />}
            </>
          )}
        </div>

        {/* Price */}
        <p className="text-base font-extrabold text-[#263238] tracking-tight">
          {formatPrice(property.price, property.purpose, localization)}
        </p>

        {/* Divider */}
        <div className="h-px bg-[#DDE5E3]" />

        {canManagePublication && <WebsitePublicationButton property={property} publication={publication} fullWidth />}

        {/* Agent + stats */}
        <div className="flex items-center gap-2">
          <Avatar
            alt={property.assigned_agent?.full_name || 'Agent'}
            src={property.assigned_agent?.avatarUrl}
            size="xs"
          />
          <span className="text-xs text-[#637079] flex-1 truncate">
            {property.assigned_agent?.full_name || 'Unassigned'}
          </span>
          <div className="flex items-center gap-3 text-[10px] text-[#8b969d]">
            <StatChip icon={<PhoneCall size={11} />} value={property.leads ?? 0} label="LEADS" />
            <StatChip icon={<Eye size={11} />} value={formatViews(property.views ?? 0)} label="VIEWS" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── List view row ─────────────────────────────────────────────
function PropertyListRow({ property, status, imageUrl, liked, setLiked, canManagePublication, publication }) {
  const localization = useLocalization()
  const isCommercial = property.property_type === 'commercial'

  return (
    <div className="group bg-white rounded-xl border border-[#DDE5E3] overflow-hidden hover:shadow-md transition-all duration-200 flex gap-0">
      {/* Image */}
      <div className="relative w-44 shrink-0 overflow-hidden bg-[#EEF2F2]">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant={status.variant} size="sm">{status.label}</Badge>
          {property.featured && <Badge variant="warning" size="sm">Featured</Badge>}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center gap-6 px-5 py-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="text-sm font-bold text-[#263238] truncate">{property.title}</h3>
          <p className="flex items-center gap-1 text-xs text-[#637079]">
            <MapPin size={11} className="text-[#8FAF9B]" />
            {formatAddress(property, localization) || property.address}
          </p>
          <div className="flex items-center gap-3 text-xs text-[#637079]">
            {!isCommercial && property.bedrooms  != null && <Spec icon={<Bed  size={12} className="text-[#6FAFA8]" />} label={`${property.bedrooms} Beds`} />}
            {!isCommercial && property.bathrooms != null && <Spec icon={<Bath size={12} className="text-[#6FAFA8]" />} label={`${property.bathrooms} Baths`} />}
            {property.area && <Spec icon={<Maximize2 size={12} className="text-[#6FAFA8]" />} label={property.area} />}
          </div>
        </div>

        <div className="text-right shrink-0 space-y-1">
          <p className="text-base font-extrabold text-[#263238]">
            {formatPrice(property.price, property.purpose, localization)}
          </p>
          <div className="flex items-center justify-end gap-3 text-[10px] text-[#8b969d]">
            <StatChip icon={<PhoneCall size={11} />} value={property.leads ?? 0} label="LEADS" />
            <StatChip icon={<Eye size={11} />} value={formatViews(property.views ?? 0)} label="VIEWS" />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canManagePublication && <WebsitePublicationButton property={property} publication={publication} />}
          <Avatar alt={property.assigned_agent?.full_name || 'Agent'} size="sm" />
          <button
            onClick={() => setLiked((v) => !v)}
            className={cn('h-8 w-8 rounded-lg flex items-center justify-center border border-[#DDE5E3] transition-colors', liked ? 'text-red-500' : 'text-[#8b969d] hover:text-red-400')}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  )
}

function WebsitePublicationButton({ property, publication, fullWidth = false }) {
  const published = Boolean(property.is_published)
  const approvalRequired = !published && property.requires_republish_approval
  return (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      disabled={publication.isPending || approvalRequired}
      title={approvalRequired ? 'Manager approval is required before this listing can be republished.' : undefined}
      onClick={() => publication.mutate(!published)}
      className={cn(
        'inline-flex h-8 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors',
        fullWidth && 'w-full',
        published
          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'border-[#496B5A] bg-white text-[#496B5A] hover:bg-[#eef3f0]',
        (publication.isPending || approvalRequired) && 'cursor-not-allowed opacity-50',
      )}
    >
      <Globe2 size={13} className={publication.isPending ? 'animate-pulse' : ''} />
      {publication.isPending ? 'Updating…' : published ? 'Live on Website' : 'Publish to Website'}
    </button>
  )
}

// ── Context menu ──────────────────────────────────────────────
function PropertyMenu({ onClose, onViewDetails, onEdit, onDelete }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-[#DDE5E3] rounded-xl shadow-lg overflow-hidden">
        {['View details', 'Edit', 'Mark as sold', 'Delete'].map((item) => (
          <button
            key={item}
            onClick={() => {
              if (item === 'View details') onViewDetails?.()
              if (item === 'Edit') onEdit?.()
              if (item === 'Delete') onDelete?.()
              onClose()
            }}
            className={cn(
              'w-full px-4 py-2.5 text-left text-xs hover:bg-[#F8FAFA] transition-colors',
              item === 'Delete' ? 'text-red-500' : 'text-[#263238]'
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </>
  )
}

// ── Small helpers ─────────────────────────────────────────────
function Spec({ icon, label }) {
  return (
    <span className="flex items-center gap-1">
      {icon}
      <span>{label}</span>
    </span>
  )
}

function StatChip({ icon, value, label }) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className="flex items-center gap-0.5">{icon} {value}</span>
      <span className="tracking-wider">{label}</span>
    </span>
  )
}

function formatViews(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}
