'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ForestBackground from '@/components/ForestBackground'
import Navbar from '@/components/Navbar'
import TripPlannerForm from '@/components/planner/TripPlannerForm'
import TripResult from '@/components/trip/TripResult'
import TripChatbot from '@/components/trip/TripChatbot'
import { supabase } from '@/lib/supabase'
import type { TripFormData, GeneratedTrip } from '@/types'
import type { User } from '@supabase/supabase-js'

type Phase = 'form' | 'loading' | 'result'

function PlanPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillDestination = searchParams.get('destination') || ''
  const [phase, setPhase] = useState<Phase>('form')
  const [trip, setTrip] = useState<GeneratedTrip | null>(null)
  const [formData, setFormData] = useState<TripFormData | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedTripId, setSavedTripId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('Researching your destination…')
  const [hasPlannedBefore, setHasPlannedBefore] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    // Check if anonymous user has already planned once
    const planned = localStorage.getItem('wander_planned')
    if (planned) setHasPlannedBefore(true)
    return () => subscription.unsubscribe()
  }, [])

  const LOADING_MESSAGES = [
    'Researching your destination…',
    'Checking seasonal conditions…',
    'Finding flights and hotels…',
    'Building your day-by-day itinerary…',
    'Gathering local tips and secrets…',
    'Putting it all together…',
  ]

  const handleSubmit = async (data: TripFormData) => {
    // Gate anonymous users after first plan
    if (!user && hasPlannedBefore) {
      router.push('/auth/signup?reason=plan')
      return
    }

    setFormData(data)
    setPhase('loading')
    setError(null)

    let msgIndex = 0
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[msgIndex])
    }, 2500)

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setTrip(json.trip)
      setPhase('result')
      if (!user) {
        localStorage.setItem('wander_planned', '1')
        setHasPlannedBefore(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to plan trip. Please try again.')
      setPhase('form')
    } finally {
      clearInterval(msgInterval)
    }
  }

  const handleSave = async () => {
    if (!user) { router.push('/auth/signup?reason=save'); return }
    if (!trip || !formData) return
    setSaving(true)
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData: trip, formData, userId: user.id }),
      })
      const json = await res.json()
      if (json.success) {
        setSaved(true)
        setSavedTripId(json.trip.id)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setPhase('form')
    setTrip(null)
    setFormData(null)
    setSaved(false)
    setSavedTripId(null)
    setError(null)
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--forest-dark)' }}>
      <ForestBackground />
      <Navbar />

      <div className="relative pt-24 pb-16 px-4 md:px-6" style={{ zIndex: 10 }}>
        {phase === 'form' && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                Plan your <span className="text-gold-gradient">perfect trip</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Tell us where you want to go and we'll handle the rest.
              </p>
              {!user && hasPlannedBefore && (
                <div className="mt-4 inline-block px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)', color: 'var(--gold)' }}>
                  Create a free account to plan more trips and save your itineraries.
                </div>
              )}
            </div>
            {error && (
              <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(180,60,30,0.15)', border: '1px solid rgba(200,80,40,0.3)', color: '#f87171' }}>
                {error}
              </div>
            )}
            <TripPlannerForm onSubmit={handleSubmit} prefillDestination={prefillDestination} />
          </div>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--gold) transparent transparent transparent' }} />
              <div className="absolute inset-3 rounded-full border-2 animate-spin" style={{ borderColor: 'transparent var(--gold) transparent transparent', animationDuration: '1.5s' }} />
              <div className="absolute inset-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,168,75,0.1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 17l4-8 4 6 3-4 4 6"/>
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--gold)' }}>{loadingMessage}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This takes 20–40 seconds. We're doing real research.</p>
            </div>
            <div className="flex gap-2">
              {LOADING_MESSAGES.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: LOADING_MESSAGES.indexOf(loadingMessage) === i ? 'var(--gold)' : 'var(--moss)' }} />
              ))}
            </div>
          </div>
        )}

        {phase === 'result' && trip && formData && (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main trip result */}
              <div className="flex-1 min-w-0">
                <TripResult
                  trip={trip}
                  formData={formData}
                  onSave={handleSave}
                  onReset={handleReset}
                  saving={saving}
                  saved={saved}
                  savedTripId={savedTripId}
                  user={user}
                />
              </div>
              {/* Chatbot sidebar */}
              <div className="lg:w-80 xl:w-96 flex-shrink-0">
                <div className="sticky top-28">
                  <TripChatbot trip={trip} onTripUpdate={setTrip} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlanPage() {
  return (
    <Suspense>
      <PlanPageInner />
    </Suspense>
  )
}
