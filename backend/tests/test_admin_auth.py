import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.models.user import AdminRefreshToken, AdminUser
from app.core.security import create_refresh_token, hash_token


def test_login_success(client: TestClient, super_admin_user: AdminUser):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": super_admin_user.email, "password": "SuperSecret2026!"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0


def test_login_invalid_password(client: TestClient, super_admin_user: AdminUser):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": super_admin_user.email, "password": "WrongPassword!"},
    )
    assert res.status_code == 401
    assert "incorrect email or password" in res.json()["detail"].lower()


def test_login_inactive_user(client: TestClient, super_admin_user: AdminUser, db_session):
    super_admin_user.is_active = False
    db_session.commit()

    res = client.post(
        "/api/v1/auth/login",
        json={"email": super_admin_user.email, "password": "SuperSecret2026!"},
    )
    assert res.status_code == 400
    assert "inactive" in res.json()["detail"].lower()


def test_refresh_token_cycle(client: TestClient, super_admin_user: AdminUser):
    # 1. Login to get tokens
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": super_admin_user.email, "password": "SuperSecret2026!"},
    )
    assert login_res.status_code == 200
    refresh_token = login_res.json()["refresh_token"]

    # 2. Use refresh token to obtain new access and refresh tokens
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_refresh_token_rotation_and_reuse_attack_detection(client: TestClient, super_admin_user: AdminUser):
    # 1. Login to get initial token pair
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": super_admin_user.email, "password": "SuperSecret2026!"},
    )
    assert login_res.status_code == 200
    old_refresh_token = login_res.json()["refresh_token"]

    # 2. Rotate token legitimately
    rotate_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh_token},
    )
    assert rotate_res.status_code == 200
    new_refresh_token = rotate_res.json()["refresh_token"]
    assert new_refresh_token != old_refresh_token

    # 3. Attacker attempts to replay the already-used old refresh token
    reuse_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh_token},
    )
    assert reuse_res.status_code == 401
    assert "revoked" in reuse_res.json()["detail"].lower()

    # 4. As a security safeguard, all active sessions for this user should now be invalidated
    subsequent_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": new_refresh_token},
    )
    assert subsequent_res.status_code == 401


def test_refresh_token_logout_revocation(
    client: TestClient, super_admin_client: TestClient, super_admin_user: AdminUser
):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": super_admin_user.email, "password": "SuperSecret2026!"},
    )
    refresh_token = login_res.json()["refresh_token"]

    # Logout and revoke token
    logout_res = super_admin_client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
    )
    assert logout_res.status_code == 200
    assert "logged out" in logout_res.json()["message"].lower()

    # Attempting to refresh with the revoked token must fail
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 401


def test_refresh_token_inactive_account(client: TestClient, super_admin_user: AdminUser, db_session):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": super_admin_user.email, "password": "SuperSecret2026!"},
    )
    refresh_token = login_res.json()["refresh_token"]

    # Deactivate account
    super_admin_user.is_active = False
    db_session.commit()

    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 401
    assert "inactive" in refresh_res.json()["detail"].lower()


def test_refresh_token_expired(client: TestClient, super_admin_user: AdminUser, db_session):
    # Create token that expired 1 hour ago
    expired_token, t_hash, _ = create_refresh_token(
        subject=str(super_admin_user.id),
        expires_delta=timedelta(hours=-1),
    )
    db_token = AdminRefreshToken(
        token_hash=t_hash,
        user_id=super_admin_user.id,
        expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
        is_revoked=False,
    )
    db_session.add(db_token)
    db_session.commit()

    res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": expired_token},
    )
    assert res.status_code == 401


def test_refresh_token_invalid(client: TestClient):
    res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid.jwt.token"},
    )
    assert res.status_code == 401


def test_get_me(super_admin_client: TestClient, super_admin_user: AdminUser):
    res = super_admin_client.get("/api/v1/auth/me")
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == super_admin_user.email
    assert data["role"] == "super_admin"
    assert data["is_active"] is True


def test_get_me_unauthorized(client: TestClient):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401


def test_change_password(super_admin_client: TestClient, super_admin_user: AdminUser):
    res = super_admin_client.post(
        "/api/v1/auth/change-password",
        json={
            "current_password": "SuperSecret2026!",
            "new_password": "NewSecretPassword2026!",
        },
    )
    assert res.status_code == 200
    assert "password changed successfully" in res.json()["message"].lower()

    # Re-login with new password
    login_res = super_admin_client.post(
        "/api/v1/auth/login",
        json={"email": super_admin_user.email, "password": "NewSecretPassword2026!"},
    )
    assert login_res.status_code == 200
