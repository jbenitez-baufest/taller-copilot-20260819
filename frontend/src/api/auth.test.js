import { afterEach, describe, expect, it, vi } from 'vitest'
import { login } from './auth'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('login', () => {
  it('devuelve el token cuando las credenciales son válidas', async () => {
    const payload = { access_token: 'jwt-token', token_type: 'bearer', expires_in: 300 }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(payload),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(login('admin', 'admin123')).resolves.toEqual(payload)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/login',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('lanza un error de credenciales cuando la API responde 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Credenciales inválidas' }),
      }),
    )

    await expect(login('admin', 'wrong')).rejects.toThrow('Credenciales inválidas')
  })

  it('lanza un error genérico ante otras respuestas fallidas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    )

    await expect(login('admin', 'admin123')).rejects.toThrow('error inesperado')
  })

  it('lanza un error de conexión cuando el servidor no responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))

    await expect(login('admin', 'admin123')).rejects.toThrow('No se pudo conectar')
  })
})
