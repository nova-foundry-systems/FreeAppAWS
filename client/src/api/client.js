const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

export function isApiConfigured() {
  return Boolean(baseUrl)
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch(path, { user, method = 'GET', body, headers = {} } = {}) {
  if (!baseUrl) {
    throw new ApiError('API is not configured. Set VITE_API_BASE_URL in client/.env', 0)
  }

  const token = user?.id_token ?? user?.access_token
  if (!token) {
    throw new ApiError('Not authenticated', 401)
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  const init = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  }

  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  const res = await fetch(url, init)
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok) {
    const message = data?.message ?? res.statusText ?? 'Request failed'
    throw new ApiError(message, res.status)
  }

  return data
}
