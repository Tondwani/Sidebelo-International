import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { pocketbaseConfig } from '@/lib/pocketbase'
import { adminErrorMessage, requireAdmin } from '@/lib/admin'
import { cookieName } from '@/lib/auth'

async function pb(path: string, init: RequestInit, token: string) {
  const response = await fetch(`${pocketbaseConfig.baseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: token, ...(init.headers || {}) } })
  if (!response.ok) throw new Error('PocketBase operation failed.')
  return response.json()
}
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName)?.value || ''
    // Create a new request with the token in the Authorization header
    const authRequest = new Request(request, {
      headers: new Headers({
        ...Object.fromEntries(request.headers.entries()),
        'Authorization': token
      })
    })
    const { token: validatedToken, user } = await requireAdmin(authRequest); const body = await request.json(); const action = body.action
    if (action === 'vendor') return NextResponse.json(await pb(`/api/collections/vendor_registrations/records/${encodeURIComponent(body.id)}`, { method: 'PATCH', body: JSON.stringify({ status: body.status, fee_amount: body.feeAmount === '' ? null : Number(body.feeAmount) }) }, validatedToken))
    if (action === 'event') return NextResponse.json(await pb('/api/collections/events/records', { method: 'POST', body: JSON.stringify({ title: body.title, venue: body.venue, capacity: Number(body.capacity), date_start: body.dateStart }) }, validatedToken))
    if (action === 'ticket') return NextResponse.json(await pb(`/api/collections/issued_tickets/records/${encodeURIComponent(body.id)}`, { method: 'PATCH', body: JSON.stringify({ status: body.status, scanned_by: user.id }) }, validatedToken))
    throw new Error('Unknown administration action.')
  } catch (error) { return NextResponse.json({ error: adminErrorMessage(error) }, { status: 403 }) }
}
