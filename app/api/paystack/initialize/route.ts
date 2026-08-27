import { NextResponse } from 'next/server'
import { getEvent } from '@/lib/pocketbase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const eventId = typeof body.eventId === 'string' ? body.eventId : ''
    const attendeeEmail = typeof body.attendeeEmail === 'string' ? body.attendeeEmail.trim().toLowerCase() : ''
    
    if (!eventId || !/^\S+@\S+\.\S+$/.test(attendeeEmail)) {
      return NextResponse.json({ error: 'Please provide a valid booking request.' }, { status: 400 })
    }

    const event = await getEvent(eventId)
    if (!event) {
      return NextResponse.json({ error: 'This event is no longer available.' }, { status: 404 })
    }

    const eventPrice = Number(event.price)
    if (isNaN(eventPrice) || eventPrice <= 0) {
      return NextResponse.json({ error: 'This event does not have a valid ticket price configured.' }, { status: 400 })
    }

    // Calculate fees (5% gateway fee)
    const gatewayFee = Math.round(eventPrice * 0.05)
    const amountGross = eventPrice + gatewayFee
    const amountInKobo = Math.round(amountGross * 100) // Paystack expects amount in kobo

    // Generate reference for tracking
    const reference = `SICAF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

    // Paystack secret key from environment
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment gateway is not configured.' }, { status: 500 })
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: attendeeEmail,
        amount: amountInKobo,
        reference: reference,
        metadata: {
          eventId: event.id,
          eventName: event.title,
          eventPrice: eventPrice,
          attendeeEmail: attendeeEmail,
          custom_fields: [
            {
              display_name: 'Event',
              variable_name: 'event',
              value: event.title
            }
          ]
        },
        callback_url: `${new URL('/api/paystack/callback', request.url).toString()}`,
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack initialization failed:', paystackData)
      return NextResponse.json({ error: 'Unable to initialize payment. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      access_code: paystackData.data.access_code,
    })
  } catch (error) {
    console.error('Paystack initialization error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Payment service unavailable.' }, { status: 500 })
  }
}