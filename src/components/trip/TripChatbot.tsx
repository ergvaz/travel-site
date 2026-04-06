'use client'

import { useState, useRef, useEffect } from 'react'
import type { GeneratedTrip } from '@/types'

interface Message { role: 'user' | 'assistant'; content: string }

interface Props {
  trip: GeneratedTrip
  onTripUpdate: (trip: GeneratedTrip) => void
}

export default function TripChatbot({ trip, onTripUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `I've planned your trip to ${trip.destination}! What would you like to change? I can swap hotels, adjust the itinerary, find different restaurants, or answer any questions.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, trip, history: messages }),
      })
      const json = await res.json()
      if (json.success) {
        setMessages(m => [...m, { role: 'assistant', content: json.message }])
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I had trouble with that. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const QUICK = [
    'Find cheaper hotels',
    'More food options',
    'Add a day trip',
    'Best local tips',
    'What should I pack?',
    'Is it safe?',
  ]

  return (
    <div className="forest-card flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--forest-border)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold">Trip Agent</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Ask me anything about your trip</div>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai px-4 py-3 flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)', animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto" style={{ borderTop: '1px solid var(--forest-border)' }}>
        {QUICK.map(q => (
          <button
            key={q}
            onClick={() => { setInput(q); }}
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
            style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.15)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,168,75,0.15)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--forest-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            className="forest-input flex-1 px-3 py-2 rounded-xl text-sm"
            placeholder="Ask about your trip…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="btn-gold w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
