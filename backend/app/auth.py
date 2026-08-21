"""Lógica de autenticación y generación/validación de tokens JWT."""
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app import config

security = HTTPBearer(auto_error=False)


def authenticate_user(username: str, password: str) -> bool:
    """Valida las credenciales del usuario."""
    return username == config.USERNAME and password == config.PASSWORD


def create_access_token(subject: str) -> tuple[str, int]:
    """Genera un token JWT con expiración configurada (300s por defecto)."""
    expires_in = config.ACCESS_TOKEN_EXPIRE_SECONDS
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
    }
    token = jwt.encode(payload, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return token, expires_in


def decode_token(token: str) -> dict:
    """Decodifica y valida un token JWT. Lanza HTTPException si es inválido."""
    try:
        return jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str:
    """Dependencia de FastAPI que exige un token de autenticación en el header Authorization."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere un token de autenticación",
        )
    payload = decode_token(credentials.credentials)
    return payload["sub"]
