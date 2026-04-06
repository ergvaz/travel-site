'use client'

import { useState } from 'react'
import type { GeneratedTrip } from '@/types'

interface Props { trip: GeneratedTrip; onClose: () => void }

export default function ShareModal({ trip, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [tab, setTab] = useState<'copy' | 'email' | 'social'>('copy')

  const handleCopy = async () => {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'text', trip }),
    })
    const json = await res.json()
    if (json.text) {
      await navigator.clipboard.writeText(json.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleEmail = async () => {
    if (!email) return
    setSending(true)
    await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'email', trip, email }),
    })
    setSending(false)
    setEmailSent(true)
  }

  const shareToX = () => {
    const text = `Just planned my dream trip to ${trip.destination} with @WanderAI! ✈️ ${trip.days || ''} days for $${trip.totalEstimatedCost?.toLocaleString()} #travel #wanderai`
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareToInstagram = () => {
    // Instagram doesn't support deep link sharing — copy text instead
    const caption = `✈️ ${trip.title}\n📍 ${trip.destination}, ${trip.country}\n💰 $${trip.totalEstimatedCost?.toLocaleString()} total\n\n${trip.summary}\n\nPlanned with WanderAI #travel #${trip.destination?.replace(/\s/g, '')} #wanderlust`
    navigator.clipboard.writeText(caption)
    alert('Caption copied! Paste it when posting to Instagram.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="forest-card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Georgia, serif' }}>Share Your Trip</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--forest-border)' }}>
          {(['copy', 'email', 'social'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{ background: tab === t ? 'rgba(200,168,75,0.2)' : 'transparent', color: tab === t ? 'var(--gold)' : 'var(--text-muted)' }}>
              {t === 'copy' ? '📋 Copy' : t === 'email' ? '✉️ Email' : '📱 Social'}
            </button>
          ))}
        </div>

        {tab === 'copy' && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Copy the full itinerary as plain text — perfect for messaging friends or saving to notes.
            </p>
            <button onClick={handleCopy} className="btn-gold w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              {copied ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy Full Itinerary</>
              )}
            </button>
          </div>
        )}

        {tab === 'email' && (
          <div className="space-y-3">
            {!emailSent ? (
              <>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Send the full itinerary to any email address.</p>
                <input type="email" className="forest-input w-full px-4 py-3 rounded-xl text-sm" placeholder="friend@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                <button onClick={handleEmail} disabled={!email || sending} className="btn-gold w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {sending ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Sending…</> : 'Send Itinerary'}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✉️</div>
                <div className="font-semibold" style={{ color: '#4ade80' }}>Sent to {email}!</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Full itinerary delivered.</div>
              </div>
            )}
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Share your trip with the world.</p>
            <button onClick={shareToX} className="w-full flex items-center gap-3 p-4 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--forest-border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--forest-border)'}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#000', color: '#fff', fontWeight: 800, fontSize: '14px' }}>𝕏</div>
              <div className="text-left">
                <div className="text-sm font-semibold">Share on X (Twitter)</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Post about your upcoming trip</div>
              </div>
            </button>
            <button onClick={shareToInstagram} className="w-full flex items-center gap-3 p-4 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--forest-border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--forest-border)'}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>📷</div>
              <div className="text-left">
                <div className="text-sm font-semibold">Copy for Instagram</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Caption copied for your post</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
