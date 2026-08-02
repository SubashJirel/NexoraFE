import { useState, useMemo } from 'react'
import { Plus, FileText, LayoutGrid, List, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProperties } from '@/hooks/useProperties'
import PropertyCard from './components/PropertyCard'
import PropertyFilters from './components/PropertyFilters'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'

const EMPTY_FILTERS = {
  property_type:  '',
  status:         '',
  location:       '',
  assigned_agent: '',
}

export default function PropertiesPage() {
  const navigate = useNavigate()

  const [view, setView]     = useState('grid')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  // Build the params object that goes to the API.
  // search maps to the backend's `search` param.
  const queryParams = {
    ...filters,
    ...(search.trim() ? { search: search.trim() } : {}),
  }

  const { data: properties = [], isLoading, isError } = useProperties(queryParams)

  // ── Stats strip ───────────────────────────────────────────────────
  // Counts are derived from the unfiltered total; fetch without params.
  const { data: allProperties = [] } = useProperties({})
  const stats = useMemo(() => ({
    total:             allProperties.length,
    available:         allProperties.filter((p) => p.status === 'available').length,
    under_negotiation: allProperties.filter((p) => p.status === 'under_negotiation').length,
    sold:              allProperties.filter((p) => p.status === 'sold').length,
  }), [allProperties])

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#263238]">Properties</h2>
          <p className="mt-1 text-sm text-[#637079]">
            Manage and track your agency's property listings
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-[#DDE5E3] bg-white overflow-hidden">
            <ViewToggle active={view === 'grid'} onClick={() => setView('grid')} aria-label="Grid view">
              <LayoutGrid size={15} />
            </ViewToggle>
            <ViewToggle active={view === 'list'} onClick={() => setView('list')} aria-label="List view">
              <List size={15} />
            </ViewToggle>
          </div>

          <Button
            variant="outlined"
            size="md"
            leftIcon={<FileText size={15} />}
          >
            Export PDF
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={15} />}
            onClick={() => navigate('/properties/add')}
          >
            Add Property
          </Button>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Listings',    value: stats.total,             color: 'text-[#263238]' },
          { label: 'Available',         value: stats.available,         color: 'text-green-600' },
          { label: 'Under Negotiation', value: stats.under_negotiation, color: 'text-amber-600' },
          { label: 'Sold',              value: stats.sold,              color: 'text-red-500'   },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#DDE5E3] px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-[#637079] font-medium">{s.label}</span>
            <span className={cn('text-xl font-bold', s.color)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Search bar ──────────────────────────────────────── */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b969d] pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search properties by ID, title, or location..."
          className={cn(
            'w-full h-10 rounded-xl border border-[#DDE5E3] bg-white',
            'pl-10 pr-4 text-sm text-[#263238] placeholder:text-[#8b969d]',
            'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
            'transition-all duration-150'
          )}
        />
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <PropertyFilters filters={filters} onChange={setFilters} />

      {/* ── Content ─────────────────────────────────────────── */}
      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <ErrorState />
      ) : properties.length === 0 ? (
        <EmptyState onClear={() => { setSearch(''); setFilters(EMPTY_FILTERS) }} />
      ) : (
        <>
          <p className="text-xs text-[#8b969d]">
            Showing <span className="font-semibold text-[#263238]">{properties.length}</span> properties
          </p>

          {view === 'grid' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} view="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} view="list" />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function ViewToggle({ active, onClick, children, ...rest }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-2 text-sm transition-colors duration-150',
        active
          ? 'bg-[#496B5A] text-white'
          : 'text-[#637079] hover:bg-[#F8FAFA]'
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#eef3f0] flex items-center justify-center">
        <Search size={28} className="text-[#496B5A]" />
      </div>
      <div>
        <p className="text-base font-semibold text-[#263238]">No properties found</p>
        <p className="mt-1 text-sm text-[#637079]">Try adjusting your search or filters.</p>
      </div>
      <Button variant="outlined" size="sm" onClick={onClear}>Clear search & filters</Button>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <p className="text-base font-semibold text-[#263238]">Failed to load properties</p>
      <p className="text-sm text-[#637079]">Check your connection and try again.</p>
      <Button variant="outlined" size="sm" onClick={() => window.location.reload()}>Retry</Button>
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-[#DDE5E3] pt-8 pb-4">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {/* Brand */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#496B5A] flex items-center justify-center text-white font-bold text-xs">N</div>
            <span className="font-bold text-[#263238] text-sm">Nexora RealtyOS</span>
          </div>
          <p className="text-xs text-[#8b969d] leading-relaxed max-w-[220px]">
            Empowering Nepal's real estate professionals with a sophisticated, integrated business ecosystem designed for growth.
          </p>
          <p className="text-[10px] text-[#b2b9be]">© {new Date().getFullYear()} Nexora RealtyOS. All rights reserved.</p>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-xs font-semibold text-[#263238] mb-3">Quick Links</p>
          <ul className="space-y-2">
            {['Privacy Policy', 'Terms of Service', 'Support Center'].map((l) => (
              <li key={l}>
                <a href="#" className="text-xs text-[#637079] hover:text-[#496B5A] transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs font-semibold text-[#263238] mb-3">Contact</p>
          <ul className="space-y-2 text-xs text-[#637079]">
            <li>+977 9863594575</li>
            <li>support@nexora.com.np</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
