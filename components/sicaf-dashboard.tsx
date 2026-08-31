'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Menu,
  Sparkles,
  Ticket,
  X,
  ZoomIn,
  Globe,
  Award,
  Building2,
} from 'lucide-react'
import type { EventRecord } from '@/lib/pocketbase'
import { formatEventDate, formatEventTime } from '@/lib/pocketbase'

const categories = ['All moments', 'Music', 'Heritage', 'Markets']

// 7-day programme data
const programmeDays = [
  {
    day: 1,
    date: 'Mon, 21 Sep',
    title: 'Environmental Cleansing, Official Opening & Mphebatho @ 30 Launch',
    description: 'Opening the festival with environmental stewardship and celebrating 30 years of Mphebatho Cultural Museum.',
    type: 'Opening'
  },
  {
    day: 2,
    date: 'Tue, 22 Sep',
    title: 'Traditional Music & Dance Competitions',
    description: 'Showcasing traditional cultural performances across disciplines.',
    type: 'Music'
  },
  {
    day: 3,
    date: 'Wed, 23 Sep',
    title: 'IKS Cultural Day',
    description: 'Indigenous Knowledge Systems exhibition, traditional healing showcase, public lecture with CRL Commission, and fashion showcase.',
    type: 'Heritage'
  },
  {
    day: 4,
    date: 'Thu, 24 Sep',
    title: 'National Heritage Day Celebration',
    description: 'Public Holiday featuring Mephato regiment processions, Kgosi Nyalala Pilane II\'s address, choir performances, and bicycle tour of Moruleng.',
    type: 'Heritage'
  },
  {
    day: 5,
    date: 'Fri, 25 Sep',
    title: 'Dikgafela Harvest Customs & Memorial Lecture Gala',
    description: 'Exploring customary law in post-apartheid South Africa, co-presented with UNISA Thabo Mbeki African School.',
    type: 'Heritage'
  },
  {
    day: 6,
    date: 'Sat, 26 Sep',
    title: 'Mammitlwa International Music & Arts Festival',
    description: 'Artist development workshops, recording bootcamp, and showcases by local and international partner artists.',
    type: 'Music'
  },
  {
    day: 7,
    date: 'Sun, 27 Sep',
    title: 'Interfaith Closing Service & Awards Ceremony',
    description: 'Celebrating unity through faith and recognizing cultural contributions.',
    type: 'Closing'
  }
]

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
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

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
            <a href="#tickets" className="bg-primary px-4 py-2 text-primary-foreground rounded-md transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">Get tickets <ArrowUpRight className="ml-1 inline size-3.5" /></a>
          </nav>

          <button className="md:hidden size-10 flex items-center justify-center" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
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
        <section id="top" className="relative grid gap-10 py-20 md:grid-cols-[1.15fr_0.85fr] md:items-end md:py-28 lg:py-32">
          <div>
            <div className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-accent">21—27 September 2026 · Heritage Month</span>
            </div>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] tracking-[-0.055em] text-pretty sm:text-7xl lg:text-[8.5rem]">
              Ngwao Lempe<br /><em className="text-accent not-italic">Celebrating Culture & Heritage</em>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-muted-foreground">
              Through Unity, Collaboration & Global Exchange. A 7-day immersive cultural experience hosted by Kgosi Nyalala Pilane II at Mphebatho Cultural Museum.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
                <Award className="size-4 text-accent" />
                <span className="text-xs font-bold text-foreground">30th Anniversary</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
                <Globe className="size-4 text-accent" />
                <span className="text-xs font-bold text-foreground">International Partnerships</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5 border-l-2 border-accent pl-6 md:mb-2 md:ml-auto md:max-w-xs">
            <p className="font-serif text-2xl leading-tight">Sedibelo International Cultural Arts Festival 2026.</p>
            <div className="text-sm text-muted-foreground">
              <p className="font-bold mb-1">Mphebatho @ 30</p>
              <p>30 years as South Africa's first rural cultural museum</p>
            </div>
            <a href="#programme" className="flex items-center gap-2 text-sm font-bold underline decoration-accent decoration-2 underline-offset-4 hover:opacity-70 transition-opacity">
              Explore the programme <ChevronRight className="size-4" />
            </a>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section id="about" className="grid gap-8 border-y border-border py-12 sm:grid-cols-3">
          <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Location</p><p className="mt-2 font-serif text-2xl">Moruleng, North West</p></div>
          <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Dates</p><p className="mt-2 font-serif text-2xl">21—27 Sep 2026</p></div>
          <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Theme</p><p className="mt-2 font-serif text-2xl">Ngwao Lempe</p></div>
        </section>

        {/* International Partnerships Badge */}
        <section className="py-12">
          <div className="border border-border/60 bg-card rounded-2xl p-8 backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 flex-shrink-0">
                <Globe className="size-6 text-accent" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold mb-2">International Cultural Partnerships</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In diplomatic alignment with global cultural institutions including Goethe-Institut, British Council, Embassy of Japan, and other international partners fostering cultural exchange and heritage preservation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Festival Video Section */}
        <section id="video" className="py-20 sm:py-28">
          <div className="mb-8">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">Experience SICAF</p>
            <h2 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Watch the festival come alive.</h2>
            <p className="text-sm text-muted-foreground mt-2">Hosted by Kgosi Nyalala Pilane II at Mphebatho Cultural Museum</p>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-lg">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube-nocookie.com/embed/2eCUbRTwpC0"
              title="Bakgatla-Ba-Kgafela Culture & Heritage"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        {/* MODERN PHOTO GALLERY SECTION */}
        <section id="gallery" className="py-20 sm:py-28">
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
                className={`group relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left backdrop-blur-md ${idx === 0 ? 'md:col-span-2 md:row-span-2 min-h-[380px]' : 'min-h-[300px]'
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
              className="absolute right-5 top-5 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:rotate-90 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Close lightbox"
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

        {/* Programme Schedule Section - 7-Day Accordion */}
        <section id="programme" className="py-20 sm:py-28 border-t border-border">
          <div className="mb-10">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">7-Day Programme</p>
            <h2 className="mt-3 font-serif text-5xl tracking-[-0.04em]">Heritage Month Immersion.</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl">Experience a week of cultural celebration from Monday to Sunday, featuring traditional ceremonies, music competitions, indigenous knowledge systems, and international artistic showcases.</p>
          </div>
          <div className="space-y-4">
            {programmeDays.map((day) => (
              <div
                key={day.day}
                className="border border-border/60 bg-card rounded-2xl overflow-hidden backdrop-blur-md hover:border-accent/40 transition-colors duration-300"
              >
                <button
                  type="button"
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-accent/5 transition-colors"
                  aria-expanded={expandedDay === day.day}
                  aria-controls={`day-${day.day}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent font-mono text-sm font-bold">
                      {day.day}
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{day.date}</p>
                      <h3 className="font-serif text-xl font-bold mt-1">{day.title}</h3>
                    </div>
                  </div>
                  {expandedDay === day.day ? (
                    <ChevronUp className="size-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronDown className="size-5 text-muted-foreground transition-transform" />
                  )}
                </button>
                {expandedDay === day.day && (
                  <div id={`day-${day.day}`} className="px-6 pb-6 pt-2 border-t border-border/60">
                    <p className="text-muted-foreground leading-relaxed">{day.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-xs font-bold uppercase tracking-wider">
                        {day.type}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Visit Banner */}
        <section id="visit" className="grid gap-8 bg-primary p-8 text-primary-foreground rounded-2xl my-12 sm:grid-cols-[1fr_auto] sm:items-center sm:p-12 shadow-xl">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Make a week of it</p>
            <h2 className="mt-3 max-w-xl font-serif text-5xl leading-none tracking-[-0.04em]">Bring your people. We'll bring the rhythm.</h2>
          </div>
          <div className="space-y-4 text-sm text-primary-foreground/75 border-t sm:border-t-0 sm:border-l border-primary-foreground/20 sm:pl-8 pt-4 sm:pt-0">
            <p className="flex items-center gap-2"><CalendarDays className="size-4 text-accent" /> 21—27 September 2026</p>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-accent" /> Mphebatho Cultural Museum</p>
          </div>
        </section>

        {/* User Actions Section */}
        <section aria-labelledby="user-actions" className="grid gap-6 border-b border-border py-16 sm:grid-cols-[1fr_2fr] sm:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Your SICAF journey</p>
            <h2 id="user-actions" className="mt-3 font-serif text-4xl tracking-[-0.04em]">Stay close to the festival.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="/login" className="group rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg backdrop-blur-md">
              <span className="mb-8 flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">01</span>
              <span className="block font-bold text-foreground">Login</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">Access your account</span>
              <ArrowUpRight className="mt-5 size-4 text-accent transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
            <a href="/vendors/register" className="group rounded-xl border border-border/60 bg-secondary/70 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-secondary hover:shadow-lg backdrop-blur-md">
              <span className="mb-8 flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">02</span>
              <span className="block font-bold text-foreground">Vendor registration</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">Join the marketplace</span>
              <ArrowUpRight className="mt-5 size-4 text-accent transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </section>

        {/* Location Map Section */}
        <section id="location" className="py-20 sm:py-28">
          <div className="mb-6">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">Find us</p>
            <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em]">Mphebatho Cultural Museum</h2>
            <p className="mt-2 text-muted-foreground">499 Moruleng Boulevard, Moruleng, North West Province · Hosted by Kgosi Nyalala Pilane II</p>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
            <iframe
              src="https://www.google.com/maps?q=Mphebatho+Cultural+Museum,+Moruleng,+North+West+Province&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mphebatho Cultural Museum Location"
              className="absolute inset-0"
            />
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>GPS Coordinates: 25°10'7.25"S, 27°10'2.91"E</p>
            <p className="mt-1">Address: 499 Moruleng Boulevard, Moruleng, Rustenburg, 0300, South Africa</p>
          </div>
        </section>

        {/* Privacy & Legal Section */}
        <section className="py-8 border-t border-border">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
            <p>© 2026 Sedibelo International Cultural Arts Festival. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact Us</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="tickets" className="flex flex-col gap-6 border-b border-border py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 overflow-hidden rounded-full border border-accent/40 bg-card">
              <img src="/images/sedibelo logo.jpeg" alt="Logo icon" className="size-full object-cover" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">SICAF 2026 · Ngwao Lempe, carried forward.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 overflow-hidden rounded bg-card border border-border">
              <img src="/images/deve welfare.jpeg" alt="Development and Welfare NPC" className="size-full object-cover" />
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Development and Welfare NPC powered by <span className="font-bold">THE ACCESS GROUP (Pty) Ltd</span>
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}