export const setToken = (token: string, refreshToken?: string, role?: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('talentMesh_accessToken', token)
    if (refreshToken) {
      localStorage.setItem('talentMesh_refreshToken', refreshToken)
    }
    // Set cookies so middleware can check auth state
    document.cookie = `tm_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    if (role) {
      let finalRole = role.toLowerCase()
      if (finalRole === 'recruiter') finalRole = 'client'
      document.cookie = `tm_role=${finalRole}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    }
  }
}

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('talentMesh_accessToken')
  }
  return null
}

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('talentMesh_accessToken')
    localStorage.removeItem('talentMesh_refreshToken')
    // Clear the auth cookies
    document.cookie = 'tm_auth=; path=/; max-age=0; SameSite=Lax'
    document.cookie = 'tm_role=; path=/; max-age=0; SameSite=Lax'
  }
}

// Dedupe concurrent refresh attempts — if multiple requests 401 at once
// (e.g. several widgets fetching on page load), only refresh the token once.
let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null
  const refreshToken = localStorage.getItem('talentMesh_refreshToken')
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null
        const json = await res.json().catch(() => null)
        const data = json?.data ?? json
        if (!data?.accessToken) return null
        localStorage.setItem('talentMesh_accessToken', data.accessToken)
        if (data.refreshToken) {
          localStorage.setItem('talentMesh_refreshToken', data.refreshToken)
        }
        document.cookie = `tm_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        return data.accessToken as string
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export const apiClient = async (endpoint: string, options: RequestInit = {}, _isRetry = false): Promise<any> => {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  })

  // Access token expired — try a silent refresh once, then retry the original request.
  // Skip this for the refresh/login/signup endpoints themselves to avoid loops.
  if (response.status === 401 && !_isRetry && !endpoint.startsWith('/auth/')) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiClient(endpoint, options, true)
    }
    removeToken()
  }

  const json = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      Array.isArray(json?.message) ? json.message.join(', ') : json?.message || 'Something went wrong'
    )
  }

  // Unwrap the backend's TransformInterceptor envelope: { success, statusCode, message, data }
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data
  }

  return json
}
