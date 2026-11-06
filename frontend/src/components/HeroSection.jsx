import { useEffect, useRef } from 'react'
import NeuralBackground from './NeuralBackground'

export default function HeroSection({ onStartLearning, onExploreProduct }) {
  const heroRef = useRef(null)
  const bgPhotoRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const heroEl = heroRef.current
    if (!heroEl) return

    let rafId = null

    function handleMouseMove(e) {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const rect = heroEl.getBoundingClientRect()
        // Normalized offsets from center (-0.5 to 0.5)
        const normX = (e.clientX - rect.left) / rect.width - 0.5
        const normY = (e.clientY - rect.top) / rect.height - 0.5

        // Subtle, restrained photographic parallax
        if (bgPhotoRef.current) {
          bgPhotoRef.current.style.transform = `scale(1.025) translate(${normX * -10}px, ${normY * -8}px)`
        }
      })
    }

    function handleMouseLeave() {
      if (rafId) cancelAnimationFrame(rafId)
      if (bgPhotoRef.current) {
        bgPhotoRef.current.style.transform = 'scale(1.02) translate(0px, 0px)'
      }
    }

    heroEl.addEventListener('mousemove', handleMouseMove, { passive: true })
    heroEl.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    return () => {
      heroEl.removeEventListener('mousemove', handleMouseMove)
      heroEl.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section className="hero-section" ref={heroRef}>
      {/* 1. Cinematic Photographic Academic Study Atmosphere Layer */}
      <div className="hero-atmosphere-layer" aria-hidden="true">
        <div className="hero-bg-photo" ref={bgPhotoRef}></div>
        {/* Directional sophisticated Forest Green overlay */}
        <div className="hero-overlay-directional"></div>
        {/* Very subtle edge vignette */}
        <div className="hero-overlay-vignette"></div>
      </div>

      {/* 2. Subtle academic knowledge network behind the right preview */}
      <NeuralBackground
        interactive={true}
        density="normal"
        transparent={true}
      />

      <div className="hero-content-wrapper">
        {/* Left Column: Editorial Academic Proposition */}
        <div className="hero-editorial-block">
          {/* Eyebrow badge */}
          <div className="hero-eyebrow">
            <span className="eyebrow-spark">✦</span>
            <span>AI LEARNING STUDIO</span>
            <span className="eyebrow-line"></span>
          </div>

          {/* Main Heading with Balanced Editorial Serif Emphasis */}
          <h1 className="hero-headline">
            Beyond<br />
            <span className="hero-serif-accent">Traditional Learning.</span>
          </h1>

          {/* Supporting Text */}
          <p className="hero-subtext">
            Your personal AI study companion. Understand complex concepts, explore your course documents,
            and organize your learning with grounded academic intelligence.
          </p>

          {/* Action Buttons */}
          <div className="hero-cta-group">
            <button className="hero-btn-primary" onClick={onStartLearning}>
              <span>Start Learning</span>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="hero-btn-secondary" onClick={onExploreProduct}>
              <span>Explore Product</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visually Connected Document Intelligence Unit */}
        <div className="hero-visual-column">
          <div className="hero-product-composition">
            {/* 1. Connected Document Intelligence Experience Unit */}
            <div className="doc-intelligence-unit animate-fade-in">
              {/* PDF Document Reader Card */}
              <div className="study-doc-window">
                <div className="doc-window-header">
                  <div className="doc-window-pills">
                    <span className="pdf-type-badge">PDF</span>
                    <span className="doc-name">Distributed_Systems · Lecture_04.pdf</span>
                  </div>
                  <span className="doc-page-counter">Page 14 of 42</span>
                </div>

                <div className="doc-window-content">
                  <div className="academic-passage">
                    <p className="passage-text">
                      "In the Raft consensus algorithm, safety is maintained by enforcing that the leader’s log is{' '}
                      <mark className="academic-highlight">always authoritative</mark> and complete across majorities.
                      A candidate must receive votes from a strict quorum before assuming authority."
                    </p>
                  </div>

                  <div className="artifact-concepts">
                    <span className="concept-pill">✦ Quorum Majority</span>
                    <span className="concept-pill">✦ Log Replication</span>
                    <span className="concept-pill">✦ Leader Election</span>
                  </div>
                </div>
              </div>

              {/* Visual Connector Stem */}
              <div className="doc-ai-bridge">
                <span className="bridge-stem"></span>
                <div className="bridge-tag">
                  <span className="bridge-dot"></span>
                  <span>Grounded AI Synthesis · Citing p. 14</span>
                </div>
              </div>

              {/* Contextual AI Explanation Card (Directly Connected) */}
              <div className="ai-explanation-card animate-fade-up">
                <div className="ai-explanation-head">
                  <div className="ai-explanation-title-group">
                    <span className="explanation-spark">✦</span>
                    <span className="explanation-title">Contextual Explanation</span>
                  </div>
                  <span className="explanation-cite-tag">Match 0.92</span>
                </div>
                <p className="explanation-body">
                  Raft guarantees safety by electing only candidates holding all committed entries.
                  Because any majority quorum overlaps with the quorum that committed the prior entry,
                  uncommitted entries can never overwrite established state.
                </p>
              </div>
            </div>

            {/* 2. Neural Engine Active Status Indicator */}
            <div className="hero-synaptic-card">
              <div className="synaptic-card-header">
                <span className="pulse-dot-academic"></span>
                <span className="synaptic-card-label">NEURAL ENGINE ACTIVE</span>
              </div>
              <div className="synaptic-card-body">
                <div className="synaptic-metric">
                  <span className="metric-val">Groq Llama 3.3</span>
                  <span className="metric-lbl">Inference Acceleration</span>
                </div>
                <div className="synaptic-divider"></div>
                <div className="synaptic-metric">
                  <span className="metric-val">pgvector + MiniLM</span>
                  <span className="metric-lbl">Semantic Grounding</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Features Strip */}
      <div className="hero-bottom-strip">
        <div className="bottom-feature-item">
          <div className="feature-num-title">
            <span className="feature-num">01</span>
            <span className="feature-dash">—</span>
            <span className="feature-title">Intelligent Conversations</span>
          </div>
          <p className="feature-desc">
            Understand concepts and explore ideas with your contextual AI study companion.
          </p>
        </div>

        <div className="feature-separator"></div>

        <div className="bottom-feature-item">
          <div className="feature-num-title">
            <span className="feature-num">02</span>
            <span className="feature-dash">—</span>
            <span className="feature-title">Document Intelligence</span>
          </div>
          <p className="feature-desc">
            Ask questions directly from your textbooks and PDFs with verified page citations.
          </p>
        </div>

        <div className="feature-separator"></div>

        <div className="bottom-feature-item">
          <div className="feature-num-title">
            <span className="feature-num">03</span>
            <span className="feature-dash">—</span>
            <span className="feature-title">Personalized Planning</span>
          </div>
          <p className="feature-desc">
            Synthesize structured study curricula customized to your deadlines and pace.
          </p>
        </div>
      </div>
    </section>
  )
}
