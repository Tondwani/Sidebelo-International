'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CalendarDays, CheckCircle, Clock, MapPin, QrCode, Search, Ticket, X, XCircle } from 'lucide-react'
import { BackNavigation } from '@/components/back-navigation'
import { formatEventDate, formatEventTime, type TicketRecord, type EventRecord } from '@/lib/pocketbase'

type EnrichedTicket = TicketRecord & { eventDetails?: EventRecord }

interface TicketHistoryProps {
  userEmail?: string
}

export function TicketHistory({ userEmail }: TicketHistoryProps) {
  const [email, setEmail] = useState(userEmail || '')
  const [tickets, setTickets] = useState<EnrichedTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<EnrichedTicket | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Auto-search if user email is provided
  useEffect(() => {
    if (userEmail) {
      searchTickets(new Event('submit') as any)
    }
  }, [userEmail])

  const searchTickets = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError('Please enter a valid email address')
        setTickets([])
        return
      }

      const response = await fetch(`/api/tickets/my-tickets?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to retrieve tickets')
      }

      setTickets(data.tickets || [])
      
      if (data.tickets.length === 0) {
        setError('No tickets found for this email address')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to retrieve tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'checked_in':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued':
        return <Ticket className="size-4" />
      case 'checked_in':
        return <CheckCircle className="size-4" />
      case 'cancelled':
        return <XCircle className="size-4" />
      default:
        return <Clock className="size-4" />
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <BackNavigation fallbackHref="/#programme" label="Back to programme" />
          <div className="mt-6">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
              SICAF 2026 · Your Tickets
            </p>
            <h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">
              Your festival journey
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Look up your tickets by email to view your bookings, QR codes, and check-in status.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="mb-8 border border-border bg-card p-6 sm:p-8">
          <form onSubmit={searchTickets} className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="email" className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.16em]">
                Your email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-border bg-background px-4 py-3 outline-none ring-accent focus:ring-2"
                disabled={!!userEmail}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !!userEmail}
                className="bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Clock className="mr-2 inline size-4 animate-spin" /> Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 inline size-4" /> Find tickets
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && hasSearched && (
          <div className="mb-6 border border-destructive/40 bg-destructive/10 p-4 text-sm">
            {error}
          </div>
        )}

        {/* Tickets List */}
        {tickets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-border bg-card p-6 transition-all hover:border-accent/50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 sm:justify-start">
                      <div>
                        <h3 className="font-serif text-2xl text-primary">
                          {ticket.eventDetails?.title || 'Unknown Event'}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="size-4 text-accent" />
                            {ticket.eventDetails ? (
                              <>
                                {formatEventDate(ticket.eventDetails.date_start)} ·{' '}
                                {formatEventTime(ticket.eventDetails.date_start)}
                              </>
                            ) : (
                              'Date TBD'
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-accent" />
                            {ticket.eventDetails?.venue || 'Venue TBD'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase ${getStatusColor(ticket.status)}`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-border pt-4">
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reference:</span>
                          <span className="font-mono font-bold">{ticket.reference}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{ticket.attendee_email}</span>
                        </div>
                        {ticket.scanned_at && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Checked in:</span>
                            <span>{new Date(ticket.scanned_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="mt-4 flex items-center gap-2 bg-accent px-4 py-2 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90 sm:mt-0"
                  >
                    <QrCode className="size-4" />
                    View QR Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {hasSearched && tickets.length === 0 && !error && (
          <div className="border border-border bg-card p-12 text-center">
            <Ticket className="mx-auto size-16 text-muted-foreground" />
            <h3 className="mt-4 font-serif text-2xl">No tickets found</h3>
            <p className="mt-2 text-muted-foreground">
              We couldn't find any tickets for this email address. Check your email or try a different address.
            </p>
            <a
              href="/#programme"
              className="mt-6 inline-block bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Browse events
            </a>
          </div>
        )}

        {/* QR Code Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-md border border-border bg-background p-6 text-center">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl">Your QR Code</h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mb-4 border border-border bg-white p-4">
                <QRCodeSVG
                  value={selectedTicket.qr_hash}
                  size={200}
                  aria-label="Your SICAF ticket QR code"
                />
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-bold">{selectedTicket.eventDetails?.title}</p>
                <p className="text-muted-foreground">{selectedTicket.reference}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTicket.qr_hash.slice(0, 20)}...
                </p>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Present this QR code at the festival entrance for check-in.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}