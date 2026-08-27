import { NextResponse } from 'next/server'
import { createCheckoutRecords, getEvent } from '@/lib/pocketbase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const eventId = typeof body.eventId === 'string' ? body.eventId : ''
    const attendeeEmail = typeof body.attendeeEmail === 'string' ? body.attendeeEmail.trim().toLowerCase() : ''
    const reference = typeof body.reference === 'string' ? body.reference : ''
    const qrHash = typeof body.qrHash === 'string' ? body.qrHash : ''
    if (!eventId || !reference || !qrHash || !/^\S+@\S+\.\S+$/.test(attendeeEmail)) return NextResponse.json({ error: 'Please provide a valid booking request.' }, { status: 400 })
    const event = await getEvent(eventId)
    if (!event) return NextResponse.json({ error: 'This event is no longer available.' }, { status: 404 })
    const pricing = await createCheckoutRecords({ event, attendeeEmail, reference, qrHash })
    let emailStatus: 'delivered' | 'failed' = 'failed'
    try {
      const emailResponse = await fetch(new URL('/api/send-ticket-email', request.url), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, email: attendeeEmail, reference, qrHash, gross: pricing.gross }) })
      emailStatus = emailResponse.ok ? 'delivered' : 'failed'
    } catch (error) { console.error('[SICAF] Ticket email delivery failed after ticket creation', error) }
    return NextResponse.json({ event, attendeeEmail, emailStatus, ...pricing })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout service unavailable.' }, { status: 500 }) }
}
