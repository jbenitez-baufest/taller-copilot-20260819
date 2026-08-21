"""Aplicación Web API con FastAPI que implementa un caso de uso de JWT."""
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.auth import authenticate_user, create_access_token, decode_token, get_current_user
from app.schemas import LoginRequest, RefreshRequest, TokenResponse

app = FastAPI(
    title="JWT Auth API",
    description="Web API que implementa autenticación con JSON Web Tokens (JWT)",
    version="0.1.0",
)

# CORS: permite que el frontend (Vite) consuma la API desde http://localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "JWT Auth API - ver /docs para la documentación interactiva"}


@app.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest):
    """Autentica al usuario (admin/admin123) y devuelve un token JWT con expiración de 300 segundos."""
    if not authenticate_user(credentials.username, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )
    token, expires_in = create_access_token(credentials.username)
    return TokenResponse(access_token=token, expires_in=expires_in)


@app.post("/refresh", response_model=TokenResponse)
def refresh(request: RefreshRequest):
    """Recibe un token válido y devuelve un nuevo token con 300 segundos de expiración."""
    payload = decode_token(request.token)
    token, expires_in = create_access_token(payload["sub"])
    return TokenResponse(access_token=token, expires_in=expires_in)


@app.get("/protected")
def protected(current_user: str = Depends(get_current_user)):
    """Endpoint protegido de ejemplo: requiere un token JWT válido."""
    return {"message": f"Hola {current_user}, accediste a un recurso protegido"}
