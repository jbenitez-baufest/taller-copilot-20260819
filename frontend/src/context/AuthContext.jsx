import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { login as loginRequest } from '../api/auth'

const SESSION_KEY = 'auth.session'

function decodePayload(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function isExpired(payload) {
  return typeof payload?.exp !== 'number' || payload.exp * 1000 <= Date.now()
}

function readStoredSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    const payload = session?.token ? decodePayload(session.token) : null
    if (!payload || isExpired(payload)) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password)
    const payload = decodePayload(data.access_token)
    const nextSession = {
      token: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      username: payload?.sub ?? username,
      expiresAt: typeof payload?.exp === 'number' ? payload.exp * 1000 : null,
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
