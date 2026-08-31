import { NextResponse } from 'next/server'
import { getSessionUserServer } from '@/lib/auth'
import { cookieName } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName)?.value || ''
    
    console.log('Session check:', {
      hasToken: !!token,
      tokenLength: token.length,
      cookieName: cookieName
    })
    
    const user = await getSessionUserServer()
    
    console.log('Session user:', {
      hasUser: !!user,
      userRole: user?.role,
      userEmail: user?.email
    })
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null }, { status: 401 })
  }
}