import { pocketbaseConfig } from '@/lib/pocketbase'

export type AuthUser = { id: string; email?: string; role?: 'user' | 'security' | 'admin' | 'vendor' | string }
export type UserRole = 'admin' | 'security' | 'vendor' | 'user'
const cookieName = 'sicaf_pb_token'

export async function authenticatePocketBase(email: string, password: string) {
  if (!pocketbaseConfig.isConfigured) throw new Error('PocketBase is not configured.')
  const response = await fetch(`${pocketbaseConfig.baseUrl}/api/collections/users/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Invalid email or password.')
  return response.json() as Promise<{ token: string; record: AuthUser }>
}

// Authenticate against PocketBase's internal _superusers collection (admin fallback).
// Superusers are accessed via the collections API like regular users.
export async function authenticateSuperuser(email: string, password: string) {
  if (!pocketbaseConfig.isConfigured) throw new Error('PocketBase is not configured.')

  const response = await fetch(`${pocketbaseConfig.baseUrl}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Superuser authentication failed:', errorData)
    throw new Error('Invalid email or password.')
  }

  const result = (await response.json()) as { token: string; record: AuthUser }

  return {
    token: result.token,
    record: {
      ...result.record,
      role: 'admin', // superusers are always treated as admin in this app
    },
  }
}

// Get session token from a Request object (works in both server and client contexts)
export function getSessionTokenFromRequest(request: Request): string {
  return request.headers.get('authorization') || request.headers.get('cookie')?.split(`${cookieName}=`)[1]?.split(';')[0] || ''
}

// Get session user using a token (token can come from cookie, header, or client-side storage)
export async function getSessionUser(token: string): Promise<AuthUser | null> {
  if (!token || !pocketbaseConfig.isConfigured) return null

  // Try the regular users collection first.
  let response = await fetch(`${pocketbaseConfig.baseUrl}/api/collections/users/auth-refresh`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (response.ok) {
    const data = (await response.json()) as { record: AuthUser }
    return data.record
  }

  // Fall back to the _superusers collection.
  response = await fetch(`${pocketbaseConfig.baseUrl}/api/collections/_superusers/auth-refresh`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (response.ok) {
    const data = (await response.json()) as { record: AuthUser }
    return { ...data.record, role: 'admin' }
  }

  return null
}

// Server-side version that uses cookies (only for Server Components)
export async function getSessionUserServer(): Promise<AuthUser | null> {
  // This function should only be called from Server Components
  // Import and use it only in server contexts
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName)?.value || ''
    return await getSessionUser(token)
  } catch (error) {
    // If called from client context, return null
    console.warn('getSessionUserServer called from non-server context')
    return null
  }
}

export async function requireAuth(token: string, allowedRoles?: UserRole[]): Promise<AuthUser> {
  const user = await getSessionUser(token)
  if (!user) throw new Error('Authentication required')
  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
  }
  return user
}

// Server-side version of requireAuth
export async function requireAuthServer(allowedRoles?: UserRole[]): Promise<AuthUser> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName)?.value || ''
    return await requireAuth(token, allowedRoles)
  } catch (error) {
    throw new Error('Authentication required')
  }
}

// API route authentication helper
export async function authenticateApiRequest(request: Request, allowedRoles?: UserRole[]) {
  const token = getSessionTokenFromRequest(request)
  
  if (!token || !pocketbaseConfig.isConfigured) {
    throw new Error('Authentication required')
  }

  // Try the regular users collection first.
  let response = await fetch(`${pocketbaseConfig.baseUrl}/api/collections/users/auth-refresh`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  let user: AuthUser

  if (response.ok) {
    user = ((await response.json()) as { record: AuthUser }).record
  } else {
    // Fall back to the _superusers collection.
    response = await fetch(`${pocketbaseConfig.baseUrl}/api/collections/_superusers/auth-refresh`, {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Invalid or expired session')
    }

    const data = (await response.json()) as { record: AuthUser }
    user = { ...data.record, role: 'admin' }
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
  }

  return { user, token }
}

export { cookieName }
