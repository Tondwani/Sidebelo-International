import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; status?: string }>
}) {
  const { reference, status } = await searchParams

  if (!reference) {
    return (
      <main className="min-h-screen bg-background px-5 py-16 text-foreground">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-serif text-4xl">Payment Error</h1>
          <p className="mt-4 text-muted-foreground">
            No payment reference provided. Please contact support if you believe this is an error.
          </p>
          <Link 
            href="/vendors/portal" 
            className="mt-8 inline-block bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Return to Vendor Portal
          </Link>
        </div>
      </main>
    )
  }

  // Verify the payment
  try {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/vendors/verify?reference=${reference}`
    const response = await fetch(verifyUrl)
    const data = await response.json()

    if (!response.ok || !data.success) {
      return (
        <main className="min-h-screen bg-background px-5 py-16 text-foreground">
          <div className="mx-auto max-w-md text-center">
            <h1 className="font-serif text-4xl">Payment Verification Failed</h1>
            <p className="mt-4 text-muted-foreground">
              {data.error || 'Unable to verify your payment. Please contact support.'}
            </p>
            <Link 
              href="/vendors/portal" 
              className="mt-8 inline-block bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Return to Vendor Portal
            </Link>
          </div>
        </main>
      )
    }

    // Payment successful - redirect to vendor portal
    redirect('/vendors/portal?payment=success')
  } catch (error) {
    return (
      <main className="min-h-screen bg-background px-5 py-16 text-foreground">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-serif text-4xl">Payment Error</h1>
          <p className="mt-4 text-muted-foreground">
            An error occurred while verifying your payment. Please contact support.
          </p>
          <Link 
            href="/vendors/portal" 
            className="mt-8 inline-block bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Return to Vendor Portal
          </Link>
        </div>
      </main>
    )
  }
}