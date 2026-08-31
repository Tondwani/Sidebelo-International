'use client'

import { useState } from 'react'
import Link from 'next/link'

const categories = [{ value: 'traditional_food', label: 'Traditional food' }, { value: 'crafts', label: 'Crafts & handmade goods' },  { value: 'artists', label: 'artists' }, { value: 'beverage', label: 'Beverages' }]
const inputClass = 'w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'

export function VendorRegistrationForm() {
  const [form, setForm] = useState({ vendor_name: '', category: 'traditional_food', contact_name: '', email: '', phone: '' })
  const [state, setState] = useState<{ loading?: boolean; error?: string; reference?: string }>({})
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setState({ loading: true })
    try { const response = await fetch('/api/vendors/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setState({ reference: data.record.reference }) } catch (error) { setState({ error: error instanceof Error ? error.message : 'Unable to submit application.' }) }
  }
  if (state.reference) return <div className="border border-accent/50 bg-accent/10 p-8"><p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground">Application received</p><h2 className="mt-3 font-serif text-3xl text-primary">Your reference is {state.reference}</h2><p className="mt-3 text-muted-foreground">Keep this reference safe. We&apos;ll review your application and update your stall fee status.</p><Link className="mt-6 inline-flex bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" href="/vendors/portal">Track application</Link></div>
  return <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
    <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Business or stall name<input required className={inputClass} value={form.vendor_name} onChange={(e) => update('vendor_name', e.target.value)} /></label>
    <label className="grid gap-2 text-sm font-semibold">Trading category<select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-semibold">Contact person<input required className={inputClass} value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} /></label>
    <label className="grid gap-2 text-sm font-semibold">Email address<input required type="email" className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
    <label className="grid gap-2 text-sm font-semibold">Phone number<input required type="tel" className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} /></label>
    {state.error && <p role="alert" className="sm:col-span-2 text-sm text-destructive">{state.error}</p>}
    <button disabled={state.loading} className="bg-accent px-6 py-3 text-sm font-bold text-accent-foreground disabled:opacity-60 sm:col-span-2">{state.loading ? 'Submitting…' : 'Submit vendor application'}</button>
  </form>
}
