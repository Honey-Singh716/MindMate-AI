// Centralized API configuration for MindMate.
//
// In local development, VITE_API_URL is not set, so API_BASE_URL is "".
// The Vite dev-server proxy (vite.config.js) forwards /api/* → localhost:3000.
//
// In production (Vercel), VITE_API_URL is set to the Render backend URL
// (e.g. https://mindmate-ai-cbdb.onrender.com) so every fetch goes there.
//
// Trailing slashes are stripped to prevent double-slash paths.

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ''
).replace(/\/+$/, '')

/**
 * Typed fetch wrapper used by every component.
 *
 * @param {string} path   - Must start with "/api/…"
 * @param {RequestInit}   options  - Standard fetch options (method, body, …)
 * @param {string|null}   token    - Bearer token; pass null to skip Authorization header
 * @returns {Promise<any>} Parsed JSON response
 * @throws  {Error}        With .message from the server or a generic fallback
 */
export async function api(path, options = {}, token = localStorage.getItem('mindmate_token')) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch (netErr) {
    const err = new Error('Could not connect to server. The backend may be spinning up from sleep. Please try again.')
    err.isNetworkError = true
    throw err
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMsg = data.error || (
      response.status === 504 || response.status === 502
        ? 'Server is temporarily unavailable or restarting. Please try again.'
        : 'Something went wrong. Please try again.'
    )
    const err = new Error(errorMsg)
    err.payload = data
    err.status = response.status
    throw err
  }
  return data
}

/**
 * Multipart upload helper (no Content-Type header — browser sets the boundary).
 *
 * @param {string}      path    - Must start with "/api/…"
 * @param {FormData}    formData
 * @param {string|null} token
 */
export async function apiUpload(path, formData, token = localStorage.getItem('mindmate_token')) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    })
  } catch (netErr) {
    const err = new Error('Connection interrupted. The cloud backend may be waking up from cold sleep. Please try again.')
    err.isNetworkError = true
    throw err
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMsg = data.error || (
      response.status === 504 || response.status === 502
        ? 'Upload timed out while vectorizing. The cloud server is waking up — please try again.'
        : 'Upload failed. Please try again.'
    )
    const err = new Error(errorMsg)
    err.payload = data
    err.status = response.status
    throw err
  }
  return data
}
