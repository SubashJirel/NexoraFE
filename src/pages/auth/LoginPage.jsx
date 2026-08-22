import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { login } from '@/services/authService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const from = location.state?.from?.pathname || '/dashboard'

  function validate() {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)
    const normalizedEmail = form.email.trim().toLowerCase()

    try {
      const data = await login({ email: normalizedEmail, password: form.password })
      // data: { message, access, refresh, user, agency }
      setAuth(data.user, data.access, data.refresh, data.agency)
      toast.success(data.message || 'Welcome back!')
      const destination = data.next_route === '/onboarding/website' ? data.next_route : from
      navigate(destination, { replace: true })
    } catch (err) {
      if (err.response?.data?.payment_required) {
        navigate('/payment-required', {
          state: {
            agency: err.response.data.agency,
            email: normalizedEmail,
            paymentStatus: err.response.data.payment_status,
          },
        })
        return
      }
      if (err.response?.data?.otp_required) {
        navigate('/verify-login-otp', {
          state: {
            email: err.response.data.email || form.email,
            password: form.password,
            from,
          },
        })
        return
      }
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.message ||
        'Invalid email or password'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      if (errors[field]) setErrors((err) => ({ ...err, [field]: '' }))
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#263238]">Welcome back</h2>
        <p className="mt-1.5 text-sm text-[#637079]">Sign in to your Nexora account</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@agency.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          leftAddon={<Mail size={16} />}
          autoComplete="email"
          autoFocus
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange('password')}
          error={errors.password}
          leftAddon={<Lock size={16} />}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-[#8b969d] hover:text-[#496B5A] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-[#496B5A] hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#637079]">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#496B5A] font-medium hover:underline">
          Register your agency
        </Link>
      </p>
    </div>
  )
}
