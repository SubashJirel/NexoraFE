import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Building2, Hash } from 'lucide-react'
import { register } from '@/services/authService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const INITIAL_FORM = {
  full_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agency_name: '',
  license_number: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.full_name.trim())      e.full_name      = 'Full name is required'
    if (!form.email)                 e.email          = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)              e.password       = 'Password is required'
    else if (form.password.length < 8) e.password     = 'Minimum 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.agency_name.trim())    e.agency_name    = 'Agency name is required'
    if (!form.license_number.trim()) e.license_number = 'License number is required'
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

    try {
      const payload = {
        full_name:      form.full_name.trim(),
        email:          form.email.trim(),
        password:       form.password,
        agency_name:    form.agency_name.trim(),
        license_number: form.license_number.trim(),
      }
      const data = await register(payload)
      // data: { message, user, agency }
      // After register the user lands on login — they must sign in with their new credentials
      toast.success(data.message || 'Agency registered successfully.')
      navigate('/payment-required', {
        replace: true,
        state: {
          agency: data.agency,
          email: form.email.trim(),
          paymentStatus: data.agency?.payment_status,
        },
      })
    } catch (err) {
      // Surface the first field error or a generic message
      const serverErrors = err.response?.data
      if (serverErrors && typeof serverErrors === 'object') {
        // Map API field errors back to our form fields
        const mapped = {}
        for (const [field, msgs] of Object.entries(serverErrors)) {
          mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs
        }
        setErrors(mapped)
        // Show the first one as a toast too
        const first = Object.values(mapped)[0]
        if (first) toast.error(first)
      } else {
        toast.error('Registration failed. Please try again.')
      }
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
        <h2 className="text-2xl font-bold text-[#263238]">Register your agency</h2>
        <p className="mt-1.5 text-sm text-[#637079]">
          Create your Nexora account and get started in minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Personal info */}
        <Input
          label="Full name"
          type="text"
          placeholder="Sammy Doe"
          value={form.full_name}
          onChange={handleChange('full_name')}
          error={errors.full_name}
          leftAddon={<User size={16} />}
          autoComplete="name"
          autoFocus
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@agency.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          leftAddon={<Mail size={16} />}
          autoComplete="email"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
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
            autoComplete="new-password"
          />

          <Input
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            leftAddon={<Lock size={16} />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide' : 'Show'}
                className="text-[#8b969d] hover:text-[#496B5A] transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            autoComplete="new-password"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[#DDE5E3]" />
          <span className="text-xs text-[#8b969d] font-medium">Agency details</span>
          <span className="h-px flex-1 bg-[#DDE5E3]" />
        </div>

        <Input
          label="Agency name"
          type="text"
          placeholder="Nexora Realty"
          value={form.agency_name}
          onChange={handleChange('agency_name')}
          error={errors.agency_name}
          leftAddon={<Building2 size={16} />}
        />

        <Input
          label="License number"
          type="text"
          placeholder="NR-001"
          value={form.license_number}
          onChange={handleChange('license_number')}
          error={errors.license_number}
          leftAddon={<Hash size={16} />}
          hint="Your official real estate agency license number"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Create agency account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#637079]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#496B5A] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
