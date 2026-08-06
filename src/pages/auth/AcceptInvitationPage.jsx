import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import apiClient from '@/lib/axios'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function AcceptInvitationPage() {
  const [params] = useSearchParams(); const [password, setPassword] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false)
  async function submit(event) { event.preventDefault(); setBusy(true); try { await apiClient.post('/operations/invitation/accept/', { token: params.get('token'), password }); setDone(true); toast.success('Account created') } catch (error) { toast.error(error.response?.data?.detail || 'Unable to accept invitation') } finally { setBusy(false) } }
  if (done) return <Card className="w-full max-w-md text-center"><h1 className="text-2xl font-bold">Invitation accepted</h1><p className="mt-2 text-sm text-[#637079]">Your account is ready.</p><Link to="/login" className="mt-5 inline-block font-semibold text-[#496B5A]">Sign in</Link></Card>
  return <Card className="w-full max-w-md"><h1 className="text-2xl font-bold">Join your agency</h1><p className="mt-2 text-sm text-[#637079]">Set a secure password to accept this invitation.</p><form onSubmit={submit} className="mt-5 space-y-4"><Input label="Password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /><Button type="submit" fullWidth loading={busy}>Accept invitation</Button></form></Card>
}
