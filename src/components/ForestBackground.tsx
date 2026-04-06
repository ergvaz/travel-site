'use client'

import { useEffect, useRef } from 'react'

export default function ForestBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2

      const layers = containerRef.current?.querySelectorAll<HTMLElement>('[data-parallax]')
      layers?.forEach(layer => {
        const depth = parseFloat(layer.dataset.parallax || '1')
        const moveX = x * depth * 12
        const moveY = y * depth * 8
        layer.style.transform = `translate(${moveX}px, ${moveY}px)`
      })
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      const layers = containerRef.current?.querySelectorAll<HTMLElement>('[data-scroll]')
      layers?.forEach(layer => {
        const speed = parseFloat(layer.dataset.scroll || '0.3')
        layer.style.transform = `translateY(${scrollY * speed}px)`
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base forest image */}
      <div
        data-parallax="0.3"
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{ willChange: 'transform', top: '-10%', left: '-5%', right: '-5%', bottom: '-10%' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/forest-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Deep darken overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(4,8,4,0.55) 0%, rgba(4,8,4,0.35) 30%, rgba(4,8,4,0.5) 70%, rgba(4,8,4,0.92) 100%)',
          }}
        />
        {/* Green tint overlay for moodiness */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 40%, rgba(10,20,10,0.3) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Golden light ray from top-left (sun through trees) */}
      <div
        data-parallax="0.15"
        className="absolute transition-transform duration-150 ease-out"
        style={{
          top: '-20%',
          left: '-10%',
          width: '70%',
          height: '80%',
          background: 'radial-gradient(ellipse at 20% 10%, rgba(200, 168, 75, 0.12) 0%, rgba(200, 140, 40, 0.05) 30%, transparent 65%)',
          transform: 'rotate(-15deg)',
          willChange: 'transform',
        }}
      />

      {/* Secondary warm light */}
      <div
        data-parallax="0.1"
        className="absolute transition-transform duration-150 ease-out"
        style={{
          top: '10%',
          right: '-5%',
          width: '50%',
          height: '60%',
          background: 'radial-gradient(ellipse at 80% 20%, rgba(180, 130, 40, 0.08) 0%, transparent 55%)',
          willChange: 'transform',
        }}
      />

      {/* Fog layer 1 — bottom */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '35%',
          background: 'linear-gradient(to top, rgba(120, 140, 120, 0.18) 0%, rgba(100, 120, 100, 0.08) 50%, transparent 100%)',
          animation: 'fogDrift 18s ease-in-out infinite',
        }}
      />

      {/* Fog layer 2 — mid */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: '35%',
          height: '30%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(100, 120, 100, 0.06) 40%, transparent 100%)',
          animation: 'fogDrift2 24s ease-in-out infinite',
        }}
      />

      {/* Dark vignette edges */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(4,8,4,0.7) 100%)',
        }}
      />

      {/* Bottom dark gradient for content readability */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '50%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(6,11,6,0.6) 50%, rgba(6,11,6,0.95) 100%)',
        }}
      />
    </div>
  )
}
