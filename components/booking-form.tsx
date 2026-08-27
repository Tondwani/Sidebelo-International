'use client'

import { FormEvent, useState } from 'react'
import { ArrowUpRight, LoaderCircle, LockKeyhole } from 'lucide-react'
import type { EventRecord } from '@/lib/pocketbase'

export function BookingForm({ event }: { event: EventRecord }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address to receive your ticket.'); return }
    setLoading(true)
    try {
      // Initialize Paystack transaction
      const response = await fetch('/api/paystack/initialize', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ eventId: event.id, attendeeEmail: email }) 
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Payment initialization failed.')
      
      // Redirect to Paystack payment page
      if (result.authorization_url) {
        window.location.href = result.authorization_url
      } else {
        throw new Error('Payment authorization URL not received.')
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Payment initialization failed.'); setLoading(false) }
  }
  return <form onSubmit={submit} className="space-y-5" noValidate><div><label htmlFor="attendee-email" className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.16em]">Your email</label><input id="attendee-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-border bg-background px-4 py-4 outline-none ring-accent focus:ring-2" /><p className="mt-2 text-xs text-muted-foreground">Your digital ticket and booking reference will be shown after checkout.</p></div>{error && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 bg-primary px-5 py-4 font-bold text-primary-foreground disabled:opacity-60">{loading ? <><LoaderCircle className="size-4 animate-spin" /> Initializing payment...</> : <>Proceed to payment <ArrowUpRight className="size-4" /></>}</button><p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3" /> Secure payment via Paystack</p></form>
}
