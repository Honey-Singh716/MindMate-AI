import NeuralBackground from './NeuralBackground'

export default function HeroSection({ onStartLearning, onExploreProduct }) {
  return (
    <section className="hero-section">
      {/* Cinematic biological neural background */}
      <NeuralBackground
        interactive={true}
        density="normal"
        showBackgroundImage={true}
        opacity={0.9}
      />

      <div className="hero-content-wrapper">
        <div className="hero-editorial-block">
          {/* Eyebrow badge */}
          <div className="hero-eyebrow">
            <span className="eyebrow-spark">✦</span>
            <span>AI LEARNING STUDIO</span>
            <span className="eyebrow-line"></span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-headline">
            Beyond<br />
            <span className="gradient-text-neural">Traditional Learning.</span>
          </h1>

          {/* Supporting Text */}
          <p className="hero-subtext">
            Your personal AI learning companion. Understand complex concepts, explore your documents,
            and transform the way you learn with biologically inspired artificial intelligence.
          </p>

          {/* Action Buttons */}
          <div className="hero-cta-group">
            <button className="hero-btn-primary" onClick={onStartLearning}>
              <span className="btn-label">Start Learning</span>
              <span className="btn-shimmer"></span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="hero-btn-secondary" onClick={onExploreProduct}>
              <span>Explore Product</span>
              <span className="btn-secondary-glow"></span>
            </button>
          </div>
        </div>

        {/* Floating live synaptic status pill */}
        <div className="hero-synaptic-card desktop-only">
          <div className="synaptic-card-header">
            <div className="pulse-dot-live"></div>
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

      {/* Bottom Editorial Features with thin horizontal dividers */}
      <div className="hero-bottom-strip">
        <div className="bottom-feature-item">
          <div className="feature-num-title">
            <span className="feature-num">01</span>
            <span className="feature-dash">—</span>
            <span className="feature-title">Intelligent Conversations</span>
          </div>
          <p className="feature-desc">
            Understand concepts and explore ideas with your AI learning companion.
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
            Ask questions from your PDFs and notes with context-aware AI responses.
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
            Generate structured study plans and organize your learning journey.
          </p>
        </div>
      </div>
    </section>
  )
}
