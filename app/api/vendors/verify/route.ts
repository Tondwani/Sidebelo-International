import { NextResponse } from 'next/server'
import { pocketbaseConfig } from '@/lib/pocketbase'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify'

export async function GET(request: Request) {
  try {
    const reference = new URL(request.url).searchParams.get('reference')
    
    if (!reference) {
      return NextResponse.json({ error: 'Transaction reference is required.' }, { status: 400 })
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ 
        error: 'Payment verification system is not configured.' 
      }, { status: 503 })
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`${PAYSTACK_VERIFY_URL}/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json()
      console.error('Paystack verification error:', errorData)
      return NextResponse.json({ 
        error: 'Payment verification failed. Please contact support.' 
      }, { status: 500 })
    }

    const paystackData = await paystackResponse.json()
    
    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json({ 
        error: 'Payment was not successful.' 
      }, { status: 400 })
    }

    // Extract vendor information from metadata
    const metadata = paystackData.data.metadata
    const vendorId = metadata?.vendor_id
    const vendorReference = metadata?.vendor_reference
    const paymentType = metadata?.payment_type

    if (!vendorId || paymentType !== 'vendor_stall_fee') {
      return NextResponse.json({ 
        error: 'Invalid payment metadata.' 
      }, { status: 400 })
    }

    // Get current vendor status
    const vendorResponse = await fetch(
      `${pocketbaseConfig.baseUrl}/api/collections/vendor_registrations/records/${encodeURIComponent(vendorId)}`,
      { 
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store' 
      }
    )

    if (!vendorResponse.ok) {
      return NextResponse.json({ error: 'Vendor application not found.' }, { status: 404 })
    }

    const vendor = await vendorResponse.json()

    // Check if already paid to prevent duplicate processing
    if (vendor.status === 'paid') {
      return NextResponse.json({ 
        message: 'Payment already processed.',
        vendor: vendor
      })
    }

    // Calculate fees
    const amountPaid = paystackData.data.amount / 100 // Convert from kobo to Rands
    const gatewayFee = Math.round(amountPaid * 0.035 * 100) / 100
    const net = Math.round((amountPaid - gatewayFee) * 100) / 100

    // Create transaction record in PocketBase
    const transactionResponse = await fetch(
      `${pocketbaseConfig.baseUrl}/api/collections/transactions/records`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_registration: vendorId,
          reference: reference,
          status: 'successful',
          gross: amountPaid,
          gateway_fee: gatewayFee,
          net: net,
          type: 'vendor_stall_fee',
          paystack_reference: reference
        })
      }
    )

    if (!transactionResponse.ok) {
      console.error('Failed to create transaction record')
      return NextResponse.json({ 
        error: 'Payment verified but failed to record transaction.' 
      }, { status: 500 })
    }

    // Update vendor status to paid
    const updateResponse = await fetch(
      `${pocketbaseConfig.baseUrl}/api/collections/vendor_registrations/records/${vendorId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          fee_amount: amountPaid
        })
      }
    )

    if (!updateResponse.ok) {
      console.error('Failed to update vendor status')
      return NextResponse.json({ 
        error: 'Payment verified but failed to update vendor status.' 
      }, { status: 500 })
    }

    const updatedVendor = await updateResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Payment verified and vendor status updated successfully.',
      vendor: updatedVendor,
      transaction: await transactionResponse.json()
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Payment verification failed.' 
    }, { status: 500 })
  }
}