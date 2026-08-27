'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Check, CircleDollarSign, LoaderCircle, Plus, Search, Store, Ticket, TriangleAlert, X } from 'lucide-react'
import { BackNavigation } from '@/components/back-navigation'
import { formatCurrency } from '@/lib/pocketbase'

type Data = { events: any[]; tickets: any[]; vendors: any[]; transactions: any[] }
const budget = 4049000
const centres = ['Mammitlwa Festival', 'Culture & Dance Competitions', 'Protocol']

export function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<Data | null>(null); const [error, setError] = useState(''); const [query, setQuery] = useState(''); const [status, setStatus] = useState('all'); const [busy, setBusy] = useState('')
  const [loading, setLoading] = useState(true)
  
  const load = async () => { 
    try { 
      const r = await fetch('/api/admin/operations'); 
      const json = await r.json(); 
      if (!r.ok) { 
        if (r.status === 403) { 
          router.push('/login'); 
          return 
        } 
        throw new Error(json.error) 
      } 
      setData(json)
      setLoading(false)
    } catch (e) { 
      setError(e instanceof Error ? e.message : 'Unable to load dashboard.')
      setLoading(false)
    } 
  }
  
  useEffect(() => { load() }, [])
  
  const mutate = async (body: any) => { 
    setBusy(body.id || body.action); 
    try { 
      const r = await fetch('/api/admin/mutations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); 
      if (!r.ok) { 
        if (r.status === 403) { 
          router.push('/login'); 
          return 
        } 
        throw new Error((await r.json()).error) 
      } 
      await load() 
    } catch (e) { 
      setError(e instanceof Error ? e.message : 'Update failed.') 
    } finally { 
      setBusy('') 
    } 
  }
  
  const revenue = data?.transactions.filter((t) => t.status === 'successful').reduce((sum, t) => sum + Number(t.gross || 0), 0) || 0
  const tickets = data?.tickets.filter((t) => (!query || String(t.attendee_email || '').toLowerCase().includes(query.toLowerCase())) && (status === 'all' || t.status === status)) || []
  
  if (loading) return <main className="grid min-h-screen place-items-center bg-background p-6 text-center"><LoaderCircle className="size-8 animate-spin text-accent" /></main>
  
  if (error && !data) return <main className="grid min-h-screen place-items-center bg-background p-6 text-center"><div><TriangleAlert className="mx-auto size-10 text-accent" /><h1 className="mt-5 font-serif text-4xl">Admin access required</h1><p className="mt-3 text-muted-foreground">{error} Sign in with an administrator PocketBase account.</p><button onClick={() => router.push('/login')} className="mt-6 bg-accent px-6 py-3 font-bold text-accent-foreground">Go to login</button></div></main>
  if (!data) return <main className="grid min-h-screen place-items-center bg-background"><LoaderCircle className="size-8 animate-spin text-accent" /></main>
  return <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-10"><div className="mx-auto max-w-7xl space-y-8"><header className="flex flex-col gap-4 border-b border-border pb-7 md:flex-row md:items-end md:justify-between"><div><BackNavigation fallbackHref="/" label="Back to home" /><p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">SICAF 2026 · Control room</p><h1 className="mt-3 font-serif text-5xl text-balance">Festival operations</h1><p className="mt-3 text-muted-foreground">Manage the programme, vendors, ticket gates, and financial accountability.</p></div><a href="/" className="font-mono text-xs uppercase tracking-widest underline underline-offset-4">Public site</a></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[BarChart3,'Total events',data.events.length],[Ticket,'Tickets issued',data.tickets.filter(t=>t.status==='issued').length],[Store,'Vendor registrations',data.vendors.length],[CircleDollarSign,'Gross revenue',formatCurrency(revenue)]].map(([Icon,label,value]: any)=><article className="border border-border bg-card p-5" key={label}><Icon className="size-5 text-accent"/><p className="mt-7 font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 font-serif text-3xl">{value}</p></article>)}</section>
    <section className="grid gap-8 xl:grid-cols-[1.35fr_1fr]"><div className="border border-border bg-card p-5 sm:p-7"><div className="flex items-center justify-between"><h2 className="font-serif text-3xl">Vendor review</h2><span className="font-mono text-xs text-muted-foreground">{data.vendors.length} applications</span></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><tr><th className="pb-3">Vendor</th><th className="pb-3">Category</th><th className="pb-3">Status</th><th className="pb-3">Fee</th><th className="pb-3">Actions</th></tr></thead><tbody>{data.vendors.map(v=><tr className="border-b border-border/70" key={v.id}><td className="py-4"><strong>{v.vendor_name || 'Unnamed vendor'}</strong><span className="block text-xs text-muted-foreground">{v.email || 'No email'}</span></td><td className="py-4 text-muted-foreground">{String(v.category || '').replace('_',' ')}</td><td className="py-4"><span className="rounded-full bg-secondary px-2 py-1 text-xs capitalize">{v.status}</span></td><td className="py-4">{v.fee_amount ? formatCurrency(v.fee_amount) : 'Unassigned'}</td><td className="py-4"><div className="flex gap-2"><button aria-label="Approve vendor" disabled={busy===v.id} onClick={()=>mutate({action:'vendor',id:v.id,status:'approved',feeAmount:v.fee_amount || 500})} className="border border-border p-2 hover:bg-secondary"><Check className="size-4"/></button><button aria-label="Reject vendor" disabled={busy===v.id} onClick={()=>mutate({action:'vendor',id:v.id,status:'rejected',feeAmount:v.fee_amount || ''})} className="border border-border p-2 hover:bg-secondary"><X className="size-4"/></button></div></td></tr>)}</tbody></table></div></div>
    <div className="border border-border bg-primary p-5 text-primary-foreground sm:p-7"><h2 className="font-serif text-3xl">Budget tracker</h2><p className="mt-2 text-sm opacity-75">Successful transactions against the R4,049,000 target.</p><div className="mt-8 h-3 bg-primary-foreground/20"><div className="h-full bg-accent" style={{width:`${Math.min(100,revenue/budget*100)}%`}}/></div><div className="mt-3 flex justify-between font-mono text-xs"><span>{formatCurrency(revenue)} raised</span><span>{formatCurrency(budget)} target</span></div><div className="mt-10 space-y-4">{centres.map((centre)=><div className="flex items-center justify-between border-b border-primary-foreground/15 pb-3" key={centre}><span className="text-sm opacity-80">{centre}</span><span className="font-mono text-xs">Tracking live</span></div>)}</div></div></section>
    <section className="border border-border bg-card p-5 sm:p-7"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><h2 className="font-serif text-3xl">Ticket management</h2><div className="flex flex-col gap-2 sm:flex-row"><label className="flex items-center gap-2 border border-border px-3"><Search className="size-4 text-muted-foreground"/><span className="sr-only">Search attendee email</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Attendee email" className="bg-transparent py-2 text-sm outline-none"/></label><select value={status} onChange={e=>setStatus(e.target.value)} className="border border-border bg-card px-3 py-2 text-sm"><option value="all">All statuses</option><option value="issued">Issued</option><option value="checked_in">Checked in</option><option value="cancelled">Cancelled</option></select></div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><tr><th className="pb-3">Reference</th><th className="pb-3">Attendee</th><th className="pb-3">Status</th><th className="pb-3">Action</th></tr></thead><tbody>{tickets.map(t=><tr className="border-b border-border/70" key={t.id}><td className="py-4 font-mono text-xs">{t.reference}</td><td className="py-4">{t.attendee_email}</td><td className="py-4 capitalize">{String(t.status).replace('_',' ')}</td><td className="py-4">{t.status==='issued'&&<button onClick={()=>mutate({action:'ticket',id:t.id,status:'checked_in'})} className="font-mono text-xs uppercase text-accent underline">Check in</button>}</td></tr>)}</tbody></table></div></section>
    <section className="border border-border bg-card p-5 sm:p-7"><div className="flex items-center gap-3"><Plus className="size-5 text-accent"/><h2 className="font-serif text-3xl">Create festival event</h2></div><form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={e=>{e.preventDefault(); const f=new FormData(e.currentTarget); mutate({action:'event',title:f.get('title'),venue:f.get('venue'),capacity:f.get('capacity'),dateStart:f.get('dateStart')}); e.currentTarget.reset()}}><input name="title" required placeholder="Event title" className="border border-border bg-background px-4 py-3"/><input name="venue" required placeholder="Venue" className="border border-border bg-background px-4 py-3"/><input name="capacity" required type="number" min="1" placeholder="Capacity" className="border border-border bg-background px-4 py-3"/><input name="dateStart" required type="datetime-local" className="border border-border bg-background px-4 py-3"/><button className="bg-primary px-5 py-3 font-mono text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90 md:col-span-2">Create event</button></form></section>
  </div></main>
}