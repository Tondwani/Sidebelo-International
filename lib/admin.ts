import { listPocketBaseRecords, pocketbaseConfig, type EventRecord, type PocketBaseRecord, type TicketRecord, type VendorRecord } from './pocketbase'

export type TransactionRecord = PocketBaseRecord & { gross?: number; status?: string; category?: string; cost_centre?: string }
export type AdminVendor = VendorRecord & { vendor_name?: string; category?: string; email?: string; reference?: string; fee_amount?: number }

export async function requireAdmin(request: Request) {
  const token = request.headers.get('authorization')
  if (!pocketbaseConfig.isConfigured || !token) throw new Error('Administrator authentication required.')
  
  // Try regular user refresh first
  let response = await fetch(`${pocketbaseConfig.baseUrl}/api/collections/users/auth-refresh`, { 
    method: 'POST', 
    headers: { Authorization: token, Accept: 'application/json' }, 
    cache: 'no-store' 
  })
  
  let user: { id: string; role?: string }
  
  // If regular refresh fails, try admin refresh
  if (!response.ok) {
    response = await fetch(`${pocketbaseConfig.baseUrl}/api/admins/auth-refresh`, { 
      method: 'POST', 
      headers: { Authorization: token, Accept: 'application/json' }, 
      cache: 'no-store' 
    })
    
    if (!response.ok) throw new Error('Administrator authentication required.')
    
    const adminData = await response.json() as { admin: { id: string; role?: string } }
    user = adminData.admin
    // Ensure superusers have admin role
    user.role = 'admin'
  } else {
    user = (await response.json()).record as { id: string; role?: string }
  }
  
  if (user.role !== 'admin') throw new Error('Administrator privileges required.')
  return { token, user }
}

export async function getAdminOperations(token: string) {
  const [events, tickets, vendors, transactions] = await Promise.all([
    listPocketBaseRecords<EventRecord>('events', '?perPage=500&sort=-date_start', token),
    listPocketBaseRecords<TicketRecord>('issued_tickets', '?perPage=500&sort=-created', token),
    listPocketBaseRecords<AdminVendor>('vendor_registrations', '?perPage=500&sort=-created', token),
    listPocketBaseRecords<TransactionRecord>('transactions', '?perPage=500&sort=-created', token),
  ])
  return { events, tickets, vendors, transactions }
}

export function adminErrorMessage(error: unknown) { return error instanceof Error ? error.message : 'Unable to load administration data.' }
