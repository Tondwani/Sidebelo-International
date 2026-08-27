import { TicketConfirmationView } from '@/components/ticket-confirmation'
import type { TicketConfirmation } from '@/lib/pocketbase'

export default async function TicketSuccessPage({ searchParams }: { searchParams: Promise<{ data?: string }> }) {
  const { data } = await searchParams
  let ticket: TicketConfirmation | null = null
  try { if (data) ticket = JSON.parse(Buffer.from(decodeURIComponent(data), 'base64').toString('utf8')) as TicketConfirmation } catch { ticket = null }
  if (!ticket?.event?.title || !ticket.qrHash) return <main className="grid min-h-screen place-items-center bg-background px-6 text-center"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">SICAF 2026</p><h1 className="mt-4 font-serif text-5xl">Ticket details unavailable.</h1><p className="mx-auto mt-4 max-w-md text-muted-foreground">Return to the programme and try booking again, or contact the festival team for help.</p><a href="/#programme" className="mt-8 inline-block bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Return to programme</a></div></main>
  return <TicketConfirmationView ticket={ticket} />
}
