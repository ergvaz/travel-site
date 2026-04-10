'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'
import * as topojson from 'topojson-client'
import type { Topology } from 'topojson-specification'

const DESTINATIONS = [
  { name: 'Paris',          country: 'France',      lat: 48.86,  lng: 2.35,   emoji: '🗼' },
  { name: 'Tokyo',          country: 'Japan',       lat: 35.68,  lng: 139.69, emoji: '🏯' },
  { name: 'Bali',           country: 'Indonesia',   lat: -8.41,  lng: 115.19, emoji: '🌺' },
  { name: 'New York',       country: 'USA',         lat: 40.71,  lng: -74.01, emoji: '🗽' },
  { name: 'Santorini',      country: 'Greece',      lat: 36.39,  lng: 25.46,  emoji: '🏛' },
  { name: 'Machu Picchu',   country: 'Peru',        lat: -13.16, lng: -72.54, emoji: '🏔' },
  { name: 'Cape Town',      country: 'South Africa',lat: -33.92, lng: 18.42,  emoji: '🌊' },
  { name: 'Sydney',         country: 'Australia',   lat: -33.87, lng: 151.21, emoji: '🦘' },
  { name: 'Reykjavik',      country: 'Iceland',     lat: 64.13,  lng: -21.94, emoji: '🌌' },
  { name: 'Dubai',          country: 'UAE',         lat: 25.20,  lng: 55.27,  emoji: '🌆' },
]

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  )
}

