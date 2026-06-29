import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
        <p className="text-slate-500 mb-6">Page not found.</p>
        <Link href="/" className="text-sm font-medium text-slate-700 underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
