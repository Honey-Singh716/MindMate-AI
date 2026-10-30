const currentYear = new Date().getFullYear()

export default function FinalCtaSection({ onEnterApp }) {
  return (
    <section className="final-cta-section">
      {/* Luminous neural core glow in background */}
      <div className="final-neural-orb"></div>
      <div className="final-ambient-ring"></div>

      <div className="section-container final-container">
        <div className="final-content-box">
          <div className="final-badge">
            <span className="badge-spark">✦</span>
            <span>GET STARTED TODAY</span>
          </div>

          <h2 className="final-heading">
            Knowledge Begins<br />
            <span className="gradient-text-neural">With Curiosity.</span>
          </h2>

          <p className="final-supporting-text">
            Bring your questions, your notes, and your ambitions. Let MindMate help you go further.
          </p>

          <div className="final-actions">
            <button className="final-cta-btn" onClick={onEnterApp}>
              <span className="btn-text">Enter MindMate</span>
              <span className="btn-glow-pulse"></span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Minimalist Editorial Footer */}
        <footer className="landing-footer">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="footer-mark">✦</span>
              <span className="footer-title">MindMate</span>
              <span className="footer-tagline">— Neural Intelligence Learning Studio</span>
            </div>

            <div className="footer-status-pill">
              <span className="status-dot"></span>
              <span>All Neural Systems Operational</span>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © {currentYear} MindMate AI. Powered by Groq, Transformers.js & PostgreSQL pgvector.
            </p>
            <div className="footer-links">
              <span>Private & Document-Grounded</span>
              <span>·</span>
              <span>Built for Deep Work</span>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}
