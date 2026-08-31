'use client'
import { FormEvent, useState } from 'react'
import { BackNavigation } from '@/components/back-navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to sign in.')
      }

      // Role-based redirection
      const role = data.user?.role || 'user'
      let destination = '/'

      switch (role) {
        case 'admin':
          destination = '/admin/dashboard'
          break
        case 'security':
          destination = '/security/scanner'
          break
        case 'vendor':
          destination = '/vendors/portal'
          break
        case 'user':
          destination = '/tickets/my-tickets'
          break
        default:
          destination = '/tickets/my-tickets'
          break
      }

      console.log('Login successful. Role:', role, 'Redirecting to:', destination)
      
      // Use window.location.href for more reliable navigation after auth
      window.location.href = destination
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-primary px-5 py-12 text-primary-foreground">
      <div className="mx-auto max-w-md">
        <BackNavigation fallbackHref="/" label="Back to home" className="text-primary-foreground hover:text-accent" />
        <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
          Ngwao Lempe · SICAF 2026
        </p>
        <h1 className="mt-5 font-serif text-5xl">Welcome back.</h1>
        <p className="mt-3 text-primary-foreground/70">
          Sign in to manage tickets, applications, or gate access.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5 bg-background p-6 text-foreground sm:p-8">
          <label className="block text-sm font-bold">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 min-h-12 w-full border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="block text-sm font-bold">
            Password
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 min-h-12 w-full border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          {error && <p role="alert" className="border border-destructive p-3 text-sm">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-accent px-5 py-3 font-bold text-accent-foreground disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
