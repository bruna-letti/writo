'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Wrong password. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#0C2C47] tracking-tight">Writo</h1>
          <p className="mt-2 text-[#0C2C47]/50">Your daily language practice companion</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#0C2C47]/10 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0C2C47]/80 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#0C2C47]/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#97D3CD] transition"
              placeholder="Enter your password"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0C2C47] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#0C2C47]/90 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
