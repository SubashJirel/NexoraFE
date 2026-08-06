import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { resendLoginOTP, verifyLoginOTP } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export default function VerifyLoginOTPPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const email = location.state?.email || ''
  const password = location.state?.password || ''
  const destination = location.state?.from || '/dashboard'
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the six-digit code from your email.')
      return
    }
    setLoading(true)
    try {
      const data = await verifyLoginOTP({ email, otp })
      setAuth(data.user, data.access, data.refresh, data.agency)
      toast.success(data.message || 'Email verified.')
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'The code is invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email || !password) {
      toast.error('Please return to login and enter your credentials again.')
      return
    }
    setResending(true)
    try {
      const data = await resendLoginOTP({ email, password })
      toast.success(data.message || 'A new code was sent.')
    } catch (requestError) {
      toast.error(requestError.response?.data?.detail || 'Could not resend the code.')
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#263238]">Start from login</h2>
        <p className="mt-2 text-sm text-[#637079]">Your verification session is no longer available.</p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#496B5A] hover:underline">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#263238]">Verify your email</h2>
      <p className="mt-2 text-sm text-[#637079]">Enter the six-digit code sent to <strong>{email}</strong>.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <Input
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(event) => {
            setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
            setError('')
          }}
          error={error}
          leftAddon={<KeyRound size={16} />}
          autoFocus
        />
        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Verify and sign in
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/login" className="text-[#637079] hover:text-[#496B5A]">Back to login</Link>
        <button type="button" onClick={handleResend} disabled={resending} className="font-medium text-[#496B5A] disabled:opacity-50">
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </div>
  )
}
