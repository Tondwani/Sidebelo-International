// 'use client'

// import { useMemo, useState } from 'react'
// import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Menu, Ticket, X } from 'lucide-react'
// import type { EventRecord } from '@/lib/pocketbase'
// import { formatEventDate, formatEventTime } from '@/lib/pocketbase'

// const categories = ['All moments', 'Music', 'Heritage', 'Markets']

// function categoryFor(title: string) {
//   if (title.toLowerCase().includes('market')) return 'Markets'
//   if (title.toLowerCase().includes('ceremony') || title.toLowerCase().includes('parade') || title.toLowerCase().includes('heritage')) return 'Heritage'
//   return 'Music'
// }

// export function SicafDashboard({ events }: { events: EventRecord[] }) {
//   const [activeCategory, setActiveCategory] = useState('All moments')
//   const [menuOpen, setMenuOpen] = useState(false)
//   const filteredEvents = useMemo(() => activeCategory === 'All moments' ? events : events.filter((event) => categoryFor(event.title) === activeCategory), [activeCategory, events])

//   return (
//     <main className="min-h-screen overflow-hidden bg-background text-foreground">
//       <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">
//         <header className="flex items-center justify-between border-b border-border py-5">
//           <a href="#top" className="flex items-center gap-3" aria-label="SICAF home">
//             <span className="grid size-10 place-items-center bg-primary font-serif text-xl font-bold text-primary-foreground">S</span>
//             <span className="font-mono text-xs font-bold tracking-[0.22em]">SICAF<span className="text-accent">26</span></span>
//           </a>
//           <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Main navigation">
//             <a href="#programme" className="transition-colors hover:text-accent">Programme</a>
//             <a href="#about" className="transition-colors hover:text-accent">Our story</a>
//             <a href="#visit" className="transition-colors hover:text-accent">Visit</a>
//             <a href="/login" className="transition-colors hover:text-accent">Login</a>
//             <a href="#tickets" className="bg-primary px-5 py-3 text-primary-foreground transition-transform hover:-translate-y-0.5">Get tickets <ArrowUpRight className="ml-2 inline size-4" /></a>
//           </nav>
//           <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
//         </header>
//         {menuOpen && <nav className="flex flex-col gap-4 border-b border-border py-5 text-sm md:hidden" aria-label="Mobile navigation"><a href="#programme" onClick={() => setMenuOpen(false)}>Programme</a><a href="#about" onClick={() => setMenuOpen(false)}>Our story</a><a href="#visit" onClick={() => setMenuOpen(false)}>Visit</a><a href="/login" onClick={() => setMenuOpen(false)}>Login</a><a href="#vendors/register" onClick={() => setMenuOpen(false)}>Vendor registration</a><a href="#tickets" onClick={() => setMenuOpen(false)}>Get tickets</a></nav>}

//         <section id="top" className="relative grid gap-10 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-end md:py-24 lg:py-32">
//           <div>
//             <p className="mb-7 font-mono text-xs font-bold uppercase tracking-[0.24em] text-accent">18—20 September 2026 · Sedibelo</p>
//             <h1 className="max-w-4xl font-serif text-6xl leading-[0.9] tracking-[-0.055em] text-pretty sm:text-8xl lg:text-[9.5rem]">Our stories<br /><em className="text-accent">in motion.</em></h1>
//             <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground">Three days of music, movement, memory, and making. A living festival for everyone who calls the valley home.</p>
//           </div>
//           <div className="flex flex-col gap-5 border-l-2 border-accent pl-6 md:mb-2 md:ml-auto md:max-w-xs">
//             <p className="font-serif text-2xl leading-tight">The 2026 Sedibelo International Cultural Arts Festival.</p>
//             <a href="#programme" className="flex items-center gap-2 text-sm font-bold underline decoration-accent decoration-2 underline-offset-4">Explore the programme <ChevronRight className="size-4" /></a>
//           </div>
//         </section>

//         <section id="about" className="grid gap-8 border-y border-border py-10 sm:grid-cols-3">
//           <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">One place</p><p className="mt-2 font-serif text-2xl">Sedibelo, Limpopo</p></div>
//           <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">One weekend</p><p className="mt-2 font-serif text-2xl">18—20 Sep 2026</p></div>
//           <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Many ways to belong</p><p className="mt-2 font-serif text-2xl">Come as you are</p></div>
//         </section>

