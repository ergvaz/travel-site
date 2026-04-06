'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ForestBackground from '@/components/ForestBackground'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import type { Trip } from '@/types'
import type { User } from '@supabase/supabase-js'

export default function MyTripsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      loadTrips(data.user.id)
    })
  }, [])

  const loadTrips = async (userId: string) => {
    setLoading(true)
    const res = await fetch(`/api/trips?userId=${userId}`)
    const json = await res.json()
    if (json.trips) setTrips(json.trips)
    setLoading(false)
  }

  const handleTogglePublic = async (tripId: string, current: boolean) => {
    await fetch(`/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: !current }),
    })
    setTrips(t => t.map(trip => trip.id === tripId ? { ...trip, is_public: !current } : trip))
  }

  const handleDelete = async (tripId: string) => {
    if (!confirm('Delete this trip? This cannot be undone.')) return
    await fetch(`/api/trips/${tripId}`, { method: 'DELETE' })
    setTrips(t => t.filter(trip => trip.id !== tripId))
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--forest-dark)' }}>
      <ForestBackground />
      <Navbar />
      <div className="relative pt-28 pb-16 px-4 md:px-6" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>My Trips</h1>
            <Link href="/plan" className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Plan New Trip
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--gold) transparent transparent transparent' }} />
            </div>
          ) : trips.length === 0 ? (
            <div className="forest-card p-16 text-center">
              <div className="text-5xl mb-4">🗺</div>
              <h3 className="text-xl font-bold mb-2">No trips yet</h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Plan your first trip and it'll appear here.</p>
              <Link href="/plan" className="btn-gold inline-block px-8 py-3 rounded-xl text-sm font-bold">Plan Your First Trip</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map(trip => (
                <div key={trip.id} className="forest-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-lg truncate">{trip.title}</h3>
                      {trip.is_public && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>Public</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span>📍 {trip.destination}</span>
                      <span>📅 {trip.days} days</span>
                      {trip.total_estimated_cost && <span>💰 ${trip.total_estimated_cost.toLocaleString()}</span>}
                      <span>{new Date(trip.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/trips/${trip.id}`} className="btn-ghost px-3 py-2 rounded-lg text-xs font-semibold">View</Link>
                    <button
                      onClick={() => handleTogglePublic(trip.id, trip.is_public)}
                      className="btn-ghost px-3 py-2 rounded-lg text-xs font-semibold"
                    >
                      {trip.is_public ? 'Make Private' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
