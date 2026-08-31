import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { pocketbaseConfig } from '@/lib/pocketbase'
import { adminErrorMessage } from '@/lib/admin'
import { cookieName, getSessionUser } from '@/lib/auth'

async function pb(path: string, init: RequestInit, token: string) {
  const response = await fetch(`${pocketbaseConfig.baseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: token, ...(init.headers || {}) } })
  if (!response.ok) throw new Error('PocketBase operation failed.')
  return response.json()
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName)?.value || ''
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getSessionUser(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Administrator privileges required' }, { status: 403 })
    }

    const body = await request.json()
    const action = body.action
    
    if (action === 'vendor') {
      return NextResponse.json(await pb(`/api/collections/vendor_registrations/records/${encodeURIComponent(body.id)}`, { method: 'PATCH', body: JSON.stringify({ status: body.status, fee_amount: body.feeAmount === '' ? null : Number(body.feeAmount) }) }, token))
    }
    
    if (action === 'event') {
      return NextResponse.json(await pb('/api/collections/events/records', { method: 'POST', body: JSON.stringify({ title: body.title, venue: body.venue, capacity: Number(body.capacity), date_start: body.dateStart }) }, token))
    }
    
    if (action === 'ticket') {
      return NextResponse.json(await pb(`/api/collections/tickets/records/${encodeURIComponent(body.id)}`, { method: 'PATCH', body: JSON.stringify({ status: body.status, scanned_by: user.id }) }, token))
    }
    
    throw new Error('Unknown administration action.')
  } catch (error) { 
    return NextResponse.json({ error: adminErrorMessage(error) }, { status: 403 }) 
  }
}
