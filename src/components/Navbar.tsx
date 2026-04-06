'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(6,11,6,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(200,168,75,0.1)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(200,168,75,0.3), rgba(200,168,75,0.1))', border: '1px solid rgba(200,168,75,0.4)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 17l4-8 4 6 3-4 4 6"/>
              <path d="M12 3v2M3 12H1M23 12h-2"/>
            </svg>
          </div>
          <span className="text-gold-gradient font-bold text-xl tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>WanderAI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/plan" active={pathname === '/plan'}>Plan Trip</NavLink>
          <NavLink href="/discover" active={pathname === '/discover'}>Discover</NavLink>
          {user && <NavLink href="/trips" active={pathname === '/trips'}>My Trips</NavLink>}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 group">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #c8a84b, #a8882b)', color: '#060b06' }}
                >
                  {(user.email?.[0] || 'U').toUpperCase()}
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="btn-ghost text-sm px-4 py-2 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="btn-ghost text-sm px-4 py-2 rounded-lg">Sign In</Link>
              <Link
                href="/auth/signup"
                className="btn-gold text-sm px-5 py-2 rounded-lg relative"
                style={{ borderRadius: '10px' }}
              >
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden btn-ghost p-2 rounded-lg"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ background: 'rgba(6,11,6,0.96)', borderColor: 'rgba(200,168,75,0.1)' }}
        >
          <MobileNavLink href="/plan" onClick={() => setMenuOpen(false)}>Plan Trip</MobileNavLink>
          <MobileNavLink href="/discover" onClick={() => setMenuOpen(false)}>Discover</MobileNavLink>
          {user && <MobileNavLink href="/trips" onClick={() => setMenuOpen(false)}>My Trips</MobileNavLink>}
          {user && <MobileNavLink href="/profile" onClick={() => setMenuOpen(false)}>Profile</MobileNavLink>}
          {user ? (
            <button onClick={handleSignOut} className="text-left text-sm" style={{ color: 'var(--text-muted)' }}>Sign Out</button>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'rgba(200,168,75,0.1)' }}>
              <Link href="/auth/login" className="text-sm" style={{ color: 'var(--gold)' }}>Sign In</Link>
              <Link href="/auth/signup" className="btn-gold text-sm px-4 py-2 rounded-lg text-center">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium transition-colors duration-200"
      style={{ color: active ? 'var(--gold)' : 'var(--text-secondary)' }}
      onMouseEnter={e => !active && (e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => !active && (e.currentTarget.style.color = 'var(--text-secondary)')}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
      {children}
    </Link>
  )
}