// Build equirectangular canvas texture from world topojson
async function buildGlobeTexture(): Promise<THREE.CanvasTexture> {
  const W = 2048, H = 1024
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Ocean
  ctx.fillStyle = '#050c08'
  ctx.fillRect(0, 0, W, H)

  // Lat/lng grid
  ctx.strokeStyle = 'rgba(200,168,75,0.07)'
  ctx.lineWidth = 0.7
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = (lng + 180) / 360 * W
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = (90 - lat) / 180 * H
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Load and draw land masses from topojson (served locally from /public)
  const worldData: Topology = await fetch('/countries-110m.json').then(r => r.json())

  const land = topojson.feature(worldData, worldData.objects.land as topojson.GeometryCollection)

  ctx.fillStyle = '#264d1e'
  ctx.strokeStyle = 'rgba(200,168,75,0.7)'
  ctx.lineWidth = 1.8

  const project = (coord: number[]) => [
    (coord[0] + 180) / 360 * W,
    (90 - coord[1]) / 180 * H,
  ] as [number, number]

  function drawFeature(geometry: GeoJSON.Geometry) {
    if (geometry.type === 'Polygon') {
      for (const ring of geometry.coordinates) {
        ctx.beginPath()
        ring.forEach(([lng, lat], i) => {
          const [x, y] = project([lng, lat])
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.closePath(); ctx.fill(); ctx.stroke()
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const poly of geometry.coordinates) {
        for (const ring of poly) {
          ctx.beginPath()
          ring.forEach(([lng, lat], i) => {
            const [x, y] = project([lng, lat])
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          })
          ctx.closePath(); ctx.fill(); ctx.stroke()
        }
      }
    }
  }

  if (land.type === 'FeatureCollection') {
    land.features.forEach(f => f.geometry && drawFeature(f.geometry))
  } else if (land.type === 'Feature' && land.geometry) {
    drawFeature(land.geometry)
  }

  // Pin dots on texture (small gold circles at each destination)
  DESTINATIONS.forEach(({ lat, lng }) => {
    const [x, y] = project([lng, lat])
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 10)
    grad.addColorStop(0, 'rgba(200,168,75,0.6)')
    grad.addColorStop(1, 'rgba(200,168,75,0)')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#c8a84b'
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
  })

  return new THREE.CanvasTexture(canvas)
}

export default function Globe3D() {
  const mountRef   = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const router     = useRouter()
  const [tooltip, setTooltip] = useState<{ name: string; country: string; emoji: string; x: number; y: number } | null>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const W = el.clientWidth, H = el.clientHeight

    // Scene
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.z = 3.2

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    // Globe mesh — texture filled in async
    const geo = new THREE.SphereGeometry(1, 64, 64)
    const mat = new THREE.MeshPhongMaterial({
      color:     0x0a1208,
      emissive:  0x040802,
      shininess: 20,
    })
    const globe = new THREE.Mesh(geo, mat)
    scene.add(globe)

    // Atmosphere glow
    const glowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.07, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x1a3a1a, transparent: true, opacity: 0.15, side: THREE.BackSide })
    )
    scene.add(glowMesh)

    // Build and apply texture (guard against unmount before async completes)
    let cancelled = false
    buildGlobeTexture().then(tex => {
      if (!cancelled) {
        mat.map = tex
        mat.needsUpdate = true
      }
    }).catch(err => {
      console.warn('Globe texture failed to load:', err)
    })

    // Pin meshes — one per destination
    const pinMeshes: THREE.Mesh[] = []
    const pinGroup = new THREE.Group()

    DESTINATIONS.forEach(({ lat, lng }) => {
      const pos = latLngToVec3(lat, lng, 1)

      // Stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.1, 6),
        new THREE.MeshPhongMaterial({ color: 0xc8a84b, emissive: 0x6a4a10, shininess: 80 })
      )
      // Head sphere
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 10, 10),
        new THREE.MeshPhongMaterial({ color: 0xd4b86a, emissive: 0x9a6a10, shininess: 140 })
      )
      head.position.y = 0.06

      // Invisible click target (larger hit area)
      const hitGeo  = new THREE.SphereGeometry(0.06, 8, 8)
      const hitMat  = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      const hitMesh = new THREE.Mesh(hitGeo, hitMat)
      hitMesh.position.y = 0.05
      hitMesh.userData.destIndex = DESTINATIONS.findIndex(d => d.lat === lat && d.lng === lng)

      const pin = new THREE.Group()
      pin.add(stem); pin.add(head); pin.add(hitMesh)
      pin.position.copy(pos.clone().multiplyScalar(1.01))
      pin.lookAt(new THREE.Vector3(0, 0, 0))
      pin.rotateX(Math.PI / 2)

      pinGroup.add(pin)
      pinMeshes.push(hitMesh)
    })
    scene.add(pinGroup)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const sun = new THREE.DirectionalLight(0xfff4d0, 1.4)
    sun.position.set(4, 2, 3); scene.add(sun)
    const fill = new THREE.DirectionalLight(0x2a4a2a, 0.4)
    fill.position.set(-3, -2, -2); scene.add(fill)

    // Rotation
    let rotX = 0.3, rotY = 0
    let isDragging = false
    let prevX = 0, prevY = 0
    let velX = 0, velY = 0
    let hasMoved = false

    // Raycaster
    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2()

    const getCanvasPos = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect()
      return {
        x: ((clientX - rect.left) / rect.width)  * 2 - 1,
        y: -((clientY - rect.top)  / rect.height) * 2 + 1,
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true; hasMoved = false
      prevX = e.clientX; prevY = e.clientY
      velX = 0; velY = 0
    }

    const onMouseMove = (e: MouseEvent) => {
      // Hover tooltip
      const { x, y } = getCanvasPos(e.clientX, e.clientY)
      mouse.set(x, y)
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(pinMeshes)
      if (hits.length) {
        const idx = hits[0].object.userData.destIndex as number
        const d   = DESTINATIONS[idx]
        const rect = renderer.domElement.getBoundingClientRect()
        setTooltip({ name: d.name, country: d.country, emoji: d.emoji, x: e.clientX - rect.left, y: e.clientY - rect.top })
        renderer.domElement.style.cursor = 'pointer'
      } else {
        setTooltip(null)
        renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab'
      }

      if (!isDragging) return
      const dx = e.clientX - prevX
      const dy = e.clientY - prevY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasMoved = true
      velX = dy * 0.004; velY = dx * 0.004
      rotX += velX; rotY += velY
      prevX = e.clientX; prevY = e.clientY
    }

    const onMouseUp = (e: MouseEvent) => {
      if (!hasMoved) {
        // Click — check pin hit
        const { x, y } = getCanvasPos(e.clientX, e.clientY)
        mouse.set(x, y)
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(pinMeshes)
        if (hits.length) {
          const idx  = hits[0].object.userData.destIndex as number
          const dest = DESTINATIONS[idx]
          router.push(`/plan?destination=${encodeURIComponent(`${dest.name}, ${dest.country}`)}`)
        }
      }
      isDragging = false
    }

    const onTouchStart = (e: TouchEvent) => {
      isDragging = true; hasMoved = false
      prevX = e.touches[0].clientX; prevY = e.touches[0].clientY
      velX = 0; velY = 0
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const dx = e.touches[0].clientX - prevX
      const dy = e.touches[0].clientY - prevY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasMoved = true
      velX = dy * 0.004; velY = dx * 0.004
      rotX += velX; rotY += velY
      prevX = e.touches[0].clientX; prevY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!hasMoved && e.changedTouches.length) {
        const t = e.changedTouches[0]
        const { x, y } = getCanvasPos(t.clientX, t.clientY)
        mouse.set(x, y)
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(pinMeshes)
        if (hits.length) {
          const idx  = hits[0].object.userData.destIndex as number
          const dest = DESTINATIONS[idx]
          router.push(`/plan?destination=${encodeURIComponent(`${dest.name}, ${dest.country}`)}`)
        }
      }
      isDragging = false
    }

    renderer.domElement.addEventListener('mousedown',  onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('touchend',   onTouchEnd)

    // Animate
    let frame: number
    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (!isDragging) {
        rotY += 0.0015
        velX *= 0.90; velY *= 0.90
        rotX += velX;  rotY += velY
      }
      globe.rotation.x    = rotX; globe.rotation.y    = rotY
      pinGroup.rotation.x = rotX; pinGroup.rotation.y = rotY
      glowMesh.rotation.x = rotX; glowMesh.rotation.y = rotY
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      renderer.domElement.removeEventListener('mousedown',  onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      renderer.domElement.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchend',   onTouchEnd)
      window.removeEventListener('resize',     onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [router])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Hover tooltip */}
      {tooltip && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            left: tooltip.x + 14,
            top:  tooltip.y - 40,
            pointerEvents: 'none',
            background: 'rgba(10,15,10,0.95)',
            border: '1px solid rgba(200,168,75,0.4)',
            borderRadius: '10px',
            padding: '8px 14px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            zIndex: 20,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#e8f0e8' }}>
            {tooltip.emoji} {tooltip.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
            {tooltip.country} · Click to plan →
          </div>
        </div>
      )}
    </div>
  )
}
