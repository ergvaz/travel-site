'use client'

import { useState } from 'react'

interface Props {
  value?: string
  onChange: (date: string) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarPicker({ value, onChange }: Props) {
  const today = new Date()
  today.setHours(0,0,0,0)

  const initial = value ? new Date(value + 'T00:00:00') : today
  const [viewing, setViewing] = useState({ year: initial.getFullYear(), month: initial.getMonth() })
  const [open, setOpen] = useState(false)

  const selected = value ? new Date(value + 'T00:00:00') : null

  const firstDay = new Date(viewing.year, viewing.month, 1).getDay()
  const daysInMonth = new Date(viewing.year, viewing.month + 1, 0).getDate()

  const prevMonth = () => setViewing(v => {
    if (v.month === 0) return { year: v.year - 1, month: 11 }
    return { year: v.year, month: v.month - 1 }
  })
  const nextMonth = () => setViewing(v => {
    if (v.month === 11) return { year: v.year + 1, month: 0 }
    return { year: v.year, month: v.month + 1 }
  })

  const selectDate = (day: number) => {
    const d = new Date(viewing.year, viewing.month, day)
    if (d < today) return
    const iso = d.toISOString().split('T')[0]
    onChange(iso)
    setOpen(false)
  }

  const displayLabel = selected
    ? selected.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Select a date'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="forest-input w-full px-4 py-3 rounded-xl text-sm text-left flex items-center justify-between"
        style={{ color: selected ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        <span>{displayLabel}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 mt-2 z-40 rounded-2xl p-4 w-72"
            style={{ background: 'rgba(12,18,12,0.98)', border: '1px solid var(--forest-border)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span className="font-semibold text-sm" style={{ color: 'var(--gold)' }}>
                {MONTHS[viewing.month]} {viewing.year}
              </span>
              <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--text-muted)' }}>{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = new Date(viewing.year, viewing.month, day)
                const isPast = date < today
                const isSelected = selected &&
                  selected.getFullYear() === viewing.year &&
                  selected.getMonth() === viewing.month &&
                  selected.getDate() === day
                const isToday = date.toDateString() === today.toDateString()

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => selectDate(day)}
                    className="w-9 h-9 rounded-lg text-xs font-medium mx-auto flex items-center justify-center transition-all"
                    style={{
                      color: isPast ? 'var(--text-muted)' : isSelected ? '#060b06' : isToday ? 'var(--gold)' : 'var(--text-primary)',
                      background: isSelected ? 'var(--gold)' : isToday ? 'rgba(200,168,75,0.12)' : 'transparent',
                      cursor: isPast ? 'not-allowed' : 'pointer',
                      opacity: isPast ? 0.3 : 1,
                    }}
                    onMouseEnter={e => { if (!isPast && !isSelected) e.currentTarget.style.background = 'rgba(200,168,75,0.15)' }}
                    onMouseLeave={e => { if (!isPast && !isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Clear */}
            {selected && (
              <button type="button" onClick={() => { onChange(''); setOpen(false) }}
                className="w-full text-center text-xs mt-3 pt-3 border-t"
                style={{ borderColor: 'var(--forest-border)', color: 'var(--text-muted)' }}>
                Clear date
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
