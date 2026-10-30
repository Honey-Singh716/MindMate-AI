import { useState } from 'react'
import { api as centralApi } from '../api'

export default function AuthModal({ initialMode = 'login', onAuthenticated, onClose, api: legacyApi, tokenKey }) {
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
    <div className="auth-overlay animate-fade-in" onClick={onClose}>
      <div className="auth-modal-glass" onClick={(e) => e.stopPropagation()}>
        {/* Glow halo behind modal */}
        <div className="auth-modal-glow"></div>

        {/* Close Button if requested */}
        {onClose && (
          <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        )}

        <div className="auth-header">
          <div className="auth-brand-badge">
            <span className="brand-mark-spark">✦</span>
            <span className="brand-name-text">MindMate</span>
          </div>
          <span className="auth-eyebrow">NEURAL INTELLIGENCE STUDIO</span>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Workspace'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Enter your credentials to continue your private learning workspace.'
              : 'Sign up to keep your conversations, documents, and study plans private.'}
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
                <span className="spinner-dots"></span>
                <span>Connecting to neural cortex...</span>
              </span>
            ) : (
              <span>{mode === 'login' ? 'Sign In to Workspace' : 'Initialize Account'}</span>
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
