import { getSessionUser, normalizeSessionToken } from './auth'
import { listPocketBaseRecords, pocketbaseConfig, type EventRecord, type PocketBaseRecord, type TicketRecord, type VendorRecord } from './pocketbase'

export type TransactionRecord = PocketBaseRecord & { gross?: number; status?: string; category?: string; cost_centre?: string }
export type AdminVendor = VendorRecord & { vendor_name?: string; category?: string; email?: string; reference?: string; fee_amount?: number }

export async function requireAdmin(request: Request) {
  const token = normalizeSessionToken(request.headers.get('authorization'))
  if (!pocketbaseConfig.isConfigured || !token) throw new Error('Administrator authentication required.')

  // Validate against both PocketBase auth collections. getSessionUser maps
  // _superusers records to the app's admin role.
  const user = await getSessionUser(token)
  if (!user) throw new Error('Administrator authentication required.')
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
