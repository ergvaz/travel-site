'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { GeneratedTrip, TripFormData } from '@/types'
import type { User } from '@supabase/supabase-js'
import ShareModal from './ShareModal'

interface Props {
  trip: GeneratedTrip
  formData: TripFormData
  onSave: () => void
  onReset: () => void
  saving: boolean
  saved: boolean
  savedTripId: string | null
  user: User | null
}

type Tab = 'overview' | 'itinerary' | 'flights' | 'hotels' | 'food' | 'tips'

export default function TripResult({ trip, formData, onSave, onReset, saving, saved, savedTripId, user }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const [showShare, setShowShare] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number | null>(0)

  const budgetPct = Math.min((trip.totalEstimatedCost / (formData.budget || 1)) * 100, 120)
  const isOver = trip.isOverBudget

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="forest-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                AI-Generated Itinerary
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              {trip.title}
            </h1>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{trip.summary}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <InfoPill icon="📍">{trip.destination}, {trip.country}</InfoPill>
              <InfoPill icon="📅">{formData.days} days</InfoPill>
              <InfoPill icon={formData.travelMode === 'fly' ? '✈️' : '🚗'}>{formData.travelMode === 'fly' ? 'Flying' : 'Driving'}</InfoPill>
              {trip.weatherExpectation && <InfoPill icon="🌤">{trip.weatherExpectation}</InfoPill>}
            </div>
          </div>

          {/* Cost summary */}
          <div className="forest-card p-5 md:min-w-[200px]" style={{ background: 'rgba(10,15,10,0.8)' }}>
            <div className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              Estimated Total
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: isOver ? '#f87171' : 'var(--gold)', fontFamily: 'Georgia, serif' }}>
              ${trip.totalEstimatedCost?.toLocaleString()}
            </div>
            <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Budget: ${formData.budget?.toLocaleString()}
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full mb-2" style={{ background: 'var(--moss)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(budgetPct, 100)}%`, background: isOver ? 'linear-gradient(90deg,#f87171,#ef4444)' : 'linear-gradient(90deg,#c8a84b,#a8882b)' }}
              />
            </div>
            <div className="text-xs" style={{ color: isOver ? '#f87171' : 'var(--accent-green, #4ade80)' }}>
              {isOver ? `$${trip.budgetDifference?.toLocaleString()} over budget` : `$${trip.budgetDifference?.toLocaleString()} under budget`}
            </div>
          </div>
        </div>

        {/* Season note */}
        {trip.currentSeasonNote && (
          <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.15)', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Seasonal note: </span>{trip.currentSeasonNote}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          {!saved ? (
            <button onClick={onSave} disabled={saving} className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
              {saving ? (
                <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Saving…</>
              ) : (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save Trip</>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Trip Saved!
            </div>
          )}
          <button onClick={() => setShowShare(true)} className="btn-ghost px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
          <button onClick={onReset} className="btn-ghost px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            New Trip
          </button>
          {saved && savedTripId && (
            <Link href={`/trips/${savedTripId}`} className="btn-ghost px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
              View Public Page →
            </Link>
          )}
        </div>
      </div>

      {/* Over-budget alternatives */}
      {isOver && trip.alternativeDestinations && trip.alternativeDestinations.length > 0 && (
        <div className="over-budget-banner p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-2xl">⚡</div>
            <div>
              <h3 className="font-semibold" style={{ color: '#fb923c' }}>Over budget for {trip.destination}</h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Similar destinations that fit your ${formData.budget?.toLocaleString()} budget:
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {trip.alternativeDestinations.map((alt, i) => (
              <div key={i} className="alt-dest-card p-4" onClick={() => window.location.href = `/plan?dest=${encodeURIComponent(alt.destination)}&budget=${formData.budget}&days=${formData.days}`}>
                <div className="font-semibold mb-1">{alt.destination}</div>
                <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{alt.country} · {alt.vibe}</div>
                <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{alt.reason}</div>
                <div className="text-lg font-bold" style={{ color: 'var(--gold)' }}>${alt.estimatedCost?.toLocaleString()}</div>
                <div className="text-xs mt-1" style={{ color: '#4ade80' }}>
                  Saves ${((formData.budget || 0) - alt.estimatedCost)?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="forest-card overflow-hidden">
        <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--forest-border)' }}>
          {(['overview', 'itinerary', 'flights', 'hotels', 'food', 'tips'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-4 text-sm font-medium capitalize whitespace-nowrap transition-all"
              style={{
                color: tab === t ? 'var(--gold)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
                background: tab === t ? 'rgba(200,168,75,0.05)' : 'transparent',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'overview' && <OverviewTab trip={trip} />}
          {tab === 'itinerary' && <ItineraryTab trip={trip} expandedDay={expandedDay} setExpandedDay={setExpandedDay} />}
          {tab === 'flights' && <FlightsTab trip={trip} />}
          {tab === 'hotels' && <HotelsTab trip={trip} />}
          {tab === 'food' && <FoodTab trip={trip} />}
          {tab === 'tips' && <TipsTab trip={trip} />}
        </div>
      </div>

      {showShare && <ShareModal trip={trip} onClose={() => setShowShare(false)} />}
    </div>
  )
}

function InfoPill({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.15)', color: 'var(--text-secondary)' }}>
      <span>{icon}</span>{children}
    </div>
  )
}

function OverviewTab({ trip }: { trip: GeneratedTrip }) {
  return (
    <div className="space-y-6">
      {/* Budget breakdown */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Budget Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(trip.budgetBreakdown || {}).map(([key, val]) => (
            <div key={key} className="p-3 rounded-xl" style={{ background: 'rgba(200,168,75,0.05)', border: '1px solid rgba(200,168,75,0.1)' }}>
              <div className="text-xs capitalize mb-1" style={{ color: 'var(--text-muted)' }}>{key}</div>
              <div className="text-lg font-bold" style={{ color: 'var(--gold)' }}>${(val as number)?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Best time / season */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="tip-card">
          <div className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--gold)', letterSpacing: '0.1em' }}>Best Time to Visit</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{trip.bestTimeToVisit}</div>
        </div>
        <div className="tip-card">
          <div className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--gold)', letterSpacing: '0.1em' }}>Weather</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{trip.weatherExpectation}</div>
        </div>
      </div>
    </div>
  )
}

function ItineraryTab({ trip, expandedDay, setExpandedDay }: { trip: GeneratedTrip; expandedDay: number | null; setExpandedDay: (n: number | null) => void }) {
  return (
    <div className="space-y-3">
      {trip.itinerary?.map((day, i) => (
        <div key={day.day} className="day-card">
          <button
            className="w-full flex items-center justify-between p-4 text-left"
            onClick={() => setExpandedDay(expandedDay === i ? null : i)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--gold)', border: '1px solid rgba(200,168,75,0.3)' }}>
                {day.day}
              </div>
              <div>
                <div className="font-semibold text-sm">{day.theme}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Est. ${day.estimatedCost?.toLocaleString()}</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ color: 'var(--text-muted)', transform: expandedDay === i ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {expandedDay === i && (
            <div className="px-4 pb-4 space-y-3">
              {[{ time: '🌅', label: 'Morning', data: day.morning }, { time: '☀️', label: 'Afternoon', data: day.afternoon }, { time: '🌙', label: 'Evening', data: day.evening }].map(({ time, label, data }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(200,168,75,0.08)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{time}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>{label}</span>
                    {data.time && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {data.time}</span>}
                    {data.cost && <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{data.cost}</span>}
                  </div>
                  <div className="font-medium text-sm mb-1">{data.title}</div>
                  <div className="text-xs leading-relaxed mb-1" style={{ color: 'var(--text-secondary)' }}>{data.description}</div>
                  {data.location && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>📍 {data.location}</div>}
                  {data.tips && <div className="text-xs mt-1 italic" style={{ color: 'var(--gold)' }}>💡 {data.tips}</div>}
                </div>
              ))}
              <div className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>🏨 Stay: {day.accommodation}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function FlightsTab({ trip }: { trip: GeneratedTrip }) {
  return (
    <div className="space-y-4">
      {!trip.flights?.length && <p style={{ color: 'var(--text-muted)' }}>No flight data — driving itinerary.</p>}
      {trip.flights?.map((f, i) => (
        <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(200,168,75,0.04)', border: '1px solid rgba(200,168,75,0.12)' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--gold)', border: '1px solid rgba(200,168,75,0.3)' }}>
                {f.airline?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">{f.airline} · {f.flightNumber}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {f.departure} → {f.arrival} · {f.departureTime}–{f.arrivalTime} · {f.duration}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {f.stops === 0 ? 'Nonstop' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold" style={{ color: 'var(--gold)' }}>${f.price?.toLocaleString()}</div>
              <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>per person</div>
              <a
                href={f.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block btn-gold px-4 py-1.5 rounded-lg text-xs font-semibold"
              >
                Book →
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function HotelsTab({ trip }: { trip: GeneratedTrip }) {
  return (
    <div className="space-y-4">
      {trip.hotels?.map((h, i) => (
        <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(200,168,75,0.04)', border: '1px solid rgba(200,168,75,0.12)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-semibold">{h.name}</div>
                <div className="text-xs" style={{ color: 'var(--gold)' }}>{'★'.repeat(h.stars)}</div>
              </div>
              <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>📍 {h.neighborhood}</div>
              <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{h.description}</div>
              <div className="flex flex-wrap gap-2">
                {h.amenities?.slice(0, 5).map(a => (
                  <span key={a} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(200,168,75,0.08)', color: 'var(--text-secondary)', border: '1px solid rgba(200,168,75,0.12)' }}>{a}</span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold" style={{ color: 'var(--gold)' }}>${h.pricePerNight?.toLocaleString()}</div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>per night</div>
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Total: ${h.totalPrice?.toLocaleString()}</div>
              {h.rating && <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>⭐ {h.rating} ({h.reviewCount?.toLocaleString()} reviews)</div>}
              <a href={h.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-block btn-gold px-4 py-1.5 rounded-lg text-xs font-semibold">Book →</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FoodTab({ trip }: { trip: GeneratedTrip }) {
  return (
    <div className="space-y-3">
      {trip.restaurants?.map((r, i) => (
        <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(200,168,75,0.04)', border: '1px solid rgba(200,168,75,0.12)' }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-semibold">{r.name}</div>
                <span className="text-xs" style={{ color: 'var(--gold)' }}>{r.priceRange}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.cuisine}</span>
              </div>
              <div className="text-xs mt-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>📍 {r.neighborhood} · {r.bestFor}</div>
              <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{r.description}</div>
              <div className="text-xs" style={{ color: 'var(--gold)' }}>Must try: {r.mustTry}</div>
            </div>
            {r.rating && (
              <div className="text-right flex-shrink-0">
                <div className="font-bold" style={{ color: 'var(--gold)' }}>⭐ {r.rating}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.reviewCount?.toLocaleString()} reviews</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TipsTab({ trip }: { trip: GeneratedTrip }) {
  const categories = [...new Set(trip.tips?.map(t => t.category))]
  return (
    <div className="space-y-6">
      {categories.map(cat => (
        <div key={cat}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)', letterSpacing: '0.12em' }}>{cat}</h3>
          <div className="space-y-2">
            {trip.tips?.filter(t => t.category === cat).map((t, i) => (
              <div key={i} className="tip-card">
                <div className="font-semibold text-sm mb-0.5">{t.title}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.content}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
