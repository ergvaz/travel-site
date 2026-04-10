'use client'

import { useState, useEffect, useRef } from 'react'

interface Suggestion {
  display: string   // short: "City, State" or "City, Country"
  full: string      // Nominatim display_name (shown below as hint)
}

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export default function LocationAutocomplete({ value, onChange, placeholder, required }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (value.length < 2) { setSuggestions([]); setOpen(false); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=6&addressdetails=1&featuretype=city`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data: Array<{
          display_name: string
          address: {
            city?: string; town?: string; village?: string; county?: string
            state?: string; country?: string; country_code?: string
          }
        }> = await res.json()

        const seen = new Set<string>()
        const results: Suggestion[] = []

        for (const item of data) {
          const a = item.address
          const city = a.city || a.town || a.village || a.county || ''
          const isUS = a.country_code === 'us'
          const display = isUS
            ? [city, a.state].filter(Boolean).join(', ')
            : [city, a.country].filter(Boolean).join(', ')

          if (!display || seen.has(display)) continue
          seen.add(display)
          results.push({ display, full: item.display_name })
        }

        setSuggestions(results)
        setOpen(results.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 380)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [value])

  return (
    <div className="relative">
      <input
        type="text"
        required={required}
        className="forest-input w-full px-4 py-3 rounded-xl text-base"
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(8,14,8,0.98)',
            border: '1px solid rgba(200,168,75,0.35)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-4 py-2.5 transition-colors"
              style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(200,168,75,0.08)' : 'none' }}
              onMouseDown={() => { onChange(s.display); setOpen(false) }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,168,75,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.display}</div>
              <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{s.full}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