//         <section id="programme" className="py-16 sm:py-24">
//           <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">What’s on</p><h2 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Find your moment.</h2></div><div className="flex flex-wrap gap-2" role="tablist" aria-label="Programme categories">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`px-3 py-2 text-xs font-bold transition-colors ${activeCategory === category ? 'bg-primary text-primary-foreground' : 'border border-border hover:border-primary'}`} role="tab" aria-selected={activeCategory === category}>{category}</button>)}</div></div>
//           <div className="divide-y divide-border border-y border-border">{filteredEvents.map((event, index) => <article key={event.id} className="group grid gap-4 py-6 sm:grid-cols-[5rem_1fr_auto] sm:items-center"><div className="font-mono text-xs font-bold text-accent">0{index + 1}</div><div><p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{formatEventDate(event.date_start)} · {formatEventTime(event.date_start)}</p><h3 className="font-serif text-2xl transition-colors group-hover:text-accent">{event.title}</h3><p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{event.venue}</p></div><a href={`/events/${event.id}#tickets`} className="flex items-center gap-2 text-sm font-bold sm:justify-self-end">Details <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></a></article>)}</div>
//         </section>

//         <section id="visit" className="grid gap-8 bg-primary p-7 text-primary-foreground sm:grid-cols-[1fr_auto] sm:items-end sm:p-12"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Make a weekend of it</p><h2 className="mt-3 max-w-xl font-serif text-5xl leading-none tracking-[-0.04em]">Bring your people. We’ll bring the rhythm.</h2></div><div className="space-y-4 text-sm text-primary-foreground/75"><p className="flex items-center gap-2"><CalendarDays className="size-4 text-accent" /> 18—20 September 2026</p><p className="flex items-center gap-2"><MapPin className="size-4 text-accent" /> Sedibelo Civic Centre</p></div></section>

//         <section aria-labelledby="user-actions" className="grid gap-6 border-b border-border py-12 sm:grid-cols-[1fr_2fr] sm:items-center">
//           <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Your SICAF journey</p><h2 id="user-actions" className="mt-3 font-serif text-4xl tracking-[-0.04em]">Stay close to the festival.</h2></div>
//           <div className="grid gap-3 sm:grid-cols-2">
//             <a href="/login" className="group rounded-xl border border-primary/10 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg"><span className="mb-8 flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">01</span><span className="block font-bold text-foreground">Login</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Access your account</span><ArrowUpRight className="mt-5 size-4 text-accent transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></a>
//             <a href="/vendors/register" className="group rounded-xl border border-primary/10 bg-secondary/70 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/25 hover:bg-secondary hover:shadow-lg"><span className="mb-8 flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">02</span><span className="block font-bold text-foreground">Vendor registration</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Join the marketplace</span><ArrowUpRight className="mt-5 size-4 text-accent transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></a>
//           </div>
//         </section>
//         <footer id="tickets" className="flex flex-col gap-5 border-b border-border py-8 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">SICAF 2026 · Culture, carried forward.</p><a href="mailto:hello@sicaf.co.za" className="flex items-center gap-2 font-bold">Be part of it <Ticket className="size-4 text-accent" /></a></footer>
//       </div>
//     </main>
//   )
// }
'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Menu,
  Sparkles,
  Ticket,
  X,
  ZoomIn,
} from 'lucide-react'
import type { EventRecord } from '@/lib/pocketbase'
import { formatEventDate, formatEventTime } from '@/lib/pocketbase'

const categories = ['All moments', 'Music', 'Heritage', 'Markets']

// Gallery items reflecting the cultural context and real event photography.
// NOTE: these paths must match the exact filenames in /public/images
// (case-sensitive on most hosts, spaces are fine but easy to typo).
const galleryMoments = [
  {
    id: 'g-1',
    title: 'Traditional Dance & Regiments',
    category: 'Heritage',
    image: '/images/dance-2.jpeg',
    description: 'Mephato processions and cultural performances at the stadium.',
  },
  {
    id: 'g-2',
    title: 'Cultural Crafts & Artifacts',
    category: 'Markets',
    image: '/images/cups.jpeg',
    description: 'Handcrafted artifacts and local artisan displays.',
  },
  {
    id: 'g-3',
    title: 'Community & Heritage',
    category: 'Heritage',
    image: '/images/dance-3.jpeg',
    description: 'Showcasing community welfare and historical roots.',
  },
  // {
  //   id: 'g-4',
  //   title: 'Sedibelo Celebration',
  //   category: 'Music',
  //   image: '/images/sedibelo logo.jpeg',
  //   description: 'Festivities and gathering of the global community.',
  // },
]

function categoryFor(title: string) {
  if (title.toLowerCase().includes('market')) return 'Markets'
  if (title.toLowerCase().includes('ceremony') || title.toLowerCase().includes('parade') || title.toLowerCase().includes('heritage')) return 'Heritage'
  return 'Music'
}

