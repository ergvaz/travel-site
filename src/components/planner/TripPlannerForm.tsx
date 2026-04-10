'use client'

import { useState } from 'react'
import CalendarPicker from '@/components/ui/CalendarPicker'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import type { TripFormData } from '@/types'

const PREFERENCES = [
  { id: 'food',        label: 'Food & Dining',       icon: '🍽' },
  { id: 'views',       label: 'Scenic Views',         icon: '🏔' },
  { id: 'history',     label: 'History & Culture',    icon: '🏛' },
  { id: 'nature',      label: 'Nature & Hiking',      icon: '🌿' },
  { id: 'nightlife',   label: 'Nightlife',            icon: '🌙' },
  { id: 'shopping',    label: 'Shopping',             icon: '🛍' },
  { id: 'adventure',   label: 'Adventure Sports',     icon: '🏄' },
  { id: 'relaxation',  label: 'Relaxation & Spa',     icon: '🛁' },
  { id: 'art',         label: 'Art & Museums',        icon: '🎨' },
  { id: 'local',       label: 'Local Experiences',    icon: '🤝' },
  { id: 'pet_friendly',label: 'Pet Friendly',         icon: '🐾' },
  { id: 'family',      label: 'Family Friendly',      icon: '👨‍👩‍👧' },
  { id: 'romantic',    label: 'Romantic',             icon: '💑' },
  { id: 'budget',      label: 'Budget Conscious',     icon: '💰' },
  { id: 'luxury',      label: 'Luxury',               icon: '✨' },
]

const BUDGET_PRESETS = [1500, 3000, 5000, 8000, 15000]

interface Props {
  onSubmit: (data: TripFormData) => void
  prefillDestination?: string
}

export default function TripPlannerForm({ onSubmit, prefillDestination }: Props) {
  const [form, setForm] = useState<TripFormData>({
    destination: prefillDestination || '',
    origin: '',
    budget: 5000,
    days: 7,
    people: 2,
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
    if (!form.destination.trim() || !form.origin.trim()) return
    onSubmit(form)
  }

  const budgetPerPerson = Math.round(form.budget / form.people)
  const budgetPerDay    = Math.round(form.budget / form.days)

  return (
    <form onSubmit={handleSubmit} className="forest-card p-8 space-y-8">

      {/* Origin */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
          Where are you coming from? *
        </label>
        <LocationAutocomplete
          required
          placeholder="e.g. New York, NY · Chicago, IL · Los Angeles, CA"
          value={form.origin}
          onChange={v => setForm(f => ({ ...f, origin: v }))}
        />
      </div>

      {/* Destination */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
          Where do you want to go? *
        </label>
        <LocationAutocomplete
          required
          placeholder="e.g. Tokyo, Japan · Tuscany, Italy · Patagonia"
          value={form.destination}
          onChange={v => setForm(f => ({ ...f, destination: v }))}
        />
      </div>

      {/* Budget slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>Total Budget (USD)</label>
          <span className="text-2xl font-bold" style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif' }}>
            ${form.budget.toLocaleString()}
          </span>
        </div>
        <div className="relative mb-3">
          <input
            type="range"
            min={500}
            max={50000}
            step={250}
            value={form.budget}
            onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--gold) 0%, var(--gold) ${((form.budget - 500) / 49500) * 100}%, var(--moss) ${((form.budget - 500) / 49500) * 100}%, var(--moss) 100%)`,
              accentColor: 'var(--gold)',
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {BUDGET_PRESETS.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setForm(f => ({ ...f, budget: b }))}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                border: form.budget === b ? '1px solid var(--gold)' : '1px solid var(--forest-border)',
                background: form.budget === b ? 'rgba(200,168,75,0.15)' : 'transparent',
                color: form.budget === b ? 'var(--gold)' : 'var(--text-muted)',
              }}
            >
              ${b.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Per person: <span style={{ color: 'var(--text-secondary)' }}>${budgetPerPerson.toLocaleString()}</span></span>
          <span>Per day: <span style={{ color: 'var(--text-secondary)' }}>${budgetPerDay.toLocaleString()}</span></span>
        </div>
      </div>

      {/* Days + People */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>Number of Days</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setForm(f => ({ ...f, days: Math.max(1, f.days - 1) }))}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg btn-ghost flex-shrink-0">−</button>
            <div className="forest-input flex-1 py-2.5 rounded-xl text-center text-lg font-bold" style={{ color: 'var(--gold)' }}>{form.days}</div>
            <button type="button" onClick={() => setForm(f => ({ ...f, days: Math.min(30, f.days + 1) }))}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg btn-ghost flex-shrink-0">+</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>Number of People</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setForm(f => ({ ...f, people: Math.max(1, f.people - 1) }))}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg btn-ghost flex-shrink-0">−</button>
            <div className="forest-input flex-1 py-2.5 rounded-xl text-center text-lg font-bold" style={{ color: 'var(--gold)' }}>{form.people}</div>
            <button type="button" onClick={() => setForm(f => ({ ...f, people: Math.min(20, f.people + 1) }))}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg btn-ghost flex-shrink-0">+</button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {form.people === 1 ? 'Solo traveler' : form.people === 2 ? 'Couple / duo' : form.people <= 5 ? 'Small group' : 'Large group'} · {form.people <= 2 ? '1 room' : form.people <= 4 ? '2 rooms' : `${Math.ceil(form.people / 2)} rooms`}
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
          When are you going? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <CalendarPicker
          value={form.startDate}
          onChange={date => setForm(f => ({ ...f, startDate: date }))}
        />
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          Helps us account for seasonality, crowds, weather, and events
        </p>
      </div>

      {/* Travel mode */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--gold)' }}>How are you getting there?</label>
        <div className="grid grid-cols-2 gap-3">
          {(['fly', 'drive'] as const).map(mode => (
            <button key={mode} type="button" onClick={() => setForm(f => ({ ...f, travelMode: mode }))}
              className="pref-chip py-4 rounded-xl flex flex-col items-center gap-2 transition-all"
              style={form.travelMode === mode ? { borderColor: 'var(--gold)', background: 'rgba(200,168,75,0.15)', color: 'var(--gold)' } : {}}>
              <span className="text-2xl">{mode === 'fly' ? '✈️' : '🚗'}</span>
              <span className="text-sm font-semibold">{mode === 'fly' ? 'Flying' : 'Driving'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--gold)' }}>What do you want from this trip?</label>
        <div className="flex flex-wrap gap-2">
          {PREFERENCES.map(p => (
            <button key={p.id} type="button" onClick={() => togglePref(p.id)}
              className={`pref-chip px-4 py-2 rounded-xl text-sm flex items-center gap-1.5${form.preferences.includes(p.id) ? ' active' : ''}`}>
              <span>{p.icon}</span>{p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Special requests */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>
          Anything else? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea rows={3} className="forest-input w-full px-4 py-3 rounded-xl text-sm resize-none"
          placeholder="e.g. I want to see the Eiffel Tower · No large resort complexes · Vegetarian-friendly only"
          value={form.specialRequests || ''}
          onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} />
      </div>

      <button type="submit" className="btn-gold w-full py-4 rounded-2xl text-base font-bold" style={{ letterSpacing: '0.03em' }}>
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
