import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
}))

import { login as loginRequest } from '../api/auth'

function buildToken(payload) {
  const encode = (value) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

function Probe() {
  const { isAuthenticated, session, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="status">{isAuthenticated ? 'autenticado' : 'anónimo'}</span>
      <span data-testid="username">{session?.username ?? ''}</span>
      <button onClick={() => login('admin', 'admin123')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('guarda el token en sessionStorage al iniciar sesión', async () => {
    loginRequest.mockResolvedValue({
      access_token: buildToken({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + 300 }),
      token_type: 'bearer',
      expires_in: 300,
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('anónimo')

    await act(async () => {
      screen.getByText('login').click()
    })

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('autenticado'))
    expect(screen.getByTestId('username')).toHaveTextContent('admin')
    expect(sessionStorage.getItem('auth.session')).not.toBeNull()
  })

  it('limpia la sesión al cerrar sesión', async () => {
    loginRequest.mockResolvedValue({
      access_token: buildToken({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + 300 }),
      token_type: 'bearer',
      expires_in: 300,
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('login').click()
    })
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('autenticado'))

    await act(async () => {
      screen.getByText('logout').click()
    })

    expect(screen.getByTestId('status')).toHaveTextContent('anónimo')
    expect(sessionStorage.getItem('auth.session')).toBeNull()
  })

  it('descarta un token expirado guardado en sessionStorage', () => {
    sessionStorage.setItem(
      'auth.session',
      JSON.stringify({
        token: buildToken({ sub: 'admin', exp: Math.floor(Date.now() / 1000) - 10 }),
        username: 'admin',
      }),
    )

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('anónimo')
    expect(sessionStorage.getItem('auth.session')).toBeNull()
  })

  it('restaura la sesión cuando el token guardado sigue vigente', () => {
    sessionStorage.setItem(
      'auth.session',
      JSON.stringify({
        token: buildToken({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + 300 }),
        username: 'admin',
      }),
    )

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('autenticado')
    expect(screen.getByTestId('username')).toHaveTextContent('admin')
  })
})
