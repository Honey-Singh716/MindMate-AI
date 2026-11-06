const currentYear = new Date().getFullYear()

export default function FinalCtaSection({ onEnterApp }) {
  return (
    <section className="final-cta-section">
      {/* Cinematic Dark Academia Background Atmosphere */}
      <div className="final-cta-bg-backdrop" aria-hidden="true">
        <div className="final-cta-bg-image" />
        <div className="final-cta-bg-overlay" />
      </div>

      <div className="section-container final-container">
        {/* Top Call to Action Block */}
        <div className="final-content-box">
          <div className="final-badge">
            <span className="badge-spark">✦</span>
            <span>GET STARTED TODAY</span>
          </div>

          <h2 className="final-heading">
            Knowledge Begins<br />
            <span className="serif-accent">With Curiosity.</span>
          </h2>

          <p className="final-supporting-text">
            Bring your textbooks, lecture notes, and study goals into your private workspace.
            Understand deeper, revise faster, and master your coursework.
          </p>

          <div className="final-actions">
            <button className="final-cta-btn" onClick={onEnterApp}>
              <span className="btn-text">Start Learning Today →</span>
            </button>
          </div>
        </div>

        {/* Minimalist Academic Footer */}
        <footer className="landing-footer">
          <div className="footer-columns-grid">
            {/* 1. MindMate Brand Column */}
            <div className="footer-col-brand">
              <div className="footer-brand-lockup">
                <span className="academic-logo-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#FAF9F5" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#FAF9F5" fill="rgba(245, 243, 235, 0.12)" />
                    <circle cx="12" cy="10" r="1.5" fill="#DDEBE0" />
                  </svg>
                </span>
                <div className="brand-text-col">
                  <strong className="footer-brand-name">MindMate</strong>
                  <span className="footer-brand-sub">Academic AI Study Companion</span>
                </div>
              </div>
            </div>

            {/* 2. Need a little help / Support Column */}
            <div className="footer-col-support">
              <div className="support-heading-row">
                <span className="support-icon">🎧</span>
                <strong>Need a little help with your learning?</strong>
              </div>
              <p className="support-desc">
                Questions about MindMate? We're here to help you make the most of your study workspace.
              </p>
              <button
                className="footer-support-btn"
                onClick={() => {
                  window.location.href = 'mailto:support@mindmate.local?subject=MindMate%20Study%20Support'
                }}
              >
                <span>Contact Support →</span>
              </button>
            </div>

            {/* 3. Explore Column */}
            <div className="footer-col-nav">
              <div className="col-nav-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                <span>Explore</span>
              </div>
              <ul className="col-nav-list">
                <li><button onClick={() => document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' })}>Capabilities</button></li>
                <li><button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>Methodology</button></li>
                <li><button onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}>Study Workspace</button></li>
              </ul>
            </div>

            {/* 4. Workspace Column */}
            <div className="footer-col-nav">
              <div className="col-nav-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Workspace</span>
              </div>
              <ul className="col-nav-list">
                <li><button onClick={onEnterApp}>AI Chat</button></li>
                <li><button onClick={onEnterApp}>Study Planner</button></li>
                <li><button onClick={onEnterApp}>Documents</button></li>
              </ul>
            </div>
          </div>

          <div className="footer-divider-sub"></div>

          {/* Sub-footer Copyright Row */}
          <div className="footer-bottom-row">
            <p className="footer-copy">
              © {currentYear} MindMate 2.0. Powered by Groq, Transformers.js & PostgreSQL pgvector.
            </p>
            <div className="footer-meta-pill">
              <span>Private & Tenant Isolated</span>
              <span className="meta-bullet">·</span>
              <span>Document-Grounded Knowledge</span>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}
