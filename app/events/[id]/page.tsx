import { notFound } from 'next/navigation'
import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import { BookingForm } from '@/components/booking-form'
import { BackNavigationServer } from '@/components/back-navigation'
import { formatEventDate, formatEventTime, getEvent } from '@/lib/pocketbase'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()
  return <main className="min-h-screen bg-background text-foreground"><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12"><BackNavigationServer href="/#programme" label="Back to programme" /><div className="grid gap-12 py-16 lg:grid-cols-[1fr_0.75fr] lg:items-start lg:py-24"><section><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">SICAF 2026 · Ticketed moment</p><h1 className="mt-5 max-w-3xl font-serif text-6xl leading-[0.92] tracking-[-0.05em] text-pretty sm:text-8xl">{event.title}</h1><div className="mt-10 grid gap-5 border-y border-border py-6 sm:grid-cols-2"><p className="flex items-center gap-3 text-sm"><CalendarDays className="size-5 text-accent" />{formatEventDate(event.date_start)} · {formatEventTime(event.date_start)}</p><p className="flex items-center gap-3 text-sm"><MapPin className="size-5 text-accent" />{event.venue}</p></div><p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">Join the shared pulse of the valley. Your ticket supports the artists, makers, and storytellers who make this gathering possible.</p></section><aside id="tickets" className="border border-border bg-card p-6 sm:p-8"><div className="mb-8 flex items-start justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">General admission</p><p className="mt-2 font-serif text-4xl">R{event.price || 0}</p></div><Ticket className="size-6 text-accent" /></div><BookingForm event={event} /></aside></div></div></main>
}
