import { CreditCard, Mail } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function PaymentRequiredPage() {
  const { state } = useLocation()
  const checkoutUrl = import.meta.env.VITE_PAYMENT_URL?.trim()
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim()
  const agencyName = state?.agency?.name

  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2F2] text-[#496B5A]">
        <CreditCard size={22} />
      </div>
      <h2 className="text-2xl font-bold text-[#263238]">Complete your subscription</h2>
      <p className="mt-2 text-sm leading-6 text-[#637079]">
        {agencyName ? `${agencyName} is registered, but` : 'Your agency is registered, but'} access stays locked until payment is confirmed.
      </p>

      <div className="mt-6 space-y-3">
        {checkoutUrl ? (
          <a
            href={checkoutUrl}
            rel="noreferrer"
            target="_blank"
            className="flex h-11 w-full items-center justify-center rounded-lg bg-[#496B5A] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3a5649]"
          >
            Continue to secure payment
          </a>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-900">
            Online checkout is not configured yet. Contact the Nexora administrator to activate this agency.
          </div>
        )}

        {supportEmail && (
          <a
            href={`mailto:${supportEmail}?subject=${encodeURIComponent('Nexora agency activation')}`}
            className="flex items-center justify-center gap-2 text-sm font-medium text-[#496B5A] hover:underline"
          >
            <Mail size={15} />
            {supportEmail}
          </a>
        )}
      </div>

      <p className="mt-6 text-sm text-[#637079]">
        Already paid?{' '}
        <Link to="/login" className="font-medium text-[#496B5A] hover:underline">
          Try signing in again
        </Link>
      </p>
    </div>
  )
}
