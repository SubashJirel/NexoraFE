import { Construction } from 'lucide-react'

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-8">
      <div className="h-16 w-16 rounded-2xl bg-[#eef3f0] flex items-center justify-center">
        <Construction size={28} className="text-[#496B5A]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#263238]">{title}</h2>
        <p className="mt-1 text-sm text-[#637079] max-w-xs">{description}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#496B5A] animate-pulse" />
        <span className="text-xs font-medium text-[#496B5A]">In development</span>
      </div>
    </div>
  )
}
