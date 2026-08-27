import { NextResponse } from 'next/server'
import { createCheckoutRecords, getEvent } from '@/lib/pocketbase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'No reference provided.' }, { status: 400 })
    }

    // Verify transaction with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment gateway is not configured.' }, { status: 500 })
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    })

    const verifyData = await verifyResponse.json()

    if (!verifyResponse.ok || !verifyData.status) {
      console.error('Paystack verification failed:', verifyData)
      return NextResponse.redirect(new URL('/tickets/error?error=verification_failed', request.url))
    }

    const transaction = verifyData.data

    // Check if payment was successful
    if (transaction.status !== 'success') {
      return NextResponse.redirect(new URL('/tickets/error?error=payment_failed', request.url))
    }

    // Extract metadata from the transaction
    const metadata = transaction.metadata
    const eventId = metadata?.eventId
    const attendeeEmail = metadata?.attendeeEmail
    const eventPrice = metadata?.eventPrice

    if (!eventId || !attendeeEmail) {
      console.error('Invalid metadata in transaction:', metadata)
      return NextResponse.redirect(new URL('/tickets/error?error=invalid_metadata', request.url))
    }

    // Get event details
    const event = await getEvent(eventId)
    if (!event) {
      return NextResponse.redirect(new URL('/tickets/error?error=event_not_found', request.url))
    }

    // Generate QR hash for the ticket
    const qrHash = `${crypto.randomUUID()}-${crypto.getRandomValues(new Uint32Array(2)).join('')}`

    // Create checkout records in PocketBase
    try {
      const pricing = await createCheckoutRecords({
        event,
        attendeeEmail,
        reference,
        qrHash,
      })

      // Send ticket email
      let emailStatus: 'delivered' | 'failed' = 'failed'
      try {
        const emailResponse = await fetch(new URL('/api/send-ticket-email', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            email: attendeeEmail,
            reference,
            qrHash,
            gross: pricing.gross,
          }),
        })
        emailStatus = emailResponse.ok ? 'delivered' : 'failed'
      } catch (error) {
        console.error('[SICAF] Ticket email delivery failed after payment', error)
      }

      // Redirect to success page with ticket details
      const payload = btoa(JSON.stringify({
        event,
        attendeeEmail,
        emailStatus,
        reference,
        qrHash,
        ...pricing,
      }))

      return NextResponse.redirect(new URL(`/tickets/success?data=${encodeURIComponent(payload)}`, request.url))
    } catch (error) {
      console.error('Failed to create checkout records:', error)
      return NextResponse.redirect(new URL('/tickets/error?error=record_creation_failed', request.url))
    }
  } catch (error) {
    console.error('Paystack callback error:', error)
    return NextResponse.redirect(new URL('/tickets/error?error=callback_error', request.url))
  }
}