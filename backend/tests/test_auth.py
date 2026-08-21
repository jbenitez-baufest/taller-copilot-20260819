"""Pruebas unitarias para los endpoints de autenticación JWT."""
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient

from app import config
from app.main import app

client = TestClient(app)


def test_login_success():
    response = client.post("/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 300
    payload = jwt.decode(data["access_token"], config.SECRET_KEY, algorithms=[config.ALGORITHM])
    assert payload["sub"] == "admin"
    assert payload["exp"] - payload["iat"] == 300


def test_login_invalid_password():
    response = client.post("/login", json={"username": "admin", "password": "wrong"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciales inválidas"


def test_login_invalid_username():
    response = client.post("/login", json={"username": "root", "password": "admin123"})
    assert response.status_code == 401


def test_login_missing_fields():
    response = client.post("/login", json={"username": "admin"})
    assert response.status_code == 422


def _get_token() -> str:
    response = client.post("/login", json={"username": "admin", "password": "admin123"})
    return response.json()["access_token"]


def test_protected_with_valid_token():
    token = _get_token()
    response = client.get("/protected", headers={"Authorization": "Bearer " + token})
    assert response.status_code == 200
    assert "admin" in response.json()["message"]


def test_protected_without_token():
    response = client.get("/protected")
    assert response.status_code == 401


def test_protected_with_invalid_token():
    response = client.get("/protected", headers={"Authorization": "******"})
    assert response.status_code == 401


def test_protected_with_expired_token():
    now = datetime.now(timezone.utc)
    expired = jwt.encode(
        {"sub": "admin", "iat": now - timedelta(seconds=600), "exp": now - timedelta(seconds=300)},
        config.SECRET_KEY,
        algorithm=config.ALGORITHM,
    )
    response = client.get("/protected", headers={"Authorization": "Bearer " + expired})
    assert response.status_code == 401
    assert response.json()["detail"] == "El token ha expirado"


def test_refresh_success():
    token = _get_token()
    response = client.post("/refresh", json={"token": token})
    assert response.status_code == 200
    data = response.json()
    assert data["expires_in"] == 300
    new_token = data["access_token"]
    payload = jwt.decode(new_token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
    assert payload["sub"] == "admin"
    # El nuevo token debe ser válido para acceder a recursos protegidos
    response = client.get("/protected", headers={"Authorization": "Bearer " + new_token})
    assert response.status_code == 200


def test_refresh_with_invalid_token():
    response = client.post("/refresh", json={"token": "token-falso"})
    assert response.status_code == 401


def test_refresh_with_expired_token():
    now = datetime.now(timezone.utc)
    expired = jwt.encode(
        {"sub": "admin", "iat": now - timedelta(seconds=600), "exp": now - timedelta(seconds=300)},
        config.SECRET_KEY,
        algorithm=config.ALGORITHM,
    )
    response = client.post("/refresh", json={"token": expired})
    assert response.status_code == 401
    assert response.json()["detail"] == "El token ha expirado"


def test_root():
    response = client.get("/")
    assert response.status_code == 200


def test_cors_preflight_allows_frontend_origin():
    response = client.options(
        "/login",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
