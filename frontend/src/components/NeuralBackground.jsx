import { useEffect, useRef } from 'react'

export default function NeuralBackground({
  interactive = true,
  density = 'normal',
  showBackgroundImage = true,
  opacity = 0.85,
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

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Config based on density
    const nodeCount = density === 'dense' ? 48 : density === 'sparse' ? 24 : 36
    const particleCount = density === 'dense' ? 60 : 38

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
    }

    function initNodes() {
      nodes = []
      particles = []
      pulses = []

      // Generate biological neural nodes
      for (let i = 0; i < nodeCount; i++) {
        // Bias nodes towards central and upper-right clusters (resembling biological brain cortex)
        const isCluster = Math.random() > 0.4
        const clusterCenterX = width * 0.62
        const clusterCenterY = height * 0.45
        const spread = Math.min(width, height) * 0.42

        const x = isCluster
          ? clusterCenterX + (Math.random() - 0.5) * spread * 1.3
          : Math.random() * width
        const y = isCluster
          ? clusterCenterY + (Math.random() - 0.5) * spread * 1.1
          : Math.random() * height

        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: 2 + Math.random() * 3.5,
          color: Math.random() > 0.6 ? '#F368E0' : Math.random() > 0.3 ? '#B49AFF' : '#8057E5',
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          connections: [],
        })
      }

      // Precalculate connections (axons/dendrites)
      const maxDistance = Math.min(width, height) * 0.28
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

      // Generate floating microscopic particles
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -0.15 - Math.random() * 0.3, // gently drifting upwards
          size: 0.8 + Math.random() * 2,
          alpha: 0.2 + Math.random() * 0.6,
          hue: Math.random() > 0.5 ? 270 : 315, // violet or magenta
        })
      }
    }

    function spawnPulse() {
      if (nodes.length < 2) return
      // Pick a random node that has connections
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
        speed: 0.015 + Math.random() * 0.025,
        color: Math.random() > 0.5 ? '#F368E0' : '#E0E7FF',
        size: 2.2 + Math.random() * 1.8,
      })
    }

    let pulseTimer = 0

    function handleMouseMove(e) {
      if (!interactive) return
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

    // Animation Loop
    function render() {
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.08
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.08

      // Draw background ambient glow
      const radialGlow = ctx.createRadialGradient(
        width * 0.65,
        height * 0.42,
        20,
        width * 0.65,
        height * 0.42,
        Math.max(width, height) * 0.55
      )
      radialGlow.addColorStop(0, 'rgba(128, 87, 229, 0.16)')
      radialGlow.addColorStop(0.35, 'rgba(217, 70, 239, 0.08)')
      radialGlow.addColorStop(0.7, 'rgba(9, 9, 15, 0.3)')
      radialGlow.addColorStop(1, 'rgba(5, 5, 10, 0)')
      ctx.fillStyle = radialGlow
      ctx.fillRect(0, 0, width, height)

      // Update & Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Organic oscillation around base position
        node.baseX += node.vx
        node.baseY += node.vy
        if (node.baseX < 0 || node.baseX > width) node.vx *= -1
        if (node.baseY < 0 || node.baseY > height) node.vy *= -1

        node.pulsePhase += node.pulseSpeed

        // Mouse repulsion / gravitation parallax
        let dx = mousePos.current.x - node.baseX
        let dy = mousePos.current.y - node.baseY
        let mouseDist = Math.sqrt(dx * dx + dy * dy)
        let offsetX = 0
        let offsetY = 0

        if (mouseDist < 240) {
          const factor = (1 - mouseDist / 240) * 22
          offsetX = -(dx / mouseDist) * factor
          offsetY = -(dy / mouseDist) * factor
        }

        node.x = node.baseX + offsetX
        node.y = node.baseY + offsetY

        // Draw connections (axons/dendrites)
        for (let j = 0; j < node.connections.length; j++) {
          const targetIndex = node.connections[j]
          const target = nodes[targetIndex]
          if (!target) continue

          const cdx = node.x - target.x
          const cdy = node.y - target.y
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
          const maxDist = Math.min(width, height) * 0.28
          if (cdist > maxDist) continue

          const alpha = (1 - cdist / maxDist) * 0.38
          const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y)
          gradient.addColorStop(0, `rgba(180, 154, 255, ${alpha})`)
          gradient.addColorStop(0.5, `rgba(243, 104, 224, ${alpha * 0.9})`)
          gradient.addColorStop(1, `rgba(128, 87, 229, ${alpha * 0.7})`)

          ctx.beginPath()
          // Curved organic biological bezier path
          const midX = (node.x + target.x) / 2 + Math.sin(node.pulsePhase) * 6
          const midY = (node.y + target.y) / 2 + Math.cos(node.pulsePhase) * 6
          ctx.moveTo(node.x, node.y)
          ctx.quadraticCurveTo(midX, midY, target.x, target.y)
          ctx.strokeStyle = gradient
          ctx.lineWidth = Math.max(0.6, (1 - cdist / maxDist) * 1.8)
          ctx.stroke()
        }

        // Draw Synaptic Soma Node
        const pulse = Math.sin(node.pulsePhase)
        const currentRadius = node.radius + pulse * 1.2

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          currentRadius * 4.5
        )
        glowGradient.addColorStop(0, node.color)
        glowGradient.addColorStop(0.4, 'rgba(180, 154, 255, 0.4)')
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, currentRadius * 4.5, 0, Math.PI * 2)
        ctx.fill()

        // Core bright center
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(node.x, node.y, Math.max(1, currentRadius * 0.5), 0, Math.PI * 2)
        ctx.fill()
      }

      // Spawn and update action potential pulses
      pulseTimer++
      if (pulseTimer > 18) {
        pulseTimer = 0
        if (Math.random() > 0.25) spawnPulse()
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

        // Pulse energy packet
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Floating microscopic dust particles
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

        ctx.fillStyle = `hsla(${pt.hue}, 80%, 75%, ${pt.alpha * 0.6})`
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
        ctx.fill()
      }

      animFrameId.current = requestAnimationFrame(render)
    }

    render()

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
      }}
    >
      {/* Background atmospheric image blend */}
      {showBackgroundImage && (
        <div
          className="neural-image-layer"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 65% 45%, rgba(128, 87, 229, 0.28), rgba(9, 9, 15, 0.95) 70%), url('/src/assets/neural_hero.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: opacity * 0.42,
            filter: 'contrast(1.15) brightness(0.85) saturate(1.2)',
            mixBlendMode: 'screen',
            transition: 'opacity 0.6s ease',
          }}
        />
      )}

      {/* Interactive Neural Canvas */}
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

      {/* Vignette Gradient for editorial text contrast */}
      <div
        className="neural-vignette-layer"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 50%, transparent 20%, rgba(9, 9, 15, 0.65) 75%, rgba(5, 5, 10, 0.95) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
