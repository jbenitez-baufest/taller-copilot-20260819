const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function login(username, password) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.')
  }

  if (response.status === 401) {
    throw new Error('Credenciales inválidas. Revisá el usuario y la contraseña.')
  }
  if (!response.ok) {
    throw new Error('Ocurrió un error inesperado. Intentá nuevamente.')
  }
  return response.json()
}

export async function refreshToken(token) {
  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) {
    throw new Error('No se pudo refrescar el token')
  }
  return response.json()
}
