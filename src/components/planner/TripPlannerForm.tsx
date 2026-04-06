'use client'

import { useState } from 'react'
import type { TripFormData } from '@/types'

const PREFERENCES = [
  { id: 'food', label: 'Food & Dining', icon: '🍽' },
  { id: 'views', label: 'Scenic Views', icon: '🏔' },
  { id: 'history', label: 'History & Culture', icon: '🏛' },
  { id: 'nature', label: 'Nature & Hiking', icon: '🌿' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌙' },
  { id: 'shopping', label: 'Shopping', icon: '🛍' },
  { id: 'adventure', label: 'Adventure Sports', icon: '🏄' },
  { id: 'relaxation', label: 'Relaxation & Spa', icon: '🛁' },
  { id: 'art', label: 'Art & Museums', icon: '🎨' },
  { id: 'local', label: 'Local Experiences', icon: '🤝' },
  { id: 'pet_friendly', label: 'Pet Friendly', icon: '🐾' },
  { id: 'family', label: 'Family Friendly', icon: '👨‍👩‍👧' },
  { id: 'romantic', label: 'Romantic', icon: '💑' },
  { id: 'budget', label: 'Budget Conscious', icon: '💰' },
  { id: 'luxury', label: 'Luxury', icon: '✨' },
]

interface Props { onSubmit: (data: TripFormData) => void }

export default function TripPlannerForm({ onSubmit }: Props) {
  const [form, setForm] = useState<TripFormData>({
    destination: '',
    budget: 3000,
    days: 7,
    travelMode: 'fly',
    preferences: [],
  })

  const togglePref = (id: string) => {
    setForm(f => ({
      ...f,
      preferences: f.preferences.includes(id)
        ? f.preferences.filter(p => p !== id)
        : [...f.preferences, id],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.destination.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="forest-card p-8 space-y-8">
      {/* Destination */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
          Where do you want to go? *
        </label>
        <input
          type="text"
          required
          className="forest-input w-full px-4 py-3 rounded-xl text-base"
          placeholder="e.g. Tokyo, Japan · Tuscany, Italy · Patagonia"
          value={form.destination}
          onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
        />
      </div>

      {/* Budget + Days row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
            Total Budget (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>$</span>
            <input
              type="number"
              min={500}
              max={100000}
              className="forest-input w-full pl-8 pr-4 py-3 rounded-xl text-base"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total for 2 people</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
            Number of Days
          </label>
          <input
            type="number"
            min={1}
            max={30}
            className="forest-input w-full px-4 py-3 rounded-xl text-base"
            value={form.days}
            onChange={e => setForm(f => ({ ...f, days: Number(e.target.value) }))}
          />
        </div>
      </div>

      {/* Start date (optional) */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
          When are you going? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          type="date"
          className="forest-input w-full px-4 py-3 rounded-xl text-base"
          value={form.startDate || ''}
          onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Helps us account for seasonality, crowds, and events</p>
      </div>

      {/* Travel mode */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--gold)' }}>
          How are you getting there?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['fly', 'drive'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setForm(f => ({ ...f, travelMode: mode }))}
              className="pref-chip py-4 rounded-xl flex flex-col items-center gap-2 transition-all"
              style={form.travelMode === mode ? {
                borderColor: 'var(--gold)',
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--gold)',
              } : {}}
            >
              <span className="text-2xl">{mode === 'fly' ? '✈️' : '🚗'}</span>
              <span className="text-sm font-semibold capitalize">{mode === 'fly' ? 'Flying' : 'Driving'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Starting address (driving only) */}
      {form.travelMode === 'drive' && (
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
            Starting Address
          </label>
          <input
            type="text"
            required
            className="forest-input w-full px-4 py-3 rounded-xl text-base"
            placeholder="e.g. 123 Main St, New York, NY"
            value={form.startingAddress || ''}
            onChange={e => setForm(f => ({ ...f, startingAddress: e.target.value }))}
          />
        </div>
      )}

      {/* Preferences */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--gold)' }}>
          What do you want from this trip?
        </label>
        <div className="flex flex-wrap gap-2">
          {PREFERENCES.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePref(p.id)}
              className={`pref-chip px-4 py-2 rounded-xl text-sm flex items-center gap-1.5${form.preferences.includes(p.id) ? ' active' : ''}`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Special requests */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
          Anything else? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          rows={3}
          className="forest-input w-full px-4 py-3 rounded-xl text-sm resize-none"
          placeholder="e.g. I want to see the Eiffel Tower · I don't want to stay in a large resort · Vegetarian-friendly restaurants only"
          value={form.specialRequests || ''}
          onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
        />
      </div>

      {/* Budget summary */}
      <div className="p-4 rounded-xl" style={{ background: 'rgba(200,168,75,0.05)', border: '1px solid rgba(200,168,75,0.1)' }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Budget per person</span>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>${Math.round(form.budget / 2).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span style={{ color: 'var(--text-secondary)' }}>Per day (total)</span>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>${Math.round(form.budget / form.days).toLocaleString()}</span>
        </div>
      </div>

      <button
        type="submit"
        className="btn-gold w-full py-4 rounded-2xl text-base font-bold tracking-wide"
        style={{ letterSpacing: '0.03em' }}
      >
        <span className="flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Generate My Trip with AI
        </span>
      </button>
    </form>
  )
}
