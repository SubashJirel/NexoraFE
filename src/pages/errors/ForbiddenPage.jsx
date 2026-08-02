import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F8FAFA] p-6 text-center">
      <p className="text-8xl font-bold text-[#d5e3da]">403</p>
      <div>
        <h1 className="text-2xl font-bold text-[#263238]">Access denied</h1>
        <p className="mt-2 text-sm text-[#637079]">
          You don't have permission to view this page.
        </p>
      </div>
      <Link to="/dashboard">
        <Button variant="primary">Back to Dashboard</Button>
      </Link>
    </div>
  )
}
