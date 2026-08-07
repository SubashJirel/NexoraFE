import { useEffect } from 'react'
import { Bell, CalendarDays, Languages, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/cn'
import Avatar from '@/components/ui/Avatar'
import { useResource } from '@/hooks/useOperations'
import { useCurrentAgency } from '@/hooks/useAgency'
import { useLocalization } from '@/context/useLocalization'

export default function Topbar({ title }) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const notifications = useResource('notifications', {}, { refetchInterval: 30_000 })
  const agency = useCurrentAgency()
  const localization = useLocalization()
  const { applyAgencyDefaults } = localization
  const unread = (notifications.data || []).filter((item) => !item.is_read).length
  useEffect(() => applyAgencyDefaults(agency.data), [agency.data, applyAgencyDefaults])

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-[100] flex h-[60px] items-center gap-4 border-b border-[#DDE5E3] bg-white/90 px-4 backdrop-blur-sm transition-[left] duration-300 sm:px-5',
        sidebarCollapsed ? 'lg:left-16' : 'lg:left-60'
      )}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#637079] transition-colors hover:bg-[#EEF2F2] lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {title && <h1 className="truncate text-base font-semibold text-[#263238]">{localization.t(title)}</h1>}

      <div className="flex-1" />

      <div className="flex items-center rounded-lg border border-[#DDE5E3] bg-white p-0.5">
        <button type="button" onClick={() => localization.setLanguage(localization.language === 'en' ? 'ne' : 'en')} className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-[#496B5A] hover:bg-[#eef3f0]" title="Switch interface language"><Languages size={13} />{localization.language === 'en' ? 'ने' : 'EN'}</button>
        <button type="button" onClick={() => localization.setDateSystem(localization.dateSystem === 'ad' ? 'bs' : 'ad')} className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-[#496B5A] hover:bg-[#eef3f0]" title="Switch date system"><CalendarDays size={13} />{localization.dateSystem.toUpperCase()}</button>
        <button type="button" onClick={() => localization.setNepaliDigits(!localization.nepaliDigits)} className="h-7 rounded-md px-2 text-[11px] font-semibold text-[#496B5A] hover:bg-[#eef3f0]" title="Toggle Nepali digits">{localization.nepaliDigits ? '१२३' : '123'}</button>
      </div>

      <Link to="/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#637079] hover:bg-[#EEF2F2]" aria-label={`${unread} unread notifications`}>
        <Bell size={18} />
        {unread > 0 && <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[9px] font-bold leading-4 text-white">{Math.min(unread, 99)}</span>}
      </Link>

      <div className="flex min-w-0 items-center gap-2.5" aria-label="Current user">
        <Avatar alt={user?.name || 'User'} src={user?.avatarUrl} size="sm" status="online" />
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-[#263238] sm:block">
          {user?.name || 'User'}
        </span>
      </div>
    </header>
  )
}
