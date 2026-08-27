import { NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth'
import { getTicketsByEmail, getEvent, pocketbaseConfig } from '@/lib/pocketbase'

export async function GET(request: Request) {
  try {
    // Require authentication for all user roles
    const { user } = await authenticateApiRequest(request)
    
    const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase()
    
    // Allow users to search their own email, or admins to search any email
    if (user.role !== 'admin' && email && email !== user.email) {
      return NextResponse.json({ error: 'You can only view your own tickets.' }, { status: 403 })
    }
    
    // Use authenticated user's email if no email provided
    const searchEmail = email || user.email
    
    if (!searchEmail || !/^\S+@\S+\.\S+$/.test(searchEmail)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }

    if (!pocketbaseConfig.isConfigured) {
      return NextResponse.json({ error: 'Ticket lookup is not configured.' }, { status: 503 })
    }

    const tickets = await getTicketsByEmail(searchEmail)
    
    // Enrich tickets with event information
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await getEvent(ticket.event)
        return {
          ...ticket,
          eventDetails: event
        }
      })
    )

    return NextResponse.json({ tickets: enrichedTickets })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unable to retrieve tickets.' 
    }, { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 })
  }
}