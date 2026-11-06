const currentYear = new Date().getFullYear()

export default function FinalCtaSection({ onEnterApp }) {
  return (
    <section className="final-cta-section">
      <div className="section-container final-container">
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
              <span className="btn-text">Start Learning Today</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Minimalist Academic Footer */}
        <footer className="landing-footer">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="footer-mark">✦</span>
              <span className="footer-title">MindMate</span>
              <span className="footer-tagline">— Academic AI Study Companion</span>
            </div>

            <div className="footer-status-pill">
              <span className="status-dot"></span>
              <span>All Neural & Database Services Operational</span>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © {currentYear} MindMate 2.0. Powered by Groq, Transformers.js & PostgreSQL pgvector.
            </p>
            <div className="footer-links">
              <span>Private & Tenant Isolated</span>
              <span>·</span>
              <span>Document-Grounded Knowledge</span>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}
