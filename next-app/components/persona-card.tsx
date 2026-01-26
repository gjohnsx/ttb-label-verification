'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type PersonaCardProps = {
  name: string
  role: string
}

export function PersonaCard({ name, role }: PersonaCardProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'w-full p-6 bg-white border border-slate-200 rounded-lg text-left transition-all relative overflow-hidden',
        pending
          ? 'border-blue-500 shadow-md cursor-wait'
          : 'hover:border-blue-500 hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 transition-opacity',
          pending && 'opacity-60'
        )}
      >
        <div className="flex-1">
          <div className="font-semibold text-slate-900">{name}</div>
          <div className="text-sm text-slate-500">{role}</div>
        </div>
        {pending && (
          <Loader2 className="size-5 text-blue-600 animate-spin" />
        )}
      </div>
      {pending && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent animate-shimmer" />
      )}
    </button>
  )
}
