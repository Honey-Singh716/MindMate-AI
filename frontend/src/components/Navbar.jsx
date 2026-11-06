import { useState, useEffect } from 'react'

export default function Navbar({ onOpenAuth, user, onGoToWorkspace }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 32)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToSection(id) {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-container">
        {/* Brand */}
        <a
          href="#"
          className="nav-brand"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        >
          <span className="nav-brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" fill="rgba(255,255,255,0.08)" />
              <line x1="12" y1="7" x2="17" y2="7" stroke="currentColor" />
              <line x1="12" y1="11" x2="17" y2="11" />
            </svg>
          </span>
          <span className="nav-brand-name">MindMate</span>
          <span className="nav-brand-version">2.0</span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="nav-links desktop-only" aria-label="Main Navigation">
          <button className="nav-link" onClick={() => scrollToSection('product')}>Capabilities</button>
          <button className="nav-link" onClick={() => scrollToSection('how-it-works')}>Methodology</button>
          <button className="nav-link" onClick={() => scrollToSection('experience')}>Study Workspace</button>
        </nav>

        {/* Right Auth Actions */}
        <div className="nav-actions">
          {user ? (
            <button className="nav-cta-btn" onClick={onGoToWorkspace}>
              Enter Workspace
              <span className="nav-cta-dot"></span>
            </button>
          ) : (
            <>
              <button className="nav-ghost-btn desktop-only" onClick={() => onOpenAuth('login')}>
                Sign in
              </button>
              <button className="nav-cta-btn" onClick={() => onOpenAuth('signup')}>
                Start Learning
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            className="mobile-hamburger"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`bar ${mobileMenuOpen ? 'bar-open-top' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'bar-open-mid' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'bar-open-bot' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer animate-fade-in">
          <div className="drawer-links">
            <button onClick={() => scrollToSection('product')}>Capabilities</button>
            <button onClick={() => scrollToSection('how-it-works')}>Methodology</button>
            <button onClick={() => scrollToSection('experience')}>Study Workspace</button>
          </div>
          <div className="drawer-actions">
            {user ? (
              <button className="drawer-btn primary" onClick={() => { setMobileMenuOpen(false); onGoToWorkspace(); }}>
                Enter Workspace
              </button>
            ) : (
              <>
                <button className="drawer-btn outline" onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}>
                  Sign in
                </button>
                <button className="drawer-btn primary" onClick={() => { setMobileMenuOpen(false); onOpenAuth('signup'); }}>
                  Start Learning →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
