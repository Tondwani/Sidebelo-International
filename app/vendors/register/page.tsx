import Link from 'next/link'
import { VendorRegistrationForm } from '@/components/vendor-registration-form'

export default function VendorRegisterPage() {
  return <main className="min-h-screen bg-background"><div className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-20"><Link href="/" className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">← SICAF 2026</Link><div className="mt-16 max-w-2xl"><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-foreground">Arts Village · Vendor registration</p><h1 className="mt-4 font-serif text-5xl leading-[0.95] text-primary md:text-7xl">Bring your work to the festival.</h1><p className="mt-6 text-lg leading-7 text-muted-foreground">Join the SICAF marketplace as a local artisan, food maker, or beverage trader. Applications are reviewed by the festival team.</p></div><section className="mt-12 max-w-3xl border-t-2 border-primary pt-8"><VendorRegistrationForm /></section><p className="mt-8 text-sm text-muted-foreground">Already applied? <Link className="font-bold text-primary underline" href="/vendors/portal">Track your application</Link></p></div></main>
}
