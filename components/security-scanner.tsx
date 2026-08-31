'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LoaderCircle, ScanLine, ShieldAlert, AlertTriangle, XCircle } from 'lucide-react'
import type { TicketRecord } from '@/lib/pocketbase'
import { BackNavigation } from '@/components/back-navigation'

type ScannerState = 'idle' | 'valid' | 'already_used' | 'cancelled' | 'invalid' | 'success'

export function SecurityScanner() {
  const router = useRouter()
  const [hash, setHash] = useState('')
  const [ticket, setTicket] = useState<TicketRecord | null>(null)
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState('')
  const [scannerState, setScannerState] = useState<ScannerState>('idle')
  const [loading, setLoading] = useState(false)
  const [canCheckIn, setCanCheckIn] = useState(false)

  async function lookup(checkIn = false) {
    setLoading(true)
    setMessage('')
    setDetails('')
    setScannerState('idle')
    setCanCheckIn(false)
    
    try { 
      const response = await fetch('/api/security/check-in', { 
        method: checkIn ? 'PATCH' : 'GET', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',
        ...(checkIn ? { body: JSON.stringify({ qr_hash: hash }) } : {}) 
      }); 
      const data = await response.json(); 
      
      if (!response.ok) { 
        if (response.status === 403) { 
          router.push('/login'); 
          return 
        } 
        
        // Handle different error states
        if (data.error === 'Invalid Ticket') {
          setScannerState('invalid')
          setMessage(data.error)
          setDetails(data.details || 'Ticket not found in system.')
          setTicket(null)
        } else if (data.error === 'Warning: Ticket already used') {
          setScannerState('already_used')
          setMessage(data.error)
          setDetails(data.details || 'This ticket has already been scanned.')
          setTicket(data.ticket)
        } else if (data.error === 'Ticket Cancelled') {
          setScannerState('cancelled')
          setMessage(data.error)
          setDetails(data.details || 'This ticket has been cancelled.')
          setTicket(data.ticket)
        } else {
          throw new Error(data.error || 'Scanner error occurred.')
        }
      } else {
        // Success states
        if (checkIn) {
          setScannerState('success')
          setMessage(data.message || 'Ticket checked in successfully.')
          setTicket(data.ticket)
          setCanCheckIn(false)
        } else {
          setScannerState('valid')
          setMessage(data.message || 'Valid ticket found.')
          setDetails('Ready for check-in.')
          setTicket(data.ticket)
          setCanCheckIn(data.canCheckIn || false)
        }
      }
    } catch (error) { 
      setScannerState('invalid')
      setTicket(null)
      setMessage(error instanceof Error ? error.message : 'Scanner unavailable.')
      setDetails('Please try again or contact support.')
    } finally { 
      setLoading(false)
    }
  }

  const getStateIcon = () => {
    switch (scannerState) {
      case 'valid': return <CheckCircle2 className="size-6 text-green-600" />
      case 'already_used': return <AlertTriangle className="size-6 text-yellow-600" />
      case 'cancelled': return <XCircle className="size-6 text-red-600" />
      case 'invalid': return <XCircle className="size-6 text-red-600" />
      case 'success': return <CheckCircle2 className="size-6 text-green-600" />
      default: return null
    }
  }

  const getStateColor = () => {
    switch (scannerState) {
      case 'valid': return 'border-green-200 bg-green-50'
      case 'already_used': return 'border-yellow-200 bg-yellow-50'
      case 'cancelled': return 'border-red-200 bg-red-50'
      case 'invalid': return 'border-red-200 bg-red-50'
      case 'success': return 'border-green-200 bg-green-50'
      default: return 'border-border bg-muted'
    }
  }

  return (
    <main className="min-h-screen bg-primary px-5 py-8 text-primary-foreground sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-6">
          <div>
            <BackNavigation fallbackHref="/" label="Back to home" className="text-primary-foreground hover:opacity-70 mb-4" />
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">SICAF 2026 · Gate Operations</p>
            <h1 className="mt-3 font-serif text-4xl">Security check-in</h1>
          </div>
          <ShieldAlert className="size-8 text-accent" />
        </div>

        <section className="mt-8 bg-background p-6 text-foreground sm:p-10">
          <div className="flex items-center gap-3">
            <ScanLine className="size-5 text-accent" />
            <h2 className="text-xl font-bold">Scan a ticket</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste the QR hash from the attendee&apos;s digital ticket or connect this field to a camera scanner.
          </p>
          
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input 
              value={hash} 
              onChange={(e) => setHash(e.target.value)} 
              placeholder="QR hash" 
              className="min-h-12 flex-1 border border-border bg-background px-4 font-mono text-sm outline-none focus:ring-2 focus:ring-accent"
            />
            <button 
              onClick={() => lookup()} 
              disabled={loading || !hash} 
              className="bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50"
            >
              {loading ? <LoaderCircle className="mx-auto size-5 animate-spin" /> : 'Verify ticket'}
            </button>
          </div>

          {message && (
            <div className={`mt-5 border p-4 text-sm ${getStateColor()}`}>
              <div className="flex items-start gap-3">
                {getStateIcon()}
                <div className="flex-1">
                  <p className="font-bold">{message}</p>
                  {details && <p className="mt-1 text-muted-foreground">{details}</p>}
                </div>
              </div>
            </div>
          )}

          {ticket && (
            <div className="mt-6 border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{ticket.reference}</p>
                  <p className="mt-2 font-bold">{ticket.attendee_email}</p>
                  {ticket.scanned_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Scanned: {new Date(ticket.scanned_at).toLocaleString()}
                    </p>
                  )}
                  {ticket.scanned_by && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Scanned by: {ticket.scanned_by}
                    </p>
                  )}
                </div>
                <span className={`border px-3 py-1 font-mono text-xs uppercase ${
                  ticket.status === 'issued' ? 'border-green-600 text-green-600' :
                  ticket.status === 'checked_in' ? 'border-blue-600 text-blue-600' :
                  'border-red-600 text-red-600'
                }`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              
              {canCheckIn && scannerState === 'valid' && (
                <button 
                  onClick={() => lookup(true)} 
                  disabled={loading} 
                  className="mt-5 flex items-center gap-2 bg-accent px-5 py-3 font-bold text-accent-foreground disabled:opacity-50"
                >
                  {loading ? <LoaderCircle className="size-4 animate-spin" /> : 'Check in ticket'}
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}