import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../context/AuthContext'
import WelcomePage from './WelcomePage'

function buildToken(payload) {
  const encode = (value) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

function seedSession() {
  sessionStorage.setItem(
    'auth.session',
    JSON.stringify({
      token: buildToken({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + 300 }),
      tokenType: 'bearer',
      expiresIn: 300,
      username: 'admin',
      expiresAt: Date.now() + 300_000,
    }),
  )
}

describe('WelcomePage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    seedSession()
  })

  it('muestra el saludo al usuario autenticado', () => {
    render(
      <AuthProvider>
        <WelcomePage />
      </AuthProvider>,
    )

    expect(screen.getByText('¡Bienvenido, admin!')).toBeInTheDocument()
  })

  it('muestra la sección de certificaciones de Microsoft en IA 2026', () => {
    render(
      <AuthProvider>
        <WelcomePage />
      </AuthProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Certificaciones de Microsoft en IA 2026' }),
    ).toBeInTheDocument()
  })

  it('renderiza una card por cada certificación destacada', () => {
    render(
      <AuthProvider>
        <WelcomePage />
      </AuthProvider>,
    )

    expect(screen.getByText('AI-900')).toBeInTheDocument()
    expect(
      screen.getByText('Microsoft Certified: Azure AI Fundamentals'),
    ).toBeInTheDocument()
    expect(screen.getByText('AI-102')).toBeInTheDocument()
    expect(
      screen.getByText('Microsoft Certified: Azure AI Engineer Associate'),
    ).toBeInTheDocument()
    expect(screen.getByText('AI-103')).toBeInTheDocument()
    expect(
      screen.getByText('Azure AI Apps and Agents Developer Associate'),
    ).toBeInTheDocument()
    expect(screen.getByText('AB-100')).toBeInTheDocument()
    expect(
      screen.getByText('Microsoft Certified: Agentic AI Business Solutions Architect'),
    ).toBeInTheDocument()
  })

  it('cada card enlaza a Microsoft Learn en una pestaña nueva', () => {
    render(
      <AuthProvider>
        <WelcomePage />
      </AuthProvider>,
    )

    const links = screen.getAllByRole('link', { name: 'Ver en Microsoft Learn' })
    expect(links).toHaveLength(4)
    for (const link of links) {
      expect(link).toHaveAttribute('href', expect.stringContaining('learn.microsoft.com'))
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    }
  })
})