export function SicafDashboard({ events }: { events: EventRecord[] }) {
  const [activeCategory, setActiveCategory] = useState('All moments')
  const [menuOpen, setMenuOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredEvents = useMemo(
    () => (activeCategory === 'All moments' ? events : events.filter((event) => categoryFor(event.title) === activeCategory)),
    [activeCategory, events]
  )

  const filteredGallery = useMemo(
    () => (activeCategory === 'All moments' ? galleryMoments : galleryMoments.filter((item) => item.category === activeCategory)),
    [activeCategory]
  )

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i - 1 + filteredGallery.length) % filteredGallery.length)),
    [filteredGallery.length]
  )
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % filteredGallery.length)),
    [filteredGallery.length]
  )

  // Keyboard navigation for the lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, closeLightbox, showPrev, showNext])

  const activeImage = lightboxIndex === null ? null : filteredGallery[lightboxIndex]

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">

        {/* Header with Compact Logo Integration */}
        <header className="flex items-center justify-between border-b border-border py-4 px-6">
          <a href="#top" className="flex items-center gap-2.5 group" aria-label="SICAF home">
            <div className="relative size-8 overflow-hidden rounded-full border border-accent/30 bg-card shadow-xs transition-transform group-hover:scale-105">
              <img
                src="/images/sedibelo logo.jpeg"
                alt="SICAF 2026 Official Logo"
                className="size-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1.5 font-serif text-lg font-bold tracking-tight">
              <span>SICAF</span>
              <span className="text-accent text-sm font-mono">26</span>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Main navigation">
            <a href="#programme" className="transition-colors hover:text-accent">Programme</a>
            <a href="#gallery" className="transition-colors hover:text-accent">Gallery</a>
            <a href="#about" className="transition-colors hover:text-accent">Our story</a>
            <a href="#visit" className="transition-colors hover:text-accent">Visit</a>
            <a href="/login" className="transition-colors hover:text-accent">Login</a>
            <a href="#tickets" className="bg-primary px-4 py-2 text-primary-foreground rounded-md transition-transform hover:-translate-y-0.5">Get tickets <ArrowUpRight className="ml-1 inline size-3.5" /></a>
          </nav>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {menuOpen && (
          <nav className="flex flex-col gap-4 border-b border-border py-5 text-sm md:hidden" aria-label="Mobile navigation">
            <a href="#programme" onClick={() => setMenuOpen(false)}>Programme</a>
            <a href="#gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>Our story</a>
            <a href="#visit" onClick={() => setMenuOpen(false)}>Visit</a>
            <a href="/login" onClick={() => setMenuOpen(false)}>Login</a>
            <a href="/vendors/register" onClick={() => setMenuOpen(false)}>Vendor registration</a>
            <a href="#tickets" onClick={() => setMenuOpen(false)}>Get tickets</a>
          </nav>
        )}

        {/* Hero Section */}
        <section id="top" className="relative grid gap-10 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-end md:py-24 lg:py-32">
          <div>
            <div className="inline-flex items-center gap-2 mb-7 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="size-3.5 text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-accent">18—20 September 2026 · Moruleng</span>
            </div>
            <h1 className="max-w-4xl font-serif text-6xl leading-[0.9] tracking-[-0.055em] text-pretty sm:text-8xl lg:text-[9.5rem]">
              Our stories<br /><em className="text-accent not-italic">in motion.</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground">
              Three days of music, movement, memory, and making. Hosted personally by Kgosi Nyalala Pilane II, bringing the global community to Sedibelo.
            </p>
          </div>
          <div className="flex flex-col gap-5 border-l-2 border-accent pl-6 md:mb-2 md:ml-auto md:max-w-xs">
            <p className="font-serif text-2xl leading-tight">The 2026 Sedibelo International Cultural Arts Festival.</p>
            <a href="#programme" className="flex items-center gap-2 text-sm font-bold underline decoration-accent decoration-2 underline-offset-4">
              Explore the programme <ChevronRight className="size-4" />
            </a>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section id="about" className="grid gap-8 border-y border-border py-10 sm:grid-cols-3">
          <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Location</p><p className="mt-2 font-serif text-2xl">Moruleng, North West</p></div>
          <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Dates</p><p className="mt-2 font-serif text-2xl">18—20 Sep 2026</p></div>
          <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Theme</p><p className="mt-2 font-serif text-2xl">Ngwao Lempe</p></div>
        </section>

        {/* MODERN PHOTO GALLERY SECTION */}
        <section id="gallery" className="py-16 sm:py-24">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">Visual Archive</p>
              <h2 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Moments in motion.</h2>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Gallery and Programme categories">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-xs font-bold transition-all rounded-md ${activeCategory === category ? 'bg-primary text-primary-foreground shadow-sm' : 'border border-border hover:border-primary'}`}
                  role="tab"
                  aria-selected={activeCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGallery.map((moment, idx) => (
              <button
                key={moment.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`group relative overflow-hidden rounded-2xl bg-card border border-border shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left ${
                  idx === 0 ? 'md:col-span-2 md:row-span-2 min-h-[380px]' : 'min-h-[300px]'
                }`}
                aria-label={`Open photo: ${moment.title}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent z-10 transition-opacity duration-300 group-hover:from-primary" />

                <img
                  src={moment.image}
                  alt={moment.title}
                  className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                {/* Zoom affordance on hover */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex size-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-sm">
                    <ZoomIn className="size-5" />
                  </span>
                </div>

                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 text-primary-foreground">
                  <span className="inline-block self-start mb-2 px-2.5 py-1 rounded-full bg-accent/90 text-accent-foreground font-mono text-[10px] uppercase tracking-wider font-bold">
                    {moment.category}
                  </span>
                  <h3 className="font-serif text-2xl font-bold tracking-tight mb-1 text-white group-hover:text-accent transition-colors">
                    {moment.title}
                  </h3>
                  <p className="text-xs text-primary-foreground/80 line-clamp-2">
                    {moment.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* LIGHTBOX */}
        {activeImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-10"
            role="dialog"
            aria-modal="true"
            aria-label={activeImage.title}
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {filteredGallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); showPrev() }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); showNext() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}

            <div className="flex max-h-full max-w-4xl flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <img
                src={activeImage.image}
                alt={activeImage.title}
                className="max-h-[70vh] w-auto rounded-xl object-contain shadow-2xl"
              />
              <div className="text-center text-primary-foreground">
                <span className="mb-2 inline-block px-2.5 py-1 rounded-full bg-accent/90 text-accent-foreground font-mono text-[10px] uppercase tracking-wider font-bold">
                  {activeImage.category}
                </span>
                <h3 className="font-serif text-2xl font-bold">{activeImage.title}</h3>
                <p className="mt-1 text-sm text-primary-foreground/70">{activeImage.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Programme Schedule Section */}
        <section id="programme" className="py-16 sm:py-24 border-t border-border">
          <div className="mb-8">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">Schedule</p>
            <h2 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Find your moment.</h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {filteredEvents.map((event, index) => (
              <article key={event.id} className="group grid gap-4 py-6 sm:grid-cols-[5rem_1fr_auto] sm:items-center">
                <div className="font-mono text-xs font-bold text-accent">0{index + 1}</div>
                <div>
                  <p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {formatEventDate(event.date_start)} · {formatEventTime(event.date_start)}
                  </p>
                  <h3 className="font-serif text-2xl transition-colors group-hover:text-accent">{event.title}</h3>
                  <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 text-accent" />{event.venue}
                  </p>
                </div>
                <a href={`/events/${event.id}#tickets`} className="flex items-center gap-2 text-sm font-bold sm:justify-self-end">
                  Details <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Visit Banner */}
        <section id="visit" className="grid gap-8 bg-primary p-8 text-primary-foreground rounded-2xl my-12 sm:grid-cols-[1fr_auto] sm:items-center sm:p-12 shadow-xl">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Make a weekend of it</p>
            <h2 className="mt-3 max-w-xl font-serif text-5xl leading-none tracking-[-0.04em]">Bring your people. We'll bring the rhythm.</h2>
          </div>
          <div className="space-y-4 text-sm text-primary-foreground/75 border-t sm:border-t-0 sm:border-l border-primary-foreground/20 sm:pl-8 pt-4 sm:pt-0">
            <p className="flex items-center gap-2"><CalendarDays className="size-4 text-accent" /> 18—20 September 2026</p>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-accent" /> Moruleng Cultural Precinct</p>
          </div>
        </section>

        {/* User Actions Section */}
        <section aria-labelledby="user-actions" className="grid gap-6 border-b border-border py-12 sm:grid-cols-[1fr_2fr] sm:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Your SICAF journey</p>
            <h2 id="user-actions" className="mt-3 font-serif text-4xl tracking-[-0.04em]">Stay close to the festival.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="/login" className="group rounded-xl border border-primary/10 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
              <span className="mb-8 flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">01</span>
              <span className="block font-bold text-foreground">Login</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">Access your account</span>
              <ArrowUpRight className="mt-5 size-4 text-accent transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
            <a href="/vendors/register" className="group rounded-xl border border-primary/10 bg-secondary/70 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/25 hover:bg-secondary hover:shadow-lg">
              <span className="mb-8 flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">02</span>
              <span className="block font-bold text-foreground">Vendor registration</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">Join the marketplace</span>
              <ArrowUpRight className="mt-5 size-4 text-accent transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer id="tickets" className="flex flex-col gap-5 border-b border-border py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 overflow-hidden rounded-full border border-accent/40 bg-card">
              <img src="/images/sedibelo logo.jpeg" alt="Logo icon" className="size-full object-cover" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">SICAF 2026 · Ngwao Lempe, carried forward.</p>
          </div>
        </footer>
      </div>
    </main>
  )
}