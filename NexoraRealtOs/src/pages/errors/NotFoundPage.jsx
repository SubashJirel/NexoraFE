import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F8FAFA] p-6 text-center">
      <p className="text-8xl font-bold text-[#d5e3da]">404</p>
      <div>
        <h1 className="text-2xl font-bold text-[#263238]">Page not found</h1>
        <p className="mt-2 text-sm text-[#637079]">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link to="/dashboard">
        <Button variant="primary">Go to Dashboard</Button>
      </Link>
    </div>
  )
}
