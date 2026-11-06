import NeuralBackground from './NeuralBackground'

export default function HeroSection({ onStartLearning, onExploreProduct }) {
  return (
    <section className="hero-section">
      {/* Calm academic knowledge network canvas */}
      <NeuralBackground
        interactive={true}
        density="normal"
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

          {/* Main Heading with Editorial Serif Emphasis */}
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="hero-btn-secondary" onClick={onExploreProduct}>
              <span>Explore Product</span>
            </button>
          </div>
        </div>

        {/* Right Column: Realistic Document Intelligence & Study Product Preview */}
        <div className="hero-visual-column desktop-only">
          <div className="hero-product-composition">
            {/* 1. PDF Document Reader Preview */}
            <div className="study-doc-window animate-fade-in">
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

            {/* 2. Contextual AI Explanation Card (Overlay) */}
            <div className="ai-explanation-card animate-fade-up">
              <div className="ai-explanation-head">
                <span className="explanation-spark">✦</span>
                <span className="explanation-title">AI Study Explanation</span>
                <span className="explanation-cite-tag">Citing p. 14</span>
              </div>
              <p className="explanation-body">
                Raft ensures consensus by requiring a majority quorum. Candidates with outdated logs are rejected,
                preventing uncommitted entries from ever overwriting committed state.
              </p>
            </div>

            {/* 3. Restrained Neural Engine Active Status Indicator */}
            <div className="hero-synaptic-card">
              <div className="synaptic-card-header">
                <span className="pulse-dot-academic"></span>
                <span className="synaptic-card-label">NEURAL ENGINE ACTIVE</span>
              </div>
              <div className="synaptic-card-body">
                <div className="synaptic-metric">
                  <span className="metric-val">Groq Llama 3.3</span>
                  <span className="metric-lbl">Inference Engine</span>
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
