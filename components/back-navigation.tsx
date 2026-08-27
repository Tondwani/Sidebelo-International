'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BackNavigationProps {
  className?: string
  fallbackHref?: string
  label?: string
}

// Client-side helper function to determine back navigation
function getBackDestination(currentPath: string, userRole?: string | null): string {
  // Route-based back navigation logic
  if (currentPath.startsWith('/admin')) {
    return '/admin/dashboard'
  } else if (currentPath.startsWith('/security')) {
    return '/security/scanner'
  } else if (currentPath.startsWith('/vendors')) {
    return '/vendors/portal'
  } else if (currentPath.startsWith('/tickets')) {
    // For ticket pages, base it on user role
    if (userRole === 'admin') {
      return '/admin/dashboard'
    } else if (userRole === 'security') {
      return '/security/scanner'
    } else if (userRole === 'vendor') {
      return '/vendors/portal'
    } else {
      return '/tickets/my-tickets'
    }
  } else if (currentPath.startsWith('/events')) {
    // Event pages typically go back to home/programme
    return '/#programme'
  } else if (currentPath === '/login') {
    return '/'
  }
  
  // Default fallback
  return '/'
}

export function BackNavigation({ className = '', fallbackHref = '/', label = 'Back' }: BackNavigationProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [backHref, setBackHref] = useState<string>(fallbackHref)

  useEffect(() => {
    // Function to get user role from session
    async function fetchUserRole() {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.user?.role || null)
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error)
      }
    }

    fetchUserRole()
  }, [])

  useEffect(() => {
    // Use the client-side helper function to determine back navigation
    const determinedHref = getBackDestination(pathname, userRole) || fallbackHref
    setBackHref(determinedHref)
  }, [pathname, userRole, fallbackHref])

  return (
    <Link 
      href={backHref} 
      className={`inline-flex items-center gap-2 text-sm font-bold hover:opacity-70 transition-opacity ${className}`}
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  )
}

// Server-side version for pages that can determine the back link during SSR
export function BackNavigationServer({ href, className = '', label = 'Back' }: { href: string; className?: string; label?: string }) {
  return (
    <Link 
      href={href} 
      className={`inline-flex items-center gap-2 text-sm font-bold hover:opacity-70 transition-opacity ${className}`}
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  )
}