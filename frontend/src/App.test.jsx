import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

vi.mock('./api/auth', () => ({
  login: vi.fn(),
}))

import { login as loginRequest } from './api/auth'

function buildToken(payload) {
  const encode = (value) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

function validLoginResponse() {
  return {
    access_token: buildToken({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + 300 }),
    token_type: 'bearer',
    expires_in: 300,
  }
}

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear()
    window.history.replaceState(null, '', '/')
    vi.clearAllMocks()
  })

  it('muestra la página de login por defecto', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
  })

  it('no permite ingresar a la página de bienvenida sin iniciar sesión', async () => {
    window.history.replaceState(null, '', '/welcome')
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/¡Bienvenido/)).not.toBeInTheDocument()
  })

  it('inicia sesión contra el backend y navega a la página de bienvenida', async () => {
    loginRequest.mockResolvedValue(validLoginResponse())
    const user = userEvent.setup()
    render(<App />)

    await user.type(await screen.findByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), 'admin123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('¡Bienvenido, admin!')).toBeInTheDocument()
    expect(loginRequest).toHaveBeenCalledWith('admin', 'admin123')
    expect(sessionStorage.getItem('auth.session')).not.toBeNull()
  })

  it('muestra un mensaje de error cuando las credenciales son inválidas', async () => {
    loginRequest.mockRejectedValue(
      new Error('Credenciales inválidas. Revisá el usuario y la contraseña.'),
    )
    const user = userEvent.setup()
    render(<App />)

    await user.type(await screen.findByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas')
    expect(sessionStorage.getItem('auth.session')).toBeNull()
  })

  it('cierra la sesión y vuelve a la página de login', async () => {
    loginRequest.mockResolvedValue(validLoginResponse())
    const user = userEvent.setup()
    render(<App />)

    await user.type(await screen.findByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), 'admin123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('¡Bienvenido, admin!')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Iniciar sesión' }),
      ).toBeInTheDocument(),
    )
    expect(sessionStorage.getItem('auth.session')).toBeNull()
  })
})
