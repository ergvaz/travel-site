'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ForestBackground from '@/components/ForestBackground'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import type { Profile, Achievement } from '@/types'
import type { User } from '@supabase/supabase-js'

const ALL_ACHIEVEMENTS = [
  { type: 'first_journey', label: 'First Journey', description: 'Planned your very first trip', icon: '✈️' },
  { type: 'explorer', label: 'Explorer', description: 'Planned 5 adventures', icon: '🧭' },
  { type: 'globetrotter', label: 'Globetrotter', description: 'Planned 10 trips', icon: '🌍' },
  { type: 'sharer', label: 'Storyteller', description: 'Published a trip publicly', icon: '📖' },
  { type: 'social', label: 'Socialite', description: 'Shared a trip with friends', icon: '🤝' },
  { type: 'budget_master', label: 'Budget Master', description: 'Planned a trip under $1,500', icon: '💎' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (prof) { setProfile(prof); setName(prof.full_name || ''); setBio(prof.bio || '') }
      const { data: ach } = await supabase.from('achievements').select('*').eq('user_id', data.user.id)
      if (ach) setAchievements(ach)
    })
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: name, bio, updated_at: new Date().toISOString() }).eq('id', user.id)
    setProfile(p => p ? { ...p, full_name: name, bio } : p)
    setEditing(false)
    setSaving(false)
  }

  const earnedTypes = new Set(achievements.map(a => a.type))

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--forest-dark)' }}>
      <ForestBackground />
      <Navbar />
      <div className="relative pt-28 pb-16 px-4 md:px-6" style={{ zIndex: 10 }}>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile card */}
          <div className="forest-card p-8">
            <div className="flex items-start gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c8a84b, #a8882b)', color: '#060b06' }}>
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                {editing ? (
                  <input type="text" className="forest-input w-full px-3 py-2 rounded-lg text-lg font-bold mb-2" value={name} onChange={e => setName(e.target.value)} />
                ) : (
                  <h1 className="text-2xl font-bold mb-1">{profile?.full_name || 'Anonymous Explorer'}</h1>
                )}
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Member since {profile ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</div>
              </div>
              <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving} className="btn-ghost px-4 py-2 rounded-lg text-sm font-semibold">
                {saving ? 'Saving…' : editing ? 'Save' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <textarea rows={2} className="forest-input w-full px-3 py-2 rounded-lg text-sm resize-none" placeholder="Write a short bio…" value={bio} onChange={e => setBio(e.target.value)} />
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile?.bio || 'No bio yet. Tell the world about your travel style.'}</p>
            )}

            <div className="flex gap-4 mt-5 pt-5 border-t" style={{ borderColor: 'var(--forest-border)' }}>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-gradient">{profile?.trips_count || 0}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Trips Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-gradient">{achievements.length}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Achievements</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="forest-card p-6">
            <h2 className="text-lg font-bold mb-5" style={{ fontFamily: 'Georgia, serif' }}>Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_ACHIEVEMENTS.map(a => {
                const earned = earnedTypes.has(a.type)
                return (
                  <div key={a.type} className="achievement-badge" style={{ opacity: earned ? 1 : 0.35, filter: earned ? 'none' : 'grayscale(1)' }}>
                    <div className="text-3xl mb-2">{a.icon}</div>
                    <div className="text-xs font-bold mb-0.5" style={{ color: earned ? 'var(--gold)' : 'var(--text-muted)' }}>{a.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.description}</div>
                    {earned && <div className="text-xs mt-1" style={{ color: '#4ade80' }}>✓ Earned</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
