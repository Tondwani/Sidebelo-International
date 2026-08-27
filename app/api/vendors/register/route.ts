import { NextResponse } from 'next/server'
import { createVendorApplication, type VendorCategory } from '@/lib/vendor'

const emailPattern = /^\S+@\S+\.\S+$/
const categories = ['traditional_food', 'crafts', 'beverage'] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const vendor_name = typeof body.vendor_name === 'string' ? body.vendor_name.trim() : ''
    const contact_name = typeof body.contact_name === 'string' ? body.contact_name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const category = body.category as VendorCategory
    if (!vendor_name || !contact_name || !phone || !emailPattern.test(email) || !categories.includes(category)) return NextResponse.json({ error: 'Please complete every field with valid details.' }, { status: 400 })
    const reference = `SICAF-V-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const record = await createVendorApplication({ reference, vendor_name, contact_name, email, phone, category })
    return NextResponse.json({ record }, { status: 201 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to submit application.' }, { status: 500 }) }
}
