const BASE = import.meta.env.DEV ? '/api' : 'https://ecommerce-churn-api-dubal.onrender.com';

function getToken() {
  return localStorage.getItem('token')
}

export async function api(endpoint, options = {}) {
  const { method = 'GET', body, auth = false, params } = options

  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let url = `${BASE}${endpoint}`
  if (params) {
    const search = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') search.append(k, v)
    }
    const qs = search.toString()
    if (qs) url += `?${qs}`
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || `Request failed (${res.status})`)
  }

  return json
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export function getStoredToken() {
  return localStorage.getItem('token')
}

export function clearToken() {
  localStorage.removeItem('token')
}
