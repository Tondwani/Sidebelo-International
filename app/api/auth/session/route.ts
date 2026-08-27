import { NextResponse } from 'next/server'
import { getSessionUserServer } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getSessionUserServer()
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}