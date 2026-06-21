import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

/**
 * AuthLayout — minimal centered layout for login / signup / forgot-password pages.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left: brand panel */}
      <div className="hidden lg:flex w-1/2 bg-[#263238] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#496B5A] flex items-center justify-center text-white font-bold">
            N
          </div>
          <span className="text-white font-bold text-lg">Nexora RealtyOS</span>
        </div>

        <div>
          <blockquote className="text-white/80 text-xl font-medium leading-relaxed">
            "The complete operating system for modern real estate agencies."
          </blockquote>
          <p className="mt-4 text-white/40 text-sm">
            Manage listings, leads, agents, and deals — all in one place.
          </p>        </div>

        <p className="text-white/20 text-xs">© {new Date().getFullYear()} Nexora. All rights reserved.</p>
      </div>

      {/* Right: form area */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 bg-[#F8FAFA]">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="h-8 w-8 rounded-lg bg-[#496B5A] flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <span className="font-bold text-[#263238] text-base">Nexora RealtyOS</span>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}
