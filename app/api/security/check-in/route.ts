import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkInTicket, getTicketByHash, pocketbaseConfig } from '@/lib/pocketbase'
import { cookieName, authenticateApiRequest } from '@/lib/auth'

async function getToken(request: Request): Promise<string> {
  // Try authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader) return authHeader
  
  // Fall back to cookie
  try {
    const cookieStore = await cookies()
    return cookieStore.get(cookieName)?.value || ''
  } catch {
    // If cookies() fails (client context), return empty
    return ''
  }
}

export async function GET(request: Request) {
  try {
    const { user } = await authenticateApiRequest(request, ['security', 'admin'])
    const hash = new URL(request.url).searchParams.get('qr_hash')?.trim()
    if (!hash) return NextResponse.json({ error: 'Enter a QR hash.' }, { status: 400 })
    if (!pocketbaseConfig.isConfigured) return NextResponse.json({ error: 'PocketBase is not configured.' }, { status: 503 })
    
    const token = await getToken(request)
    const ticket = await getTicketByHash(hash, token)
    
    if (!ticket) {
      return NextResponse.json({ error: 'Invalid Ticket', details: 'Ticket not found in system.' }, { status: 404 })
    }
    
    // Validation checks
    if (ticket.status === 'checked_in') {
      const scannedTime = ticket.scanned_at ? new Date(ticket.scanned_at).toLocaleString() : 'unknown time'
      return NextResponse.json({ 
        error: 'Warning: Ticket already used', 
        details: `Ticket was checked in at ${scannedTime}`,
        ticket,
        canCheckIn: false
      }, { status: 409 })
    }
    
    if (ticket.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Ticket Cancelled', 
        details: 'This ticket has been cancelled and is no longer valid.',
        ticket,
        canCheckIn: false
      }, { status: 409 })
    }
    
    // Valid ticket that can be checked in
    return NextResponse.json({ 
      ticket, 
      message: 'Valid ticket found. Ready for check-in.',
      canCheckIn: true
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Security access required.' }, { status: 403 })
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Scanner error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, token } = await authenticateApiRequest(request, ['security', 'admin'])
    const body = await request.json()
    const hash = typeof body.qr_hash === 'string' ? body.qr_hash.trim() : ''
    
    if (!hash) return NextResponse.json({ error: 'Enter a QR hash.' }, { status: 400 })
    
    const ticket = await getTicketByHash(hash, token)
    
    if (!ticket) {
      return NextResponse.json({ error: 'Invalid Ticket', details: 'Ticket not found in system.' }, { status: 404 })
    }
    
    // Validation checks before check-in
    if (ticket.status === 'checked_in') {
      const scannedTime = ticket.scanned_at ? new Date(ticket.scanned_at).toLocaleString() : 'unknown time'
      return NextResponse.json({ 
        error: 'Warning: Ticket already used', 
        details: `Ticket was checked in at ${scannedTime}`,
        ticket,
        canCheckIn: false
      }, { status: 409 })
    }
    
    if (ticket.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Ticket Cancelled', 
        details: 'This ticket has been cancelled and is no longer valid.',
        ticket,
        canCheckIn: false
      }, { status: 409 })
    }
    
    if (ticket.status !== 'issued') {
      return NextResponse.json({ 
        error: 'Invalid Ticket Status', 
        details: `Ticket has unexpected status: ${ticket.status}`,
        ticket,
        canCheckIn: false
      }, { status: 409 })
    }
    
    // Perform check-in
    return NextResponse.json({ 
      ticket: await checkInTicket(ticket, user.id, token),
      message: 'Ticket checked in successfully.',
      canCheckIn: false
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Security access required.' }, { status: 403 })
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Scanner error' }, { status: 500 })
  }
}
