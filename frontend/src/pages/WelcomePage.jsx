import { useAuth } from '../context/AuthContext'

function formatExpiration(expiresAt) {
  if (!expiresAt) return '—'
  return new Date(expiresAt).toLocaleTimeString()
}

export default function WelcomePage() {
  const { session, logout } = useAuth()

  return (
    <>
      <header className="primary-nav">
        <span className="brand">JWT Auth</span>
        <button type="button" className="button-secondary-dark" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <main className="hero-band-dark">
        <div className="welcome-content">
          <span className="badge-info">Sesión activa</span>
          <h1 className="display-xl">¡Bienvenido, {session?.username}!</h1>
          <p className="lead">
            Iniciaste sesión correctamente. Tu token JWT se encuentra guardado en
            la sesión del navegador y se eliminará al cerrar sesión o cuando la
            pestaña se cierre.
          </p>

          <section className="card-dark session-card" aria-label="Detalle de la sesión">
            <h2>Detalle de la sesión</h2>
            <dl>
              <dt>Usuario</dt>
              <dd>{session?.username}</dd>
              <dt>Tipo de token</dt>
              <dd>{session?.tokenType}</dd>
              <dt>Duración</dt>
              <dd>{session?.expiresIn} segundos</dd>
              <dt>Expira a las</dt>
              <dd>{formatExpiration(session?.expiresAt)}</dd>
            </dl>
          </section>
        </div>
      </main>

      <footer className="footer-section">
        <p className="caption-md">
          Taller Copilot · Aplicación de ejemplo con autenticación JWT.
        </p>
      </footer>
    </>
  )
}
