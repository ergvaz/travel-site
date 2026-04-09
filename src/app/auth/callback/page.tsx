'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ForestBackground from '@/components/ForestBackground'

function CallbackInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    // Supabase may send error params when auth fails (e.g. database error)
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const desc = searchParams.get('error_description')
      setErrMsg(desc?.replace(/\+/g, ' ') || errorParam)
      setStatus('error')
      return
    }

    const code = searchParams.get('code')

    if (code) {
      // PKCE flow — exchange code for session
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setErrMsg(error.message)
          setStatus('error')
        } else {
          router.replace('/')
        }
      })
      return
    }

    // No code in query — could be implicit flow (token in URL hash)
    // or the user navigated here directly.
    // Use onAuthStateChange so we catch the session even if the SDK
    // processes the hash asynchronously after mount.
    let settled = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (settled) return
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        settled = true
        subscription.unsubscribe()
        router.replace('/')
      }
    })

    // Also check immediately — session may already be set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !settled) {
        settled = true
        subscription.unsubscribe()
        router.replace('/')
      }
    })

    // After 10 s with no session, give up and show an error
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        subscription.unsubscribe()
        setErrMsg('No auth code received. Please try signing in again.')
        setStatus('error')
      }
    }, 10000)

    return () => {
      settled = true
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen relative flex items-center justify-center" style={{ background: 'var(--forest-dark)' }}>
      <ForestBackground />
      <div className="relative z-10 text-center space-y-4">
        {status === 'loading' ? (
          <>
            <div className="w-12 h-12 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--gold) transparent transparent transparent' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Signing you in…</p>
          </>
        ) : (
          <>
            <p className="text-sm" style={{ color: '#f87171' }}>{errMsg}</p>
            <button onClick={() => router.push('/auth/login')} className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold">
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  )
}
