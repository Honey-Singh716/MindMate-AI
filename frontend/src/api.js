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
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.')
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const err = new Error(data.error || 'Upload failed. Please try again.')
    err.payload = data
    err.status = response.status
    throw err
  }
  return data
}

