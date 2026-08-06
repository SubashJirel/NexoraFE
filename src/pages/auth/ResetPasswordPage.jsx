import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { confirmPasswordReset } from '@/services/authService'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const uid = params.get('uid') || ''
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (password.length < 8) nextErrors.password = 'Use at least eight characters.'
    if (password !== confirmation) nextErrors.confirmation = 'Passwords do not match.'
    if (!uid || !token) nextErrors.form = 'This reset link is incomplete.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    try {
      const data = await confirmPasswordReset({ uid, token, new_password: password })
      toast.success(data.message || 'Password reset successfully.')
      navigate('/login', { replace: true })
    } catch (requestError) {
      const response = requestError.response?.data
      setErrors({
        form: response?.detail || response?.new_password?.[0] || 'Could not reset your password.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#263238]">Choose a new password</h2>
      <p className="mt-2 text-sm text-[#637079]">Use a strong password you do not use elsewhere.</p>
      {errors.form && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => { setPassword(event.target.value); setErrors({}) }}
          error={errors.password}
          leftAddon={<Lock size={16} />}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => { setConfirmation(event.target.value); setErrors({}) }}
          error={errors.confirmation}
          leftAddon={<Lock size={16} />}
        />
        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Reset password
        </Button>
      </form>
      <Link to="/login" className="mt-6 block text-center text-sm font-medium text-[#496B5A] hover:underline">Back to login</Link>
    </div>
  )
}
