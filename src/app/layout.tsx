import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WanderAI — Your AI Travel Companion',
  description: 'Plan your perfect trip with AI-powered travel planning. Real flights, hotels, and day-by-day itineraries tailored to your budget.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen`}>{children}</body>
    </html>
  )
}
