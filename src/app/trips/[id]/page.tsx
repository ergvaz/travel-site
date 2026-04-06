'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ForestBackground from '@/components/ForestBackground'
import Navbar from '@/components/Navbar'
import ShareModal from '@/components/trip/ShareModal'
import { supabase } from '@/lib/supabase'
import type { Trip, GeneratedTrip } from '@/types'
import type { User } from '@supabase/supabase-js'

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number | null>(0)
  const [tab, setTab] = useState<'itinerary' | 'flights' | 'hotels' | 'food' | 'tips'>('itinerary')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    if (id && !id.startsWith('demo')) {
      fetch(`/api/trips/${id}`)
        .then(r => r.json())
        .then(json => { if (json.trip) setTrip(json.trip) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [id])

  const handleLike = async () => {
    if (!user) { router.push('/auth/login'); return }
    if (!trip) return
    if (liked) {
      await supabase.from('trip_likes').delete().eq('trip_id', trip.id).eq('user_id', user.id)
      setTrip(t => t ? { ...t, likes_count: (t.likes_count || 1) - 1 } : t)
    } else {
      await supabase.from('trip_likes').insert({ trip_id: trip.id, user_id: user.id })
      setTrip(t => t ? { ...t, likes_count: (t.likes_count || 0) + 1 } : t)
    }
    setLiked(!liked)
  }

  const handleUseTrip = () => {
    if (!trip?.itinerary) return
    router.push('/plan')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--forest-dark)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--gold) transparent transparent transparent' }} />
    </div>
  )

  if (!trip) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--forest-dark)' }}>
      <div className="text-4xl">🗺</div>
      <h2 className="text-xl font-bold">Trip not found</h2>
      <Link href="/discover" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold">Browse Trips</Link>
    </div>
  )

  const itinerary = trip.itinerary as GeneratedTrip | undefined

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--forest-dark)' }}>
      <ForestBackground />
      <Navbar />
      <div className="relative pt-28 pb-16 px-4 md:px-6" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="forest-card p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Link href="/discover" style={{ color: 'var(--text-muted)' }}>Discover</Link>
                  <span>›</span>
                  <span>{trip.destination}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>{trip.title}</h1>
                {itinerary?.summary && <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{itinerary.summary}</p>}
                <div className="flex flex-wrap gap-3 text-sm">
                  {[`📍 ${trip.destination}`, `📅 ${trip.days} days`, `${trip.travel_mode === 'fly' ? '✈️' : '🚗'} ${trip.travel_mode === 'fly' ? 'Flying' : 'Driving'}`].map(p => (
                    <div key={p} className="px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.15)', color: 'var(--text-secondary)' }}>{p}</div>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {trip.total_estimated_cost && (
                  <div className="text-3xl font-bold mb-1" style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif' }}>${trip.total_estimated_cost.toLocaleString()}</div>
                )}
                <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>estimated total</div>
              </div>
            </div>

            {trip.profiles && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--forest-border)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg,#c8a84b,#a8882b)', color: '#060b06' }}>
                  {(trip.profiles.full_name || 'U')[0].toUpperCase()}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>by {trip.profiles.full_name || trip.profiles.username}</span>
                <div className="ml-auto flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>👁 {trip.view_count?.toLocaleString()}</span>
                  <span>❤️ {trip.likes_count?.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-5">
              <button onClick={handleLike} className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2" style={{ color: liked ? '#f87171' : undefined, borderColor: liked ? 'rgba(248,113,113,0.3)' : undefined }}>
                {liked ? '❤️' : '🤍'} {liked ? 'Liked' : 'Like'}
              </button>
              <button onClick={() => setShowShare(true)} className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share
              </button>
              <button onClick={handleUseTrip} className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold">
                Use This Itinerary →
              </button>
            </div>
          </div>

          {/* Season + weather */}
          {itinerary?.currentSeasonNote && (
            <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.15)', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Seasonal note: </span>{itinerary.currentSeasonNote}
            </div>
          )}

          {/* Tabs */}
          {itinerary && (
            <div className="forest-card overflow-hidden">
              <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--forest-border)' }}>
                {(['itinerary', 'flights', 'hotels', 'food', 'tips'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className="px-5 py-4 text-sm font-medium capitalize whitespace-nowrap transition-all"
                    style={{ color: tab === t ? 'var(--gold)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent', background: tab === t ? 'rgba(200,168,75,0.05)' : 'transparent' }}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {tab === 'itinerary' && (
                  <div className="space-y-3">
                    {itinerary.itinerary?.map((day, i) => (
                      <div key={day.day} className="day-card">
                        <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setExpandedDay(expandedDay === i ? null : i)}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--gold)', border: '1px solid rgba(200,168,75,0.3)' }}>{day.day}</div>
                            <div>
                              <div className="font-semibold text-sm">{day.theme}</div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Est. ${day.estimatedCost?.toLocaleString()}</div>
                            </div>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)', transform: expandedDay === i ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}><path d="M6 9l6 6 6-6"/></svg>
                        </button>
                        {expandedDay === i && (
                          <div className="px-4 pb-4 space-y-3">
                            {[{ label: '🌅 Morning', data: day.morning }, { label: '☀️ Afternoon', data: day.afternoon }, { label: '🌙 Evening', data: day.evening }].map(({ label, data }) => (
                              <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(200,168,75,0.08)' }}>
                                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>{label}</div>
                                <div className="font-medium text-sm mb-1">{data.title}</div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{data.description}</div>
                                {data.tips && <div className="text-xs mt-1 italic" style={{ color: 'var(--gold)' }}>💡 {data.tips}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'flights' && (
                  <div className="space-y-4">
                    {itinerary.flights?.map((f, i) => (
                      <div key={i} className="p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap" style={{ background: 'rgba(200,168,75,0.04)', border: '1px solid rgba(200,168,75,0.12)' }}>
                        <div>
                          <div className="font-semibold">{f.airline} · {f.flightNumber}</div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.departure} → {f.arrival} · {f.duration}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.stops === 0 ? 'Nonstop' : `${f.stops} stop(s)`}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold" style={{ color: 'var(--gold)' }}>${f.price?.toLocaleString()}</div>
                          <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-block btn-gold px-4 py-1.5 rounded-lg text-xs font-semibold mt-1">Book →</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'hotels' && (
                  <div className="space-y-4">
                    {itinerary.hotels?.map((h, i) => (
                      <div key={i} className="p-4 rounded-xl flex items-start justify-between gap-4 flex-wrap" style={{ background: 'rgba(200,168,75,0.04)', border: '1px solid rgba(200,168,75,0.12)' }}>
                        <div className="flex-1">
                          <div className="font-semibold">{h.name} {'★'.repeat(h.stars)}</div>
                          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>📍 {h.neighborhood}</div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{h.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold" style={{ color: 'var(--gold)' }}>${h.pricePerNight}/night</div>
                          <a href={h.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-block btn-gold px-4 py-1.5 rounded-lg text-xs font-semibold mt-1">Book →</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'food' && (
                  <div className="space-y-3">
                    {itinerary.restaurants?.map((r, i) => (
                      <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(200,168,75,0.04)', border: '1px solid rgba(200,168,75,0.12)' }}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="font-semibold">{r.name} <span style={{ color: 'var(--gold)' }}>{r.priceRange}</span></div>
                            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{r.cuisine} · {r.neighborhood}</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.description}</div>
                            <div className="text-xs mt-1" style={{ color: 'var(--gold)' }}>Must try: {r.mustTry}</div>
                          </div>
                          {r.rating && <div className="font-bold flex-shrink-0" style={{ color: 'var(--gold)' }}>⭐ {r.rating}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'tips' && (
                  <div className="space-y-3">
                    {itinerary.tips?.map((t, i) => (
                      <div key={i} className="tip-card">
                        <div className="text-xs font-semibold uppercase mb-0.5" style={{ color: 'var(--gold)', letterSpacing: '0.1em' }}>{t.category}</div>
                        <div className="font-semibold text-sm mb-0.5">{t.title}</div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {showShare && itinerary && <ShareModal trip={itinerary} onClose={() => setShowShare(false)} />}
    </div>
  )
}
