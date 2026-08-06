import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { requestPasswordReset } from '@/services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return }

    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email.trim())
      setSent(true)
      toast.success('If the account exists, a reset link has been sent.')
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef3f0]">
          <Mail size={24} className="text-[#496B5A]" />
        </div>
        <h2 className="text-2xl font-bold text-[#263238]">Check your email</h2>
        <p className="mt-2 text-sm text-[#637079]">
          We sent a reset link to <strong>{email}</strong>
        </p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-[#496B5A] font-medium hover:underline">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#263238]">Reset your password</h2>
        <p className="mt-1.5 text-sm text-[#637079]">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@agency.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          error={error}
          leftAddon={<Mail size={16} />}
          autoFocus
        />
        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Send reset link
        </Button>
      </form>

      <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-[#637079] hover:text-[#496B5A]">
        <ArrowLeft size={14} /> Back to login
      </Link>
    </div>
  )
}
