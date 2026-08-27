import { formatEventDate, formatEventTime, type EventRecord } from '@/lib/pocketbase'

const RESEND_URL = 'https://api.resend.com/emails'

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character)
}

export type TicketEmailPayload = { email: string; event: EventRecord; reference: string; qrHash: string; gross: number }

export async function sendTicketConfirmationEmail(payload: TicketEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) throw new Error('Email delivery is not configured. Add RESEND_API_KEY and EMAIL_FROM.')

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(payload.qrHash)}`
  const eventTitle = escapeHtml(payload.event.title)
  const venue = escapeHtml(payload.event.venue)
  const reference = escapeHtml(payload.reference)
  const attendee = escapeHtml(payload.email)
  const html = `<!doctype html><html><body style="margin:0;background:#f5f0e5;color:#1A2B4C;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;padding:24px"><div style="background:#1A2B4C;padding:28px;text-align:center"><div style="color:#D4AF37;font-size:12px;letter-spacing:3px;font-weight:bold">NGWAO LEMPE PRESENTS</div><h1 style="color:#D4AF37;margin:12px 0 0;font-size:32px">SICAF 2026</h1></div><div style="background:#fff;padding:28px"><h2 style="margin-top:0">Your ticket is confirmed</h2><p>Thank you for joining Sedibelo International Cultural Arts Festival.</p><table style="width:100%;border-collapse:collapse"><tr><td style="padding:10px 0;color:#6b7280">Event</td><td style="padding:10px 0;font-weight:bold">${eventTitle}</td></tr><tr><td style="padding:10px 0;color:#6b7280">Venue</td><td style="padding:10px 0">${venue}</td></tr><tr><td style="padding:10px 0;color:#6b7280">Start date</td><td style="padding:10px 0">${formatEventDate(payload.event.date_start)} at ${formatEventTime(payload.event.date_start)}</td></tr><tr><td style="padding:10px 0;color:#6b7280">Attendee</td><td style="padding:10px 0">${attendee}</td></tr><tr><td style="padding:10px 0;color:#6b7280">Reference ID</td><td style="padding:10px 0;font-weight:bold;color:#1A2B4C">${reference}</td></tr></table><div style="margin:24px 0;text-align:center"><img src="${qrUrl}" width="240" height="240" alt="Ticket QR code" style="display:inline-block"/><p style="font-size:12px;color:#6b7280">Present this QR code at the gate.</p></div><p style="border-top:1px solid #eadfca;padding-top:18px">Total paid: <strong>R${payload.gross.toFixed(2)}</strong></p></div></div></body></html>`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(RESEND_URL, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [payload.email], subject: `SICAF 2026 ticket confirmation — ${payload.reference}`, html }), signal: controller.signal })
    if (!response.ok) throw new Error(`Resend returned ${response.status}`)
    return { delivered: true as const }
  } finally { clearTimeout(timeout) }
}
