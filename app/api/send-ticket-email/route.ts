import { NextResponse } from 'next/server'
import { getEvent } from '@/lib/pocketbase'
import { sendTicketConfirmationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const event = await getEvent(typeof body.eventId === 'string' ? body.eventId : '')
    if (!event || !/^\S+@\S+\.\S+$/.test(email) || typeof body.reference !== 'string' || typeof body.qrHash !== 'string') return NextResponse.json({ error: 'Invalid ticket email request.' }, { status: 400 })
    return NextResponse.json(await sendTicketConfirmationEmail({ email, event, reference: body.reference, qrHash: body.qrHash, gross: Number(body.gross || 0) }))
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Email service unavailable.' }, { status: 500 }) }
}
