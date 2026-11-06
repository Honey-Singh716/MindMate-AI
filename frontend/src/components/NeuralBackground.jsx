import { useEffect, useRef } from 'react'

/**
 * MindMate 2.0 — Subtle Knowledge Network Background
 * Restrained academic network behind the hero product preview.
 * Zero random floating dust particles.
 * Gentle opacity, thin sage links, and soft traveling light.
 * Fully respects prefers-reduced-motion.
 */
export default function NeuralBackground({
  interactive = true,
  density = 'normal',
  transparent = true,
  className = '',
}) {
  const canvasRef = useRef(null)
  const animFrameId = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Controlled node count for subtle background presence
    const nodeCount = density === 'dense' ? 24 : density === 'sparse' ? 14 : 18

    let nodes = []
    let pulses = []

    function resize() {
      const parent = canvas.parentElement || document.body
      width = parent.clientWidth || window.innerWidth
      height = parent.clientHeight || window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      initNodes()
      if (prefersReducedMotion) {
        drawStaticFrame()
      }
    }

    function initNodes() {
      nodes = []
      pulses = []

      // Cluster knowledge nodes primarily behind the right-hand preview
      for (let i = 0; i < nodeCount; i++) {
        const isCluster = Math.random() > 0.25
        const clusterCenterX = width > 900 ? width * 0.72 : width * 0.5
        const clusterCenterY = height * 0.42
        const spreadX = Math.min(width, height) * 0.42
        const spreadY = Math.min(width, height) * 0.36

        const x = isCluster
          ? clusterCenterX + (Math.random() - 0.5) * spreadX
          : width * 0.3 + Math.random() * (width * 0.65)
        const y = isCluster
          ? clusterCenterY + (Math.random() - 0.5) * spreadY
          : height * 0.15 + Math.random() * (height * 0.7)

        const isMint = Math.random() > 0.65
        const nodeColor = isMint ? '#DDEBE0' : '#B8CBB9'

        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          // Ultra-slow, calm academic drift (0.05 to 0.10)
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          radius: 1.5 + Math.random() * 1.5,
          color: nodeColor,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.012,
          connections: [],
        })
      }

      // Link nearby nodes with delicate connections
      const maxDistance = Math.min(width, height) * 0.24
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDistance) {
            nodes[i].connections.push(j)
          }
        }
      }
    }

    function spawnPulse() {
      if (nodes.length < 2) return
      const candidates = nodes.filter((n) => n.connections.length > 0)
      if (!candidates.length) return
      const source = candidates[Math.floor(Math.random() * candidates.length)]
      const targetIndex = source.connections[Math.floor(Math.random() * source.connections.length)]
      const target = nodes[targetIndex]
      if (!target) return

      pulses.push({
        x1: source.x,
        y1: source.y,
        x2: target.x,
        y2: target.y,
        progress: 0,
        speed: 0.006 + Math.random() * 0.008,
        color: '#DDEBE0',
        size: 1.6,
      })
    }

    let pulseTimer = 0

    window.addEventListener('resize', resize)
    resize()

    function drawStaticFrame() {
      ctx.clearRect(0, 0, width, height)

      // Ambient radial glow (only when not transparent/standalone)
      if (!transparent) {
        const gradCenter = width > 900 ? width * 0.72 : width * 0.5
        const bgGrad = ctx.createRadialGradient(
          gradCenter,
          height * 0.42,
          30,
          gradCenter,
          height * 0.42,
          Math.max(width, height) * 0.65
        )
        bgGrad.addColorStop(0, '#154033')
        bgGrad.addColorStop(0.5, '#102D25')
        bgGrad.addColorStop(1, '#0C211B')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, width, height)
      }

      // Connections
      const maxDistance = Math.min(width, height) * 0.24
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        for (let j = 0; j < node.connections.length; j++) {
          const target = nodes[node.connections[j]]
          if (!target) continue
          const dx = node.x - target.x
          const dy = node.y - target.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > maxDistance) continue

          const alpha = (1 - dist / maxDistance) * 0.14
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = `rgba(184, 203, 185, ${alpha})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        }
      }

      // Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = 0.35
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    function animate() {
      if (prefersReducedMotion) return

      ctx.clearRect(0, 0, width, height)

      // Deep forest gradient (only when not transparent)
      if (!transparent) {
        const gradCenter = width > 900 ? width * 0.72 : width * 0.5
        const bgGrad = ctx.createRadialGradient(
          gradCenter,
          height * 0.42,
          30,
          gradCenter,
          height * 0.42,
          Math.max(width, height) * 0.65
        )
        bgGrad.addColorStop(0, '#143D30')
        bgGrad.addColorStop(0.55, '#102D25')
        bgGrad.addColorStop(1, '#0C211B')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, width, height)
      }

      // Update & render knowledge nodes
      const maxDistance = Math.min(width, height) * 0.24

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.x += n.vx
        n.y += n.vy

        // Bound nodes gently around base positions
        if (Math.abs(n.x - n.baseX) > 35) n.vx *= -1
        if (Math.abs(n.y - n.baseY) > 30) n.vy *= -1

        n.pulsePhase += n.pulseSpeed

        // Draw connections
        for (let j = 0; j < n.connections.length; j++) {
          const target = nodes[n.connections[j]]
          if (!target) continue
          const dx = n.x - target.x
          const dy = n.y - target.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > maxDistance) continue

          const alpha = (1 - dist / maxDistance) * 0.14
          ctx.beginPath()
          ctx.moveTo(n.x, n.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = `rgba(184, 203, 185, ${alpha})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        }
      }

      // Draw subtle traveling light pulses
      pulseTimer++
      if (pulseTimer > 180) {
        spawnPulse()
        pulseTimer = 0
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.progress += p.speed
        if (p.progress >= 1) {
          pulses.splice(i, 1)
          continue
        }

        const px = p.x1 + (p.x2 - p.x1) * p.progress
        const py = p.y1 + (p.y2 - p.y1) * p.progress
        const pAlpha = Math.sin(p.progress * Math.PI) * 0.45

        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = pAlpha
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Draw node dots with gentle breathing opacity
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const opacity = 0.28 + Math.sin(n.pulsePhase) * 0.16

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fillStyle = n.color
        ctx.globalAlpha = opacity
        ctx.fill()
        ctx.globalAlpha = 1
      }

      animFrameId.current = requestAnimationFrame(animate)
    }

    if (!prefersReducedMotion) {
      animate()
    }

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current)
      }
    }
  }, [density, interactive, transparent])

  return (
    <canvas
      ref={canvasRef}
      className={`neural-canvas-layer ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
        opacity: transparent ? 0.38 : 1,
        transition: 'opacity 0.6s ease',
      }}
      aria-hidden="true"
    />
  )
}
