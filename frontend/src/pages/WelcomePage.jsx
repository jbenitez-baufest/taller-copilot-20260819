import { useAuth } from '../context/AuthContext'

const AI_CERTIFICATIONS_2026 = [
  {
    code: 'AI-900',
    name: 'Microsoft Certified: Azure AI Fundamentals',
    level: 'Principiante',
    description:
      'Demuestra conocimientos fundamentales de conceptos de IA y de los servicios de Microsoft Azure para crear soluciones de IA.',
    url: 'https://learn.microsoft.com/credentials/certifications/azure-ai-fundamentals/',
  },
  {
    code: 'AI-102',
    name: 'Microsoft Certified: Azure AI Engineer Associate',
    level: 'Intermedio',
    description:
      'Diseña e implementa soluciones de IA en Azure usando Azure AI Services, Azure AI Search y Azure OpenAI.',
    url: 'https://learn.microsoft.com/credentials/certifications/azure-ai-engineer/',
  },
  {
    code: 'AI-103',
    name: 'Azure AI Apps and Agents Developer Associate',
    level: 'Intermedio',
    description:
      'Nueva certificación 2026: desarrolla aplicaciones y agentes de IA en Azure. Reemplaza a Azure AI Engineer Associate en las especializaciones de AI Platform y AI Apps.',
    url: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/ai-103',
  },
  {
    code: 'AB-100',
    name: 'Microsoft Certified: Agentic AI Business Solutions Architect',
    level: 'Avanzado',
    description:
      'Nueva certificación 2026: arquitectura de soluciones empresariales con IA agéntica en Dynamics 365 y Power Platform.',
    url: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/ab-100',
  },
]

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

          <section className="certifications-section" aria-label="Certificaciones de Microsoft en IA 2026">
            <h2 className="heading-lg">Certificaciones de Microsoft en IA 2026</h2>
            <p className="certifications-intro">
              Estas son las certificaciones más recientes de Microsoft en Inteligencia
              Artificial para 2026, según Microsoft Learn.
            </p>
            <ul className="certifications-grid">
              {AI_CERTIFICATIONS_2026.map((certification) => (
                <li key={certification.code}>
                  <article className="card-dark certification-card">
                    <div className="certification-card-header">
                      <span className="badge-info">{certification.code}</span>
                      <span className="caption-md mute-dark">{certification.level}</span>
                    </div>
                    <h3>{certification.name}</h3>
                    <p>{certification.description}</p>
                    <a
                      href={certification.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver en Microsoft Learn
                    </a>
                  </article>
                </li>
              ))}
            </ul>
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
