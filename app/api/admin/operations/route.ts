// import { NextResponse } from 'next/server'
// import { cookies } from 'next/headers'
// import { adminErrorMessage, getAdminOperations, requireAdmin } from '@/lib/admin'
// import { cookieName } from '@/lib/auth'

// export async function GET(request: Request) {
//   try {
//     const cookieStore = await cookies()
//     const token = cookieStore.get(cookieName)?.value || ''
//     // Create a new request with the token in the Authorization header
//     const authRequest = new Request(request, {
//       headers: new Headers({
//         ...Object.fromEntries(request.headers.entries()),
//         'Authorization': token
//       })
//     })
//     const { token: validatedToken } = await requireAdmin(authRequest)
//     return NextResponse.json(await getAdminOperations(validatedToken))
//   }
//   catch (error) { return NextResponse.json({ error: adminErrorMessage(error) }, { status: 403 }) }
// }


import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminErrorMessage, getAdminOperations } from '@/lib/admin'
import { cookieName, getSessionUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName)?.value || ''
    
    console.log('Admin operations - Token check:', {
      hasToken: !!token,
      tokenLength: token.length,
      cookieName: cookieName
    })
    
    if (!token) {
      console.log('Admin operations - No token found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getSessionUser(token)
    
    console.log('Admin operations - User check:', {
      hasUser: !!user,
      userRole: user?.role,
      userEmail: user?.email
    })
    
    if (!user || user.role !== 'admin') {
      console.log('Admin operations - Authorization failed')
      return NextResponse.json({ error: 'Administrator privileges required' }, { status: 403 })
    }

    return NextResponse.json(await getAdminOperations(token))
  }
  catch (error) { 
    console.error('Admin operations error:', error)
    return NextResponse.json({ error: adminErrorMessage(error) }, { status: 403 }) 
  }
}