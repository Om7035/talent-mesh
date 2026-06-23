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

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
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
