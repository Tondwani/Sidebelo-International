export type PocketBaseRecord = {
  id: string
  created?: string
  updated?: string
  [key: string]: unknown
}

const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
export const pocketbaseConfig = { baseUrl, isConfigured: Boolean(process.env.NEXT_PUBLIC_POCKETBASE_URL) }
const jsonHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' }

export type EventRecord = PocketBaseRecord & { title: string; venue: string; capacity: number; date_start: string; price?: number }
export type TicketRecord = PocketBaseRecord & { event_id: string; attendee_email: string; reference: string; qr_hash: string; status: 'issued' | 'checked_in' | 'cancelled'; scanned_at?: string; scanned_by?: string }
export type VendorRecord = PocketBaseRecord & { status: 'pending' | 'approved' | 'paid' | 'rejected' }
export type TicketConfirmation = { reference: string; qrHash: string; attendeeEmail: string; event: EventRecord; gross: number; fee: number; net: number }

export const sicafSeedEvents: EventRecord[] = [
  { id: 'seed-opening', title: 'Opening Ceremony & Heritage Parade', venue: 'Sedibelo Civic Centre', capacity: 800, date_start: '2026-09-18T17:00:00', price: 180 },
  { id: 'seed-music', title: 'Mmino wa Rona: Voices of the Valley', venue: 'Main Festival Stage', capacity: 1200, date_start: '2026-09-19T19:00:00', price: 250 },
  { id: 'seed-market', title: 'Hands of Heritage Craft Market', venue: 'Arts Village', capacity: 500, date_start: '2026-09-20T10:00:00', price: 120 },
  { id: 'seed-closing', title: 'Closing Celebration & Community Feast', venue: 'Sedibelo Civic Centre', capacity: 900, date_start: '2026-09-20T18:00:00', price: 220 },
]

export async function listPocketBaseRecords<T extends PocketBaseRecord>(collection: string, params = '', token?: string): Promise<T[]> {
  const response = await fetch(`${baseUrl}/api/collections/${collection}/records${params}`, { headers: token ? { ...jsonHeaders, Authorization: token } : { Accept: 'application/json' }, cache: 'no-store' })
  if (!response.ok) throw new Error(`PocketBase returned ${response.status}`)
  return ((await response.json()).items || []) as T[]
}

export async function getEvents() {
  if (!pocketbaseConfig.isConfigured) return sicafSeedEvents
  try { const events = await listPocketBaseRecords<EventRecord>('events', '?sort=date_start'); return events.length ? events : sicafSeedEvents } catch { return sicafSeedEvents }
}

