import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { BackNavigation } from '@/components/back-navigation'

export default function TicketErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = searchParams

  const errorMessages: Record<string, string> = {
    verification_failed: 'Payment verification failed. Please contact support.',
    payment_failed: 'Payment was not successful. Please try again.',
    invalid_metadata: 'Invalid payment information. Please contact support.',
    event_not_found: 'Event not found. Please try again.',
    record_creation_failed: 'Failed to create ticket. Please contact support.',
    callback_error: 'Payment processing error. Please contact support.',
  }

  const errorMessage = error ? errorMessages[error] || 'An error occurred during payment processing.' : 'An error occurred during payment processing.'

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <BackNavigation fallbackHref="/#programme" label="Back to programme" />
        
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl">Payment Error</h1>
          
          <p className="mt-6 text-lg text-muted-foreground">
            {errorMessage}
          </p>
          
          <div className="mt-8 flex gap-4">
            <Link
              href="/#programme"
              className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 font-bold text-primary-foreground"
            >
              Try Again
            </Link>
            
            <a
              href="mailto:support@sicaf festival.com"
              className="inline-flex items-center justify-center gap-2 border border-border px-6 py-3 font-bold"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}