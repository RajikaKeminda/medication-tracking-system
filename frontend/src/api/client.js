const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiClientError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * @param {string} path - e.g. `/auth/login` (API_BASE should already include `/api` if needed)
 * @param {RequestInit & { body?: object, skipAuth?: boolean }} options
 */
export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, skipAuth = false, headers: extraHeaders, ...rest } =
    options
  const headers = { 'Content-Type': 'application/json', ...extraHeaders }

  if (!skipAuth) {
    const access = localStorage.getItem('accessToken')
    if (access) headers.Authorization = `Bearer ${access}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText || 'Request failed'
    throw new ApiClientError(msg, {
      status: res.status,
      code: json?.error?.code,
      details: json?.error?.details,
    })
  }
  return json
}
