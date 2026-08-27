'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatVendorCurrency, vendorCategoryLabel, vendorStatusLabel, type VendorRegistration } from '@/lib/vendor'

export function VendorPortal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<VendorRegistration[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('')

  // Fetch user session
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setUserEmail(data.user?.email || '')
          setUserRole(data.user?.role || '')
          setQuery(data.user?.email || '')
        }
      } catch (error) {
        console.error('Failed to fetch session:', error)
      }
    }
    fetchSession()
  }, [])

  // Check for payment success message
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setMessage('Payment successful! Your stall is now secured.')
      // Refresh the search results
      if (query) {
        search(new Event('submit') as any)
      }
    }
  }, [searchParams, query])

  // Auto-search if user email is provided
  useEffect(() => {
    if (userEmail) {
      search(new Event('submit') as any)
    }
  }, [userEmail])

  async function search(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch(`/api/vendors/portal?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error)
      }
      
      setRecords(data.records)
      
      if (!data.records.length) {
        setMessage('No application found. Check the reference or email and try again.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Search unavailable.')
    } finally {
      setLoading(false)
    }
  }

  async function initiatePayment(vendor: VendorRegistration) {
    setPaymentLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/vendors/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          amount: vendor.fee_amount || 500
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error)
      }
      
      // Redirect to Paystack checkout
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        throw new Error('Payment initialization failed')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment unavailable.')
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Application reference or email"
          required
          className="min-w-0 flex-1 border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
          placeholder="SICAF-V-… or your email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={!!userEmail}
        />
        <button
          disabled={loading || !!userEmail}
          className="bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          {loading ? 'Checking…' : 'Check status'}
        </button>
      </form>
      
      {message && (
        <p 
          role="status" 
          className={`border p-4 text-sm ${
            message.includes('successful') || message.includes('secured')
              ? 'border-green-500/50 bg-green-50 text-green-800'
              : 'border-border bg-secondary'
          }`}
        >
          {message}
        </p>
      )}
      
      <div className="grid gap-4">
        {records.map((vendor) => (
          <article key={vendor.id} className="border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {vendor.reference}
                </p>
                <h2 className="mt-1 font-serif text-2xl text-primary">
                  {vendor.vendor_name}
                </h2>
              </div>
              <span className="bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {vendorStatusLabel(vendor.status)}
              </span>
            </div>
            
            <p className="mt-4 text-sm text-muted-foreground">
              {vendorCategoryLabel(vendor.category)} · {vendor.email}
            </p>
            
            {vendor.status === 'approved' && Number(vendor.fee_amount) > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                <span className="font-bold text-primary">
                  Stall fee: {formatVendorCurrency(Number(vendor.fee_amount))}
                </span>
                <button
                  disabled={paymentLoading}
                  onClick={() => initiatePayment(vendor)}
                  className="bg-accent px-4 py-2 text-sm font-bold text-accent-foreground disabled:opacity-60"
                >
                  {paymentLoading ? 'Processing…' : 'Pay stall fee'}
                </button>
              </div>
            )}
            
            {vendor.status === 'paid' && (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-bold text-green-600">
                  ✓ Stall secured - Payment completed
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
