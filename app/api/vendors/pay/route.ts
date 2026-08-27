import { NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth'
import { pocketbaseConfig } from '@/lib/pocketbase'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_API_URL = 'https://api.paystack.co/transaction/initialize'

export async function POST(request: Request) {
  try {
    // Require authentication for vendors
    const { user } = await authenticateApiRequest(request, ['vendor', 'admin'])
    
    const body = await request.json()
    const vendorId = typeof body.vendorId === 'string' ? body.vendorId : ''
    const amount = typeof body.amount === 'number' ? body.amount : 0
    
    if (!vendorId || amount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid payment request. Vendor ID and amount are required.' 
      }, { status: 400 })
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ 
        error: 'Payment system is not configured. Please contact support.' 
      }, { status: 503 })
    }

    // Get vendor details from PocketBase
    const vendorResponse = await fetch(
      `${pocketbaseConfig.baseUrl}/api/collections/vendor_registrations/records/${encodeURIComponent(vendorId)}`,
      { 
        headers: { 'Content-Type': 'application/json', Authorization: '' },
        cache: 'no-store' 
      }
    )

    if (!vendorResponse.ok) {
      return NextResponse.json({ error: 'Vendor application not found.' }, { status: 404 })
    }

    const vendor = await vendorResponse.json()

    // Validate vendor status
    if (vendor.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Payment can only be made for approved vendor applications.' 
      }, { status: 400 })
    }

    // Additional security: ensure user can only pay for their own vendor (unless admin)
    if (user.role !== 'admin' && vendor.email !== user.email) {
      return NextResponse.json({ 
        error: 'You can only pay for your own vendor application.' 
      }, { status: 403 })
    }

    // Convert amount to kobo (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(amount * 100)

    // Initialize Paystack transaction
    const paystackResponse = await fetch(PAYSTACK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: vendor.email,
        amount: amountInKobo,
        reference: `SICAF-VENDOR-${vendorId}-${Date.now()}`,
        metadata: {
          vendor_id: vendorId,
          vendor_reference: vendor.reference,
          payment_type: 'vendor_stall_fee',
          custom_fields: [
            {
              display_name: 'Vendor Name',
              variable_name: 'vendor_name',
              value: vendor.vendor_name
            },
            {
              display_name: 'Reference',
              variable_name: 'reference',
              value: vendor.reference
            }
          ]
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/vendors/verify-payment`
      })
    })

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json()
      console.error('Paystack initialization error:', errorData)
      return NextResponse.json({ 
        error: 'Payment initialization failed. Please try again.' 
      }, { status: 500 })
    }

    const paystackData = await paystackResponse.json()

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      access_code: paystackData.data.access_code
    })

  } catch (error) {
    console.error('Vendor payment initialization error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Payment initialization failed.' 
    }, { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 })
  }
}