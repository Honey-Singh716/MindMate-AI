import { useEffect, useRef } from 'react'

/**
 * MindMate 2.0 — Calm Academic Knowledge Network Background
 * Subtle, organic constellation of study nodes with thin sage connecting lines,
 * gentle opacity transitions, and minimal traveling light packets.
 * Fully respects prefers-reduced-motion.
 */
export default function NeuralBackground({
  interactive = true,
  density = 'normal',
  className = '',
}) {
  const canvasRef = useRef(null)
  const mousePos = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 })
  const animFrameId = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Academic node count: clean, uncluttered, breathable
    const nodeCount = density === 'dense' ? 34 : density === 'sparse' ? 18 : 26
    const particleCount = density === 'dense' ? 24 : 16

    let nodes = []
    let particles = []
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
      particles = []
      pulses = []

      // Generate calm study knowledge nodes clustered naturally on the right
      for (let i = 0; i < nodeCount; i++) {
        const isCluster = Math.random() > 0.35
        const clusterCenterX = width * 0.65
        const clusterCenterY = height * 0.44
        const spread = Math.min(width, height) * 0.44

        const x = isCluster
          ? clusterCenterX + (Math.random() - 0.5) * spread * 1.2
          : Math.random() * width
        const y = isCluster
          ? clusterCenterY + (Math.random() - 0.5) * spread * 1.05
          : Math.random() * height

        // Color palette: Sage Green (#B8CBB9) and Soft Mint (#DDEBE0)
        const isMint = Math.random() > 0.6
        const nodeColor = isMint ? '#DDEBE0' : '#B8CBB9'

        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          // Very gentle, slow academic drift (0.1 - 0.16)
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          radius: 1.6 + Math.random() * 1.8,
          color: nodeColor,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.012 + Math.random() * 0.016, // slow breathing
          connections: [],
        })
      }

      // Precalculate connecting lines (thin knowledge links)
      const maxDistance = Math.min(width, height) * 0.26
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

      // Minimal subtle academic particles (drifting like quiet library dust)
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.08,
          vy: -0.06 - Math.random() * 0.12,
          size: 0.8 + Math.random() * 1.2,
          alpha: 0.12 + Math.random() * 0.22,
        })
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
        speed: 0.008 + Math.random() * 0.012, // slow, graceful traveling light
        color: '#DDEBE0',
        size: 1.8,
      })
    }

    let pulseTimer = 0

    function handleMouseMove(e) {
      if (!interactive || prefersReducedMotion) return
      const rect = canvas.getBoundingClientRect()
      mousePos.current.targetX = e.clientX - rect.left
      mousePos.current.targetY = e.clientY - rect.top
    }

    function handleMouseLeave() {
      mousePos.current.targetX = -1000
      mousePos.current.targetY = -1000
    }

    window.addEventListener('resize', resize)
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseleave', handleMouseLeave)
    }

    resize()

    function drawStaticFrame() {
      ctx.clearRect(0, 0, width, height)

      // Background ambient gradient: Deep Forest (#102D25) to Forest Green (#174C3C)
      const bgGrad = ctx.createRadialGradient(
        width * 0.65,
        height * 0.44,
        40,
        width * 0.65,
        height * 0.44,
        Math.max(width, height) * 0.65
      )
      bgGrad.addColorStop(0, '#154234')
      bgGrad.addColorStop(0.5, '#102D25')
      bgGrad.addColorStop(1, '#0C231D')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Draw connections
      const maxDistance = Math.min(width, height) * 0.26
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        for (let j = 0; j < node.connections.length; j++) {
          const target = nodes[node.connections[j]]
          if (!target) continue
          const dx = node.x - target.x
          const dy = node.y - target.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > maxDistance) continue

          const alpha = (1 - dist / maxDistance) * 0.18
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = `rgba(184, 203, 185, ${alpha})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Animation Loop
    function render() {
      if (prefersReducedMotion) return

      ctx.clearRect(0, 0, width, height)

      // Smooth mouse interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05

      // Calm ambient academic depth (Deep Forest with soft emerald/sage ambient pool)
      const radialDepth = ctx.createRadialGradient(
        width * 0.64,
        height * 0.44,
        30,
        width * 0.64,
        height * 0.44,
        Math.max(width, height) * 0.65
      )
      radialDepth.addColorStop(0, 'rgba(23, 76, 60, 0.45)')
      radialDepth.addColorStop(0.45, 'rgba(16, 45, 37, 0.35)')
      radialDepth.addColorStop(0.85, 'rgba(12, 35, 29, 0.2)')
      radialDepth.addColorStop(1, 'rgba(10, 28, 23, 0)')
      ctx.fillStyle = radialDepth
      ctx.fillRect(0, 0, width, height)

      // Update & Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Organic oscillation
        node.baseX += node.vx
        node.baseY += node.vy
        if (node.baseX < 0 || node.baseX > width) node.vx *= -1
        if (node.baseY < 0 || node.baseY > height) node.vy *= -1

        node.pulsePhase += node.pulseSpeed

        // Subtle mouse parallax
        let dx = mousePos.current.x - node.baseX
        let dy = mousePos.current.y - node.baseY
        let mouseDist = Math.sqrt(dx * dx + dy * dy)
        let offsetX = 0
        let offsetY = 0

        if (mouseDist < 200) {
          const factor = (1 - mouseDist / 200) * 12
          offsetX = -(dx / mouseDist) * factor
          offsetY = -(dy / mouseDist) * factor
        }

        node.x = node.baseX + offsetX
        node.y = node.baseY + offsetY

        // Draw thin sage connecting lines
        const maxDist = Math.min(width, height) * 0.26
        for (let j = 0; j < node.connections.length; j++) {
          const target = nodes[node.connections[j]]
          if (!target) continue

          const cdx = node.x - target.x
          const cdy = node.y - target.y
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
          if (cdist > maxDist) continue

          const alpha = (1 - cdist / maxDist) * 0.16
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = `rgba(184, 203, 185, ${alpha})`
          ctx.lineWidth = Math.max(0.6, (1 - cdist / maxDist) * 1.1)
          ctx.stroke()
        }

        // Draw Knowledge Node
        const pulse = Math.sin(node.pulsePhase)
        const currentRadius = node.radius + pulse * 0.4
        const nodeAlpha = 0.55 + pulse * 0.25

        // Delicate academic halo
        ctx.fillStyle = `rgba(184, 203, 185, ${nodeAlpha * 0.2})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, currentRadius * 2.2, 0, Math.PI * 2)
        ctx.fill()

        // Crisp node core
        ctx.fillStyle = node.color === '#DDEBE0'
          ? `rgba(221, 235, 224, ${nodeAlpha})`
          : `rgba(184, 203, 185, ${nodeAlpha})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Traveling light packets along connections
      pulseTimer++
      if (pulseTimer > 45) {
        pulseTimer = 0
        if (Math.random() > 0.4) spawnPulse()
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
        const pAlpha = Math.sin(p.progress * Math.PI) * 0.65

        ctx.fillStyle = `rgba(221, 235, 224, ${pAlpha})`
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Minimal floating particles
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]
        pt.x += pt.vx
        pt.y += pt.vy

        if (pt.y < -10) {
          pt.y = height + 10
          pt.x = Math.random() * width
        }
        if (pt.x < -10) pt.x = width + 10
        if (pt.x > width + 10) pt.x = -10

        ctx.fillStyle = `rgba(245, 243, 235, ${pt.alpha})`
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
        ctx.fill()
      }

      animFrameId.current = requestAnimationFrame(render)
    }

    if (!prefersReducedMotion) {
      render()
    }

    return () => {
      window.removeEventListener('resize', resize)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current)
      }
    }
  }, [interactive, density])

  return (
    <div
      className={`neural-background-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 0,
        backgroundColor: '#102D25',
      }}
    >
      {/* Subtle organic paper/canvas texture overlay */}
      <div
        className="academic-texture-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 70% 35%, rgba(23, 76, 60, 0.42), transparent 70%), linear-gradient(180deg, rgba(16, 45, 37, 0.3) 0%, rgba(16, 45, 37, 0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Calm Knowledge Network Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Gentle vignette to ensure pristine typography readability */}
      <div
        className="academic-vignette"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(16, 45, 37, 0.92) 0%, rgba(16, 45, 37, 0.45) 45%, transparent 75%), linear-gradient(180deg, transparent 65%, rgba(16, 45, 37, 0.98) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