export async function getEvent(id: string) {
  const seeded = sicafSeedEvents.find((event) => event.id === id)
  if (seeded) return seeded
  if (!pocketbaseConfig.isConfigured) return null
  const response = await fetch(`${baseUrl}/api/collections/events/records/${encodeURIComponent(id)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' })
  return response.ok ? response.json() as Promise<EventRecord> : null
}

export async function createCheckoutRecords(data: { event: EventRecord; attendeeEmail: string; reference: string; qrHash: string }) {
  if (!pocketbaseConfig.isConfigured) throw new Error('PocketBase is not configured. Add NEXT_PUBLIC_POCKETBASE_URL to enable ticket persistence.')

  // Safeguard: Ensure events fetched from PocketBase have a valid price configured
  const eventPrice = Number(data.event.price)
  if (isNaN(eventPrice) || eventPrice <= 0) {
    throw new Error('This event does not have a valid ticket price configured. Please contact support.')
  }

  const gateway_fee = Math.round(eventPrice * 0.05)
  const net_yield = eventPrice
  const amount_gross = net_yield + gateway_fee
  const attendeeEmail = data.attendeeEmail.toLowerCase()

  // 1. Create the transaction
  const transactionResponse = await fetch(`${baseUrl}/api/collections/transactions/records`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      reference: data.reference,
      amount_gross,
      gateway_fee,
      net_yield,
      status: 'success',
    }),
  })

  if (!transactionResponse.ok) {
    const errText = await transactionResponse.text()
    console.error('Transaction error details:', errText)
    throw new Error('Unable to create the transaction in PocketBase.')
  }

  await transactionResponse.json()

  // 2. Create the ticket
  const ticketResponse = await fetch(`${baseUrl}/api/collections/tickets/records`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      event_id: data.event.id,
      attendee_email: attendeeEmail,
      qr_hash: data.qrHash,
      status: 'issued',
    }),
  })

  if (!ticketResponse.ok) {
    const errText = await ticketResponse.text()
    console.error('Ticket error details:', errText)
    throw new Error('Transaction was recorded, but the ticket could not be issued. Please contact the festival team with your reference number.')
  }

  return { gross: amount_gross, fee: gateway_fee, net: net_yield }
}

// Get authenticated user from Request object (works in both server and client contexts)
export async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get('authorization')
  if (!pocketbaseConfig.isConfigured || !authorization) return null

  let response = await fetch(`${baseUrl}/api/collections/users/auth-refresh`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: authorization },
    cache: 'no-store',
  })

  if (response.ok) {
    return (await response.json()).record as PocketBaseRecord & { role?: string; email?: string }
  }

  response = await fetch(`${baseUrl}/api/collections/_superusers/auth-refresh`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: authorization },
    cache: 'no-store',
  })

  if (response.ok) {
    const record = (await response.json()).record as PocketBaseRecord & { role?: string; email?: string }
    return { ...record, role: 'admin' }
  }

  return null
}

// Server-side version that uses cookies (only for Server Components)
export async function getAuthenticatedUserServer() {
  try {
    const { cookies } = await import('next/headers')
    const { cookieName } = await import('./auth')
    const authorization = cookies().get(cookieName)?.value || ''
    
    if (!pocketbaseConfig.isConfigured || !authorization) return null

    let response = await fetch(`${baseUrl}/api/collections/users/auth-refresh`, {
      method: 'POST',
      headers: { ...jsonHeaders, Authorization: authorization },
      cache: 'no-store',
    })

    if (response.ok) {
      return (await response.json()).record as PocketBaseRecord & { role?: string; email?: string }
    }

    response = await fetch(`${baseUrl}/api/collections/_superusers/auth-refresh`, {
      method: 'POST',
      headers: { ...jsonHeaders, Authorization: authorization },
      cache: 'no-store',
    })

    if (response.ok) {
      const record = (await response.json()).record as PocketBaseRecord & { role?: string; email?: string }
      return { ...record, role: 'admin' }
    }

    return null
  } catch (error) {
    // If called from client context, return null
    console.warn('getAuthenticatedUserServer called from non-server context')
    return null
  }
}

export async function getTicketByHash(hash: string, token: string) {
  const tickets = await listPocketBaseRecords<TicketRecord>('tickets', `?filter=${encodeURIComponent(`qr_hash="${hash}"`)}`, token)
  return tickets[0] || null
}

export async function getTicketsByEmail(email: string, token?: string): Promise<TicketRecord[]> {
  if (!pocketbaseConfig.isConfigured) return []
  const safeEmail = email.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const filter = `attendee_email="${safeEmail.toLowerCase()}"`
  return listPocketBaseRecords<TicketRecord>('tickets', `?filter=${encodeURIComponent(filter)}&sort=-created`, token)
}

export async function checkInTicket(ticket: TicketRecord, userId: string, token: string) {
  const response = await fetch(`${baseUrl}/api/collections/tickets/records/${ticket.id}`, { method: 'PATCH', headers: { ...jsonHeaders, Authorization: token }, body: JSON.stringify({ status: 'checked_in', scanned_at: new Date().toISOString(), scanned_by: userId }) })
  if (!response.ok) throw new Error('Unable to check in this ticket.')
  return response.json() as Promise<TicketRecord>
}

export async function getAdminStats(token: string) {
  const [events, tickets, transactions, vendors] = await Promise.all([
    listPocketBaseRecords<EventRecord>('events', '?perPage=1', token),
    listPocketBaseRecords<TicketRecord>('tickets', '?perPage=500', token),
    listPocketBaseRecords<PocketBaseRecord & { amount_gross?: number }>('transactions', '?perPage=500', token),
    listPocketBaseRecords<VendorRecord>('vendor_registrations', '?perPage=500', token),
  ])
  const vendorStatus = { pending: 0, approved: 0, paid: 0, rejected: 0 }
  vendors.forEach((vendor) => { if (vendor.status in vendorStatus) vendorStatus[vendor.status as keyof typeof vendorStatus]++ })
  return {
    eventCount: events.length,
    issuedTickets: tickets.filter((t) => t.status === 'issued').length,
    revenue: transactions.reduce((sum, t) => sum + Number(t.amount_gross || 0), 0),
    vendorStatus,
  }
}

export function formatEventDate(value: string) { return new Intl.DateTimeFormat('en-ZA', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date(value)) }
export function formatEventTime(value: string) { return new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
export function formatCurrency(value: number) { return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value) }