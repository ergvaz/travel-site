'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import Link from 'next/link'
import ForestBackground from '@/components/ForestBackground'
import Navbar from '@/components/Navbar'
const Globe3D = lazy(() => import('@/components/Globe3D'))

const DESTINATIONS = ['Kyoto', 'Patagonia', 'Santorini', 'Bali', 'Iceland', 'Morocco', 'Costa Rica', 'Tuscany']

const FEATURES = [
  {
    title: 'AI Trip Planner',
    description: 'Describe where you want to go and your budget. Claude AI builds a full itinerary — flights, hotels, activities, restaurants, day by day.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  },
  {
    title: 'Budget Intelligence',
    description: 'Over budget? We instantly suggest similar destinations you can actually afford. Every option is researched, not just guessed.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  },
  {
    title: 'Live Refinement',
    description: "Don't like something? Chat with your AI agent to swap hotels, change activities, or adjust the whole tone of the trip.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
  {
    title: 'Seasonal Awareness',
    description: "We check crowds, weather, and local events for your travel month. No unpleasant surprises — just the right trip at the right time.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  },
  {
    title: 'Trip Catalog',
    description: 'Save, revisit, and publish your trips. Browse what other travelers have planned and take their itinerary as your own.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  },
  {
    title: 'Share & Inspire',
    description: 'Share your itinerary via email, copy-paste it, or post to social media. One tap to inspire the people you love to travel.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  },
]

const STATS = [
  { value: '50+', label: 'Destinations' },
  { value: 'AI', label: 'Powered Research' },
  { value: '100%', label: 'Free to Start' },
]

export default function HomePage() {
  const [destIndex, setDestIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    const interval = setInterval(() => setDestIndex(i => (i + 1) % DESTINATIONS.length), 2800)
    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal-up') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--forest-dark)' }}>
      <ForestBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center px-6" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-0 pt-20 pb-10">

          {/* Left: text */}
          <div
            className="flex-1 transition-all duration-1000 text-center lg:text-left"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase mb-8 px-4 py-2 rounded-full"
              style={{ color: 'var(--gold)', background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.2)', letterSpacing: '0.15em' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              AI-Powered Travel Planning
            </div>

            <h1 className="font-bold mb-6 leading-tight" style={{ fontSize: 'clamp(40px, 6vw, 80px)', fontFamily: 'Georgia, serif', textShadow: '0 4px 30px rgba(0,0,0,0.8)', letterSpacing: '-0.02em' }}>
              Your journey to{' '}
              <span className="text-gold-gradient block" style={{ minHeight: '1.2em' }}>
                {DESTINATIONS[destIndex]}
              </span>
              starts here.
            </h1>

            <p className="max-w-lg mb-10 text-lg leading-relaxed mx-auto lg:mx-0" style={{ color: 'var(--fog-light)', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
              Tell us your budget, destination, and what you love. Our AI plans the entire trip — flights, hotels, day-by-day itinerary, and insider tips.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Link href="/plan" className="btn-gold px-10 py-4 rounded-2xl text-base font-bold" style={{ minWidth: '200px' }}>
                <span className="flex items-center gap-2 justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Plan My Trip
                </span>
              </Link>
              <Link href="/discover" className="btn-ghost px-8 py-4 rounded-2xl text-sm font-medium">Browse Trips</Link>
            </div>
          </div>

          {/* Right: 3D globe — desktop only */}
          <div
            className="hidden lg:flex flex-1 items-center justify-center transition-all duration-1000"
            style={{ opacity: visible ? 1 : 0, minHeight: '420px', maxWidth: '520px', width: '100%' }}
          >
            <div style={{ width: '100%', height: '480px', position: 'relative' }}>
              {/* Glow under globe */}
              <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '60px', background: 'radial-gradient(ellipse, rgba(200,168,75,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <Suspense fallback={
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="w-12 h-12 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--gold) transparent transparent transparent' }} />
                </div>
              }>
                <Globe3D />
              </Suspense>
              <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>DRAG TO EXPLORE</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000" style={{ opacity: visible ? 0.6 : 0, color: 'var(--fog)' }}>
          <span className="text-xs" style={{ letterSpacing: '0.15em' }}>SCROLL</span>
          <div className="w-px h-12 animate-bounce" style={{ background: 'linear-gradient(to bottom, var(--gold), transparent)' }} />
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-32" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="text-center mb-20 opacity-0">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Every detail, <span className="text-gold-gradient">handled.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>From budget to boarding pass. We do the research, you do the living.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} data-reveal className="forest-card p-8 opacity-0" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)' }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative px-6 py-20" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto">
          <div className="gold-divider mb-16" />
          <div data-reveal className="grid grid-cols-3 gap-8 text-center opacity-0">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-4xl font-bold text-gold-gradient mb-2" style={{ fontFamily: 'Georgia, serif' }}>{s.value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="gold-divider mt-16" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-32" style={{ zIndex: 10 }}>
        <div className="max-w-3xl mx-auto text-center">
          <div data-reveal className="forest-card p-12 opacity-0" style={{ background: 'rgba(12,18,12,0.9)' }}>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>Ready to wander?</h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>One trip free, no credit card required.</p>
            <Link href="/plan" className="btn-gold inline-block px-12 py-4 rounded-2xl text-base font-bold">
              Start Planning — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative px-6 py-10 text-center text-sm" style={{ zIndex: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--forest-border)' }}>
        <p>© {new Date().getFullYear()} WanderAI. Built for explorers.</p>
      </footer>
    </div>
  )
}
