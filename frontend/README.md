# Frontend - JWT Auth App

Aplicación web escrita en **React** (con **Vite**) que consume los servicios del backend (`backend/`, FastAPI + JWT). Implementa una **página de login** y una **página de bienvenida protegida**, siguiendo el estándar de diseño definido en [`DESIGN.md`](../DESIGN.md) (design system basado en PlayStation).

## Características

- **Login** (`/login`): formulario que consume el endpoint `POST /login` del backend, guarda el token JWT en **`sessionStorage`** y redirige a la página de bienvenida.
- **Bienvenida** (`/welcome`): página protegida. **No se puede ingresar si no se inició sesión**: cualquier acceso sin token válido redirige a `/login`. Muestra el detalle de la sesión (usuario, tipo de token, duración y expiración) y permite **cerrar sesión** (elimina el token de la sesión y vuelve a `/login`).
- **Gestión de sesión**: el token se almacena en `sessionStorage` (se conserva al recargar la pestaña y se descarta al cerrarla o al cerrar sesión). Los tokens **expirados se descartan automáticamente** al cargar la aplicación.
- **Manejo de errores**: credenciales inválidas (401), errores del servidor y fallos de conexión se muestran como mensajes en la pantalla de login.
- **Diseño**: implementa los tokens de `DESIGN.md` como variables CSS (colores, tipografía, radios y espaciado): botones pill (`rounded-full`) en PlayStation Blue `#0070d1`, inputs con radio de 4px, tarjetas de 8px, bandas full-bleed sobre canvas oscuro y tipografía light (300) para títulos display.

## Estructura del proyecto

```
frontend/
├── src/
│   ├── api/
│   │   ├── auth.js              # Cliente HTTP del backend (login / refresh)
│   │   └── auth.test.js
│   ├── components/
│   │   ├── RequireAuth.jsx           # Guarda de rutas: exige sesión iniciada
│   │   └── RedirectIfAuthenticated.jsx  # Redirige a /welcome si ya hay sesión
│   ├── context/
│   │   ├── AuthContext.jsx      # Estado de autenticación + sessionStorage
│   │   └── AuthContext.test.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx        # Página de login
│   │   └── WelcomePage.jsx      # Página de bienvenida (protegida)
│   ├── test/
│   │   └── setup.js             # Setup de Vitest + Testing Library
│   ├── App.jsx                  # Definición de rutas
│   ├── App.test.jsx             # Pruebas de flujo completo (routing + auth)
│   ├── main.jsx                 # Punto de entrada
│   └── index.css                # Tokens de DESIGN.md y estilos globales
├── .env.example                 # Variables de entorno de ejemplo
├── index.html
├── vite.config.js               # Config de Vite + Vitest
└── package.json
```

## Requisitos

- Node.js 20+
- El **backend** en ejecución (ver [`backend/README.md`](../backend/README.md)):

  ```bash
  cd backend
  poetry install
  poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```

## Ejecución

```bash
cd frontend
npm install
cp .env.example .env   # opcional; por defecto apunta a http://localhost:8000
npm run dev
```

La aplicación quedará disponible en http://localhost:5173.

## Uso

1. Abrí http://localhost:5173 — serás redirigido a la página de **login**.
2. Ingresá las credenciales de prueba: **usuario `admin` / contraseña `admin123`**.
3. El frontend llama a `POST /login` del backend, guarda el `access_token` en `sessionStorage` y navega a la **página de bienvenida**.
4. En la bienvenida podés ver el detalle de la sesión y **cerrar sesión**, lo que elimina el token y vuelve al login.
5. Si intentás entrar directamente a `/welcome` sin sesión iniciada, la aplicación te redirige a `/login` (y tras el login vuelve a la página solicitada).

## Configuración

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del backend | `http://localhost:8000` |

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR (puerto 5173) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm test` | Pruebas unitarias con Vitest + Testing Library |
| `npm run test:watch` | Pruebas en modo watch |
| `npm run lint` | Linting con oxlint |

## Pruebas

```bash
cd frontend
npm test
```

Las pruebas cubren el cliente de la API, el contexto de autenticación (guardado/restauración/expiración del token en `sessionStorage`) y el flujo completo de la aplicación: login exitoso, credenciales inválidas, protección de la ruta `/welcome` y cierre de sesión.
