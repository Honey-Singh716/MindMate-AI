import { useState } from 'react'
import { api as centralApi } from '../api'

export default function AuthModal({ initialMode = 'signup', onAuthenticated, onClose, api: legacyApi, tokenKey }) {
  // Prefer the centralized api (with correct base URL) over the prop-passed one
  const api = centralApi
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api(
        `/api/auth/${mode}`,
        {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password }),
        },
        null
      )
      localStorage.setItem(tokenKey, data.token)
      onAuthenticated(data.user)
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal-glass" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        {onClose && (
          <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        )}

        <div className="auth-header">
          <div className="auth-brand-badge">
            <span className="academic-logo-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#174C3C" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#174C3C" fill="rgba(23, 76, 60, 0.08)" />
                <circle cx="12" cy="10" r="1.5" fill="#174C3C" />
              </svg>
            </span>
            <span className="brand-name-text">MindMate</span>
          </div>

          <span className="auth-eyebrow">ACADEMIC STUDY COMPANION</span>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Start Learning'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Enter your credentials to continue your private learning workspace.'
              : 'Create an account to explore textbooks, generate study plans, and ask contextual questions.'}
          </p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="auth-email">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <span className="input-icon">✉</span>
              <input
                id="auth-email"
                type="email"
                className="auth-input"
                placeholder="scholar@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field-group">
            <div className="label-with-hint">
              <label className="auth-label" htmlFor="auth-password">
                Password
              </label>
              {mode === 'signup' && (
                <span className="auth-hint">Min. 8 characters</span>
              )}
            </div>
            <div className="auth-input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error-banner animate-fade-in" role="alert">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={busy}>
            {busy ? (
              <span className="submit-loading-state">
                <span>Connecting to study workspace...</span>
              </span>
            ) : (
              <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account'}</span>
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="auth-footer-nav">
          <span className="footer-switch-text">
            {mode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
          </span>
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => {
              setError('')
              setMode(mode === 'login' ? 'signup' : 'login')
            }}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </div>

        {/* Bottom security assurance */}
        <div className="auth-security-note">
          <span className="security-icon">🛡</span>
          <span>End-to-end JWT session security · Private document vectors</span>
        </div>
      </div>
    </div>
  )
}
