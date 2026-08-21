import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(username, password)
      const destination = location.state?.from?.pathname ?? '/welcome'
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="badge-info">JWT Auth</span>
        <h1>Iniciar sesión</h1>
        <p className="subtitle">
          Ingresá con tu cuenta para acceder a la página de bienvenida.
        </p>

        <div className="form-field">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            className="text-input"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            className="text-input"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="login-hint caption-md">
          Credenciales de prueba: <strong>admin / admin123</strong>
        </p>
      </form>
    </main>
  )
}
