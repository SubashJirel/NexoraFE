import { Bell, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/cn'
import Avatar from '@/components/ui/Avatar'
import { useResource } from '@/hooks/useOperations'

export default function Topbar({ title }) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const notifications = useResource('notifications', {}, { refetchInterval: 30_000 })
  const unread = (notifications.data || []).filter((item) => !item.is_read).length

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

      {title && <h1 className="truncate text-base font-semibold text-[#263238]">{title}</h1>}

      <div className="flex-1" />

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
