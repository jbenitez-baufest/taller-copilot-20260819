# Backend - JWT Auth API

Web API escrita en **Python** con **FastAPI** que implementa un caso de uso de **JSON Web Tokens (JWT)**.

## Características

- **Login**: endpoint `/login` que recibe usuario (`admin`) y contraseña (`admin123`) y devuelve un token JWT con una **expiración de 300 segundos**.
- **Refresh**: endpoint `/refresh` que recibe un token válido y devuelve uno nuevo con 300 segundos de expiración.
- **Recurso protegido**: endpoint `/protected` de ejemplo que requiere un token JWT válido enviado en el header `Authorization` con esquema Bearer.
- Gestión de dependencias con **Poetry**.
- Despliegue con **Docker** y **docker-compose**.
- Pruebas unitarias con **pytest**.

## Estructura del proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py        # Aplicación FastAPI y endpoints
│   ├── auth.py        # Lógica de autenticación y JWT
│   ├── config.py      # Configuración (secret, expiración, credenciales)
│   └── schemas.py     # Esquemas Pydantic de request/response
├── tests/
│   └── test_auth.py   # Pruebas unitarias
├── pyproject.toml     # Dependencias (Poetry)
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Requisitos

- Python 3.11+ y [Poetry](https://python-poetry.org/), o
- Docker y docker-compose

## Ejecución local (sin Docker)

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

La API quedará disponible en http://localhost:8000 y la documentación interactiva (Swagger UI) en http://localhost:8000/docs.

## Ejecución con Docker

```bash
cd backend
docker compose up --build
```

La API quedará disponible en http://localhost:8000.

## Uso de los endpoints

### 1. Login (obtener el token)

```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Respuesta:

```json
{
  "access_token": "<token_jwt>",
  "token_type": "bearer",
  "expires_in": 300
}
```

### 2. Refrescar el token

```bash
curl -X POST http://localhost:8000/refresh \
  -H "Content-Type: application/json" \
  -d '{"token": "<access_token>"}'
```

Devuelve un nuevo token con otros 300 segundos de vigencia.

### 3. Acceder al recurso protegido

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl http://localhost:8000/protected \
  -H "Authorization: <esquema> <token>"
```

El header debe tener el formato `Authorization: <esquema> <token>`, donde el esquema es el indicado en `token_type` (bearer) y `<token>` es el `access_token` obtenido en el login.

También podés usar la documentación interactiva en http://localhost:8000/docs para probar los endpoints: ejecutá `/login`, copiá el `access_token` de la respuesta y pegalo en el botón **Authorize** usando el esquema `Bearer` seguido del token.

## Pruebas unitarias

```bash
cd backend
poetry install --extras dev
poetry run pytest -v
```

## Configuración

La aplicación se puede configurar mediante variables de entorno:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `SECRET_KEY` | Clave secreta para firmar los tokens | `change-me-in-production` |
| `ALGORITHM` | Algoritmo de firma del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_SECONDS` | Expiración del token en segundos | `300` |
| `APP_USERNAME` | Usuario válido para el login | `admin` |
| `APP_PASSWORD` | Contraseña válida para el login | `admin123` |
