import { Suspense } from 'react'
import ForestBackground from '@/components/ForestBackground'
import Navbar from '@/components/Navbar'
import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--forest-dark)' }}>
      <ForestBackground />
      <Navbar />
      <div className="relative pt-32 pb-16 px-4" style={{ zIndex: 10 }}>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>Welcome back</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to your WanderAI account</p>
          </div>
          <div className="forest-card p-8">
            <Suspense>
              <AuthForm mode="login" />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
