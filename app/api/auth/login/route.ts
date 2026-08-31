import { NextResponse } from 'next/server'
import { authenticatePocketBase, authenticateSuperuser, cookieName } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 })
    }

    const normalizedEmail = email.trim()
    let session

    // Try regular user authentication first
    try {
      session = await authenticatePocketBase(normalizedEmail, password)
      console.log('User authenticated via regular users collection:', {
        email: session.record.email,
        role: session.record.role,
        userId: session.record.id
      })
    } catch (usersError) {
      console.log('Regular authentication failed, trying superuser fallback', {
        error: usersError instanceof Error ? usersError.message : 'Unknown error'
      })
      
      // Fallback to superuser authentication for admin accounts
      try {
        session = await authenticateSuperuser(normalizedEmail, password)
        console.log('User authenticated via superusers collection:', {
          email: session.record.email,
          role: session.record.role,
          userId: session.record.id
        })
      } catch (superuserError) {
        console.error('Both authentication methods failed', {
          usersError: usersError instanceof Error ? usersError.message : 'Unknown error',
          superuserError: superuserError instanceof Error ? superuserError.message : 'Unknown error'
        })
        throw new Error('Invalid email or password.')
      }
    }

    const response = NextResponse.json({ user: session.record })
    response.cookies.set(cookieName, session.token, { 
      httpOnly: true, 
      secure: false, // Set to false for development
      sameSite: 'lax', 
      path: '/', 
      maxAge: 60 * 60 * 8 
    })
    
    console.log('Login successful - Cookie set:', {
      cookieName: cookieName,
      tokenLength: session.token.length,
      userEmail: session.record.email,
      userRole: session.record.role
    })
    
    return response
  } catch (error) { 
    console.error('Login error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to sign in.' }, { status: 401 }) 
  }
}
