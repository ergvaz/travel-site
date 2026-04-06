'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ForestBackground from '@/components/ForestBackground'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import type { Trip } from '@/types'
import type { User } from '@supabase/supabase-js'

const MOCK_TRIPS: Trip[] = [
  { id: 'demo-1', user_id: '', title: '10 Days in Japan: Neon & Serenity', destination: 'Tokyo & Kyoto', country: 'Japan', days: 10, travel_mode: 'fly', preferences: ['history', 'food', 'nature'], total_estimated_cost: 4200, is_public: true, view_count: 1842, likes_count: 234, created_at: '2025-03-01', profiles: { id: '', username: 'mikewanders', full_name: 'Mike Chen', trips_count: 12, created_at: '' } },
  { id: 'demo-2', user_id: '', title: 'Hidden Gems of Portugal', destination: 'Lisbon & Porto', country: 'Portugal', days: 8, travel_mode: 'fly', preferences: ['food', 'history', 'views'], total_estimated_cost: 2800, is_public: true, view_count: 1204, likes_count: 187, created_at: '2025-03-10', profiles: { id: '', username: 'sara_explores', full_name: 'Sara Oliveira', trips_count: 7, created_at: '' } },
  { id: 'demo-3', user_id: '', title: 'Bali Spiritual Reset', destination: 'Ubud & Seminyak', country: 'Indonesia', days: 12, travel_mode: 'fly', preferences: ['relaxation', 'nature', 'food'], total_estimated_cost: 2100, is_public: true, view_count: 3201, likes_count: 412, created_at: '2025-02-20', profiles: { id: '', username: 'zenwanderer', full_name: 'Priya Kapoor', trips_count: 15, created_at: '' } },
  { id: 'demo-4', user_id: '', title: 'Iceland Ring Road Adventure', destination: 'Reykjavik & Beyond', country: 'Iceland', days: 7, travel_mode: 'drive', preferences: ['adventure', 'nature', 'views'], total_estimated_cost: 3600, is_public: true, view_count: 2108, likes_count: 298, created_at: '2025-01-15', profiles: { id: '', username: 'northbound', full_name: 'Lars Erikson', trips_count: 9, created_at: '' } },
  { id: 'demo-5', user_id: '', title: 'Morocco: Desert to Medina', destination: 'Marrakech & Sahara', country: 'Morocco', days: 9, travel_mode: 'fly', preferences: ['history', 'food', 'local'], total_estimated_cost: 2400, is_public: true, view_count: 1567, likes_count: 201, created_at: '2025-02-05', profiles: { id: '', username: 'souktrail', full_name: 'Aisha Noor', trips_count: 6, created_at: '' } },
  { id: 'demo-6', user_id: '', title: 'Tuscany: Wine, Villas & Rolling Hills', destination: 'Florence & Siena', country: 'Italy', days: 6, travel_mode: 'fly', preferences: ['food', 'romantic', 'views'], total_estimated_cost: 3100, is_public: true, view_count: 2890, likes_count: 367, created_at: '2025-01-28', profiles: { id: '', username: 'dolcevita', full_name: 'Marco Rossi', trips_count: 11, created_at: '' } },
]

export default function DiscoverPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS.slice(0, 3))
  const [loading, setLoading] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const gateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        setTrips(MOCK_TRIPS)
        loadPublicTrips()
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) { setTrips(MOCK_TRIPS); loadPublicTrips() }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadPublicTrips = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/trips?public=true&limit=20')
      const json = await res.json()
      if (json.trips?.length) {
        setTrips(prev => [...MOCK_TRIPS, ...json.trips.filter((t: Trip) => !t.id.startsWith('demo'))])
      }
    } finally {
      setLoading(false)
    }
  }

  // Show login gate when scrolling to 3rd card
  useEffect(() => {
    if (user) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setShowGate(true) },
      { threshold: 0.3 }
    )
    if (gateRef.current) observer.observe(gateRef.current)
    return () => observer.disconnect()
  }, [user])

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--forest-dark)' }}>
      <ForestBackground />
      <Navbar />
      <div className="relative pt-28 pb-16 px-4 md:px-6" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Trips from the <span className="text-gold-gradient">community</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Real itineraries planned by real travelers. Find yours, copy it, or get inspired.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 relative">
            {trips.map((trip, i) => (
              <div key={trip.id} ref={i === 2 && !user ? gateRef : undefined}>
                <TripCard trip={trip} onClick={() => {
                  if (!user && i >= 3) { setShowGate(true); return }
                  router.push(`/trips/${trip.id}`)
                }} />
              </div>
            ))}

            {/* Login gate overlay */}
            {showGate && !user && (
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-center" style={{ top: '55%', background: 'linear-gradient(to bottom, transparent, rgba(6,11,6,0.97) 40%)' }}>
                <div className="text-center pb-8 px-6">
                  <div className="forest-card p-8 max-w-sm mx-auto">
                    <div className="text-3xl mb-3">🌍</div>
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>See all community trips</h3>
                    <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Sign up free to browse all published itineraries and save trips you love.</p>
                    <div className="flex flex-col gap-2">
                      <Link href="/auth/signup" className="btn-gold py-3 rounded-xl text-sm font-bold text-center">Create Free Account</Link>
                      <Link href="/auth/login" className="btn-ghost py-3 rounded-xl text-sm font-semibold text-center">Sign In</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const gradients = [
    'linear-gradient(135deg, #1a2e1a, #0d1f0d)',
    'linear-gradient(135deg, #2e1a1a, #1f0d0d)',
    'linear-gradient(135deg, #1a1a2e, #0d0d1f)',
    'linear-gradient(135deg, #2e2a1a, #1f1a0d)',
    'linear-gradient(135deg, #1a2e2a, #0d1f1a)',
    'linear-gradient(135deg, #2a1a2e, #1a0d1f)',
  ]
  const hash = trip.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const gradient = gradients[hash % gradients.length]

  return (
    <button onClick={onClick} className="alt-dest-card w-full text-left group">
      {/* Image area */}
      <div className="h-44 relative" style={{ background: gradient }}>
        <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">🗺</div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,10,0.9) 0%, transparent 60%)' }} />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="text-lg font-bold leading-tight">{trip.title}</div>
        </div>
        <div className="absolute top-3 right-3 price-badge">${trip.total_estimated_cost?.toLocaleString()}</div>
      </div>
      {/* Body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            📍 {trip.destination}, {trip.country}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{trip.days}d</div>
        </div>
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-3">
            <span>👁 {trip.view_count?.toLocaleString()}</span>
            <span>❤️ {trip.likes_count?.toLocaleString()}</span>
          </div>
          {trip.profiles && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #c8a84b, #a8882b)', color: '#060b06' }}>
                {(trip.profiles.full_name || trip.profiles.username || 'U')[0].toUpperCase()}
              </div>
              <span>{trip.profiles.full_name || trip.profiles.username}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
