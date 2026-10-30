import { useState, useEffect } from 'react'

export default function Navbar({ onOpenAuth, user, onGoToWorkspace }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 30)
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
        {/* Left: Brand + Nav Links */}
        <div className="nav-left">
          <a href="#" className="nav-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <span className="neural-logo-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z"
                  fill="url(#brandGrad)"
                />
                <circle cx="12" cy="11" r="2.5" fill="#FFFFFF" />
                <defs>
                  <linearGradient id="brandGrad" x1="3" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F368E0" />
                    <stop offset="0.5" stopColor="#B49AFF" />
                    <stop offset="1" stopColor="#8057E5" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="brand-name">MindMate</span>
            <span className="brand-version-chip">2.0</span>
          </a>

          <nav className="nav-links desktop-only">
            <button className="nav-link" onClick={() => scrollToSection('product')}>Product</button>
            <button className="nav-link" onClick={() => scrollToSection('features')}>Features</button>
            <button className="nav-link" onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button className="nav-link" onClick={() => scrollToSection('experience')}>Experience</button>
          </nav>
        </div>

        {/* Right: Auth / Action */}
        <div className="nav-right">
          {user ? (
            <button className="nav-cta-btn" onClick={onGoToWorkspace}>
              <span>Enter Workspace</span>
              <span className="btn-glow-dot"></span>
            </button>
          ) : (
            <>
              <button className="nav-ghost-btn desktop-only" onClick={() => onOpenAuth('login')}>
                Log in
              </button>
              <button className="nav-cta-btn" onClick={() => onOpenAuth('signup')}>
                <span>Start Learning</span>
                <span className="btn-arrow">→</span>
              </button>
            </>
          )}

          {/* Hamburger Menu Toggle */}
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="drawer-links">
            <button onClick={() => scrollToSection('product')}>Product</button>
            <button onClick={() => scrollToSection('features')}>Features</button>
            <button onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button onClick={() => scrollToSection('experience')}>Experience</button>
          </div>
          <div className="drawer-actions">
            {user ? (
              <button className="drawer-btn primary" onClick={() => { setMobileMenuOpen(false); onGoToWorkspace(); }}>
                Enter Workspace
              </button>
            ) : (
              <>
                <button className="drawer-btn outline" onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}>
                  Log in
                </button>
                <button className="drawer-btn primary" onClick={() => { setMobileMenuOpen(false); onOpenAuth('signup'); }}>
                  Start Learning
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
