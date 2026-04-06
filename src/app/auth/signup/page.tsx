import { Suspense } from 'react'
import ForestBackground from '@/components/ForestBackground'
import Navbar from '@/components/Navbar'
import AuthForm from '@/components/auth/AuthForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--forest-dark)' }}>
      <ForestBackground />
      <Navbar />
      <div className="relative pt-32 pb-16 px-4" style={{ zIndex: 10 }}>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>Start exploring</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Create your free WanderAI account</p>
          </div>
          <div className="forest-card p-8">
            <Suspense>
              <AuthForm mode="signup" />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
