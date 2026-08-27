import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminErrorMessage, getAdminOperations, requireAdmin } from '@/lib/admin'
import { cookieName } from '@/lib/auth'

export async function GET(request: Request) {
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
    const { token: validatedToken } = await requireAdmin(authRequest)
    return NextResponse.json(await getAdminOperations(validatedToken))
  }
  catch (error) { return NextResponse.json({ error: adminErrorMessage(error) }, { status: 403 }) }
}
