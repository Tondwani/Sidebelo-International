import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminStats, getAuthenticatedUser } from '@/lib/pocketbase'
import { cookieName } from '@/lib/auth'
export async function GET(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(cookieName)?.value || ''
  const user = await getAuthenticatedUser(new Request(request, { headers: { authorization: token } }))
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  try { return NextResponse.json(await getAdminStats(token)) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load dashboard.' }, { status: 500 }) }
}
