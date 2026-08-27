import { NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth'
import { findVendorApplications, type VendorRegistration } from '@/lib/vendor'

export async function GET(request: Request) {
  try {
    // Require authentication for vendor portal access
    const { user } = await authenticateApiRequest(request, ['vendor', 'admin'])
    
    const query = new URL(request.url).searchParams.get('q')?.trim() || ''
    
    if (!query) {
      return NextResponse.json({ error: 'Enter your application reference or email.' }, { status: 400 })
    }
    
    const records = await findVendorApplications(query)
    
    // Security: Vendors can only see their own applications unless they're admin
    if (user.role !== 'admin') {
      const filteredRecords = records.filter(record => record.email === user.email)
      return NextResponse.json({ records: filteredRecords })
    }
    
    return NextResponse.json({ records })
  } catch (error) { 
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unable to search applications.' 
    }, { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }) 
  }
}
