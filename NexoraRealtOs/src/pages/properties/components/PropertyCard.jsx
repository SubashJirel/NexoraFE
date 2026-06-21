import { useState } from 'react'
import { MapPin, Bed, Bath, Maximize2, MoreVertical, Heart, Eye, PhoneCall, Building2, Layers } from 'lucide-react'
import { cn } from '@/lib/cn'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  active:   { label: 'Active',   variant: 'success' },
  sold:     { label: 'Sold',     variant: 'error' },
  pending:  { label: 'Pending',  variant: 'warning' },
  draft:    { label: 'Draft',    variant: 'neutral' },
  inactive: { label: 'Inactive', variant: 'neutral' },
}

// ── Purpose pill ──────────────────────────────────────────────
const PURPOSE_CONFIG = {
  sale:  { label: 'For Sale', cls: 'bg-[#496B5A] text-white' },
  rent:  { label: 'For Rent', cls: 'bg-[#6FAFA8] text-white' },
  lease: { label: 'Lease',    cls: 'bg-[#8FAF9B] text-white' },
}

// ── Price formatter ───────────────────────────────────────────
function formatPrice(price, purpose) {
  const n = Number(price)
  if (isNaN(n)) return price
  const suffix = purpose === 'rent' ? '/mo' : ''
  if (n >= 10000000) return `NPR ${(n / 10000000).toFixed(1).replace(/\.0$/, '')} Crore${suffix}`
  if (n >= 100000)   return `NPR ${(n / 100000).toFixed(1).replace(/\.0$/, '')} Lakh${suffix}`
  return `NPR ${n.toLocaleString()}${suffix}`
}

// ── Property type icons ───────────────────────────────────────
function PropertyTypeIcon({ type }) {
  if (type === 'commercial') return <Building2 size={13} />
  if (type === 'land')       return <Maximize2 size={13} />
  if (type === 'apartment')  return <Layers size={13} />
  return <Building2 size={13} />
}

export default function PropertyCard({ property, view = 'grid' }) {
  const [liked, setLiked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const primaryMedia = property.media?.find((m) => m.is_primary) || property.media?.[0]
  const imageUrl = primaryMedia?.file || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80'

  const status  = STATUS_CONFIG[property.status] || { label: property.status, variant: 'neutral' }
  const purpose = PURPOSE_CONFIG[property.purpose] || PURPOSE_CONFIG.sale
  const isCommercial = property.property_type === 'commercial'

  if (view === 'list') {
    return <PropertyListRow property={property} status={status} purpose={purpose} imageUrl={imageUrl} liked={liked} setLiked={setLiked} />
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
              className="h-7 w-7 flex items-center justify-center rounded-lg text-[#8b969d] hover:bg-[#F8FAFA] hover:text-[#263238] transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <PropertyMenu onClose={() => setMenuOpen(false)} />
            )}
          </div>
        </div>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-[#637079]">
          <MapPin size={12} className="text-[#8FAF9B] shrink-0" />
          <span className="truncate">{property.city}, {property.district}</span>
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
          {formatPrice(property.price, property.purpose)}
        </p>

        {/* Divider */}
        <div className="h-px bg-[#DDE5E3]" />

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
function PropertyListRow({ property, status, purpose, imageUrl, liked, setLiked }) {
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
            {property.address}
          </p>
          <div className="flex items-center gap-3 text-xs text-[#637079]">
            {!isCommercial && property.bedrooms  != null && <Spec icon={<Bed  size={12} className="text-[#6FAFA8]" />} label={`${property.bedrooms} Beds`} />}
            {!isCommercial && property.bathrooms != null && <Spec icon={<Bath size={12} className="text-[#6FAFA8]" />} label={`${property.bathrooms} Baths`} />}
            {property.area && <Spec icon={<Maximize2 size={12} className="text-[#6FAFA8]" />} label={property.area} />}
          </div>
        </div>

        <div className="text-right shrink-0 space-y-1">
          <p className="text-base font-extrabold text-[#263238]">
            {formatPrice(property.price, property.purpose)}
          </p>
          <div className="flex items-center justify-end gap-3 text-[10px] text-[#8b969d]">
            <StatChip icon={<PhoneCall size={11} />} value={property.leads ?? 0} label="LEADS" />
            <StatChip icon={<Eye size={11} />} value={formatViews(property.views ?? 0)} label="VIEWS" />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

// ── Context menu ──────────────────────────────────────────────
function PropertyMenu({ onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-[#DDE5E3] rounded-xl shadow-lg overflow-hidden">
        {['View details', 'Edit', 'Mark as sold', 'Delete'].map((item) => (
          <button
            key={item}
            onClick={onClose}
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
