import { pocketbaseConfig, listPocketBaseRecords, type PocketBaseRecord } from '@/lib/pocketbase'

export type VendorStatus = 'pending' | 'approved' | 'paid' | 'rejected'
export type VendorCategory = 'traditional_food' | 'crafts' | 'beverage'
export type VendorRegistration = PocketBaseRecord & {
  reference: string
  vendor_name: string
  category: VendorCategory
  contact_name: string
  email: string
  phone: string
  status: VendorStatus
  fee_amount?: number
}

const baseUrl = pocketbaseConfig.baseUrl
const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }

export async function createVendorApplication(input: Omit<VendorRegistration, 'id' | 'status' | 'fee_amount'>) {
  if (!pocketbaseConfig.isConfigured) throw new Error('PocketBase is not configured. Add NEXT_PUBLIC_POCKETBASE_URL to enable applications.')
  const response = await fetch(`${baseUrl}/api/collections/vendor_registrations/records`, {
    method: 'POST', headers, body: JSON.stringify({ ...input, status: 'pending', fee_amount: null }),
  })
  if (!response.ok) throw new Error('Unable to submit your vendor application.')
  return response.json() as Promise<VendorRegistration>
}

export async function findVendorApplications(query: string) {
  if (!pocketbaseConfig.isConfigured) throw new Error('PocketBase is not configured.')
  const safe = query.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const filter = `reference="${safe}" || email="${safe.toLowerCase()}"`
  return listPocketBaseRecords<VendorRegistration>('vendor_registrations', `?filter=${encodeURIComponent(filter)}&perPage=20`)
}

export async function payVendorFee(vendor: VendorRegistration) {
  // This function is now handled by the Paystack integration
  // The actual payment flow is:
  // 1. Client calls /api/vendors/pay to initialize Paystack transaction
  // 2. User completes payment on Paystack
  // 3. Paystack redirects to /vendors/verify-payment
  // 4. Verification endpoint processes the payment and updates PocketBase
  
  if (!pocketbaseConfig.isConfigured) {
    throw new Error('PocketBase is not configured.')
  }
  
  const gross = Number(vendor.fee_amount || 0)
  if (vendor.status !== 'approved' || gross <= 0) {
    throw new Error('This application is not ready for payment.')
  }
  
  // This function is kept for backward compatibility but should not be called directly
  // Use the Paystack flow instead
  throw new Error('Please use the Paystack payment flow. Call /api/vendors/pay to initialize payment.')
}

// New function to update vendor status after successful payment verification
export async function markVendorAsPaid(vendorId: string, amount: number, reference: string) {
  if (!pocketbaseConfig.isConfigured) {
    throw new Error('PocketBase is not configured.')
  }
  
  const gateway_fee = Math.round(amount * 0.035 * 100) / 100
  const net = Math.round((amount - gateway_fee) * 100) / 100
  
  // Create transaction record
  const transaction = await fetch(`${baseUrl}/api/collections/transactions/records`, {
    method: 'POST', 
    headers, 
    body: JSON.stringify({ 
      vendor_registration: vendorId, 
      reference: reference, 
      status: 'successful', 
      gross: amount, 
      gateway_fee, 
      net, 
      type: 'vendor_stall_fee',
      paystack_reference: reference
    }),
  })
  
  if (!transaction.ok) {
    throw new Error('Payment verification succeeded, but the transaction could not be recorded.')
  }
  
  // Update vendor status
  const updated = await fetch(`${baseUrl}/api/collections/vendor_registrations/records/${vendorId}`, {
    method: 'PATCH', 
    headers, 
    body: JSON.stringify({ status: 'paid', fee_amount: amount }),
  })
  
  if (!updated.ok) {
    throw new Error('Transaction recorded, but the application status could not be updated.')
  }
  
  return updated.json() as Promise<VendorRegistration>
}

export function vendorStatusLabel(status: VendorStatus) {
  return { pending: 'Under review', approved: 'Approved', paid: 'Stall secured', rejected: 'Not approved' }[status]
}

export function vendorCategoryLabel(category: VendorCategory) {
  return { traditional_food: 'Traditional food', crafts: 'Crafts & handmade goods', beverage: 'Beverages' }[category]
}

export function formatVendorCurrency(value: number) { return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value) }
