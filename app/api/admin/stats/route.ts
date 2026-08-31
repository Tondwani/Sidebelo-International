import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminStats } from '@/lib/pocketbase'
import { cookieName, getSessionUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName)?.value || ''
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getSessionUser(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
    }

    return NextResponse.json(await getAdminStats(token))
  } catch (error) { 
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load dashboard.' }, { status: 500 }) 
  }
}
