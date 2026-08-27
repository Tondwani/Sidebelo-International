import { NextResponse } from 'next/server'
import { createCheckoutRecords, getEvent } from '@/lib/pocketbase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided.' }, { status: 400 })
    }

    // Verify webhook signature
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment gateway is not configured.' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle successful payment event
    if (event.event === 'charge.success') {
      const transactionData = event.data
      const reference = transactionData.reference
      const metadata = transactionData.metadata

      // Check if we've already processed this transaction (idempotency)
      // In production, you might want to check your database for existing records
      // For now, we'll rely on the callback flow to handle the actual record creation

      console.log(`Webhook received for successful payment: ${reference}`)
      // You could add additional logic here, such as updating analytics or sending notifications
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 })
  }
}