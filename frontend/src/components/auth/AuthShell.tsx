import type { ReactNode } from 'react'

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5 pt-16">
      <div className="w-full max-w-md rounded-2xl border border-frost/10 bg-steel/30 p-8">
        <h1 className="text-2xl font-semibold text-frost">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-frost/55">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
