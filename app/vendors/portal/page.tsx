import { Suspense } from 'react'
import { VendorPortal } from '@/components/vendor-portal'
import { BackNavigationServer } from '@/components/back-navigation'

export default function VendorPortalPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-20">
        <BackNavigationServer href="/" label="Back to home" />
        <div className="mt-16 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-foreground">Vendor portal</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-primary md:text-7xl">Your stall, in view.</h1>
          <p className="mt-6 text-lg leading-7 text-muted-foreground">
            Check your application using your SICAF reference or the email you registered with. Approved vendors can pay their stall fee here.
          </p>
        </div>
        <section className="mt-12 max-w-3xl border-t-2 border-primary pt-8">
          <Suspense fallback={<div className="py-12 text-center text-muted-foreground font-mono text-sm">Loading portal...</div>}>
            <VendorPortal />
          </Suspense>
        </section>
      </div>
    </main>
  )
}