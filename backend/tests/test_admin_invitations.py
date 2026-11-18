import pytest
from fastapi.testclient import TestClient
from app.models.user import AdminRole, AdminUser


def test_create_invitation_super_admin_success(super_admin_client: TestClient):
    res = super_admin_client.post(
        "/api/v1/admin/invitations",
        json={"email": "new_staff@example.com", "role": "admin"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "new_staff@example.com"
    assert data["role"] == "admin"
    assert "invitation_token" in data
    assert "invitation_link" in data
    assert "/admin/accept-invitation?token=" in data["invitation_link"]


def test_create_invitation_forbidden_for_editor(editor_client: TestClient):
    res = editor_client.post(
        "/api/v1/admin/invitations",
        json={"email": "staff2@example.com", "role": "admin"},
    )
    assert res.status_code == 403


def test_create_invitation_unauthorized(client: TestClient):
    res = client.post(
        "/api/v1/admin/invitations",
        json={"email": "staff3@example.com", "role": "admin"},
    )
    assert res.status_code == 401


def test_create_invitation_existing_user(super_admin_client: TestClient, super_admin_user: AdminUser):
    res = super_admin_client.post(
        "/api/v1/admin/invitations",
        json={"email": super_admin_user.email, "role": "admin"},
    )
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


def test_accept_invitation_success(super_admin_client: TestClient, client: TestClient):
    # 1. Create invitation as super admin
    invite_res = super_admin_client.post(
        "/api/v1/admin/invitations",
        json={"email": "invited_operator@example.com", "role": "catalogue_editor"},
    )
    assert invite_res.status_code == 201
    token = invite_res.json()["invitation_token"]

    # 2. Accept invitation publicly
    accept_res = client.post(
        "/api/v1/admin/invitations/accept",
        json={
            "token": token,
            "full_name": "Tariq Operator",
            "password": "OperatorPass2026!",
        },
    )
    assert accept_res.status_code == 201
    user_data = accept_res.json()
    assert user_data["email"] == "invited_operator@example.com"
    assert user_data["full_name"] == "Tariq Operator"
    assert user_data["role"] == "catalogue_editor"
    assert user_data["is_active"] is True

    # 3. Log in with newly created credentials
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "invited_operator@example.com", "password": "OperatorPass2026!"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


def test_accept_invitation_invalid_token(client: TestClient):
    res = client.post(
        "/api/v1/admin/invitations/accept",
        json={
            "token": "completely-invalid-random-token-xyz12345",
            "full_name": "Ghost User",
            "password": "Password123!",
        },
    )
    assert res.status_code == 400
    assert "invalid" in res.json()["detail"].lower()


def test_accept_invitation_already_accepted(super_admin_client: TestClient, client: TestClient):
    invite_res = super_admin_client.post(
        "/api/v1/admin/invitations",
        json={"email": "single_use@example.com", "role": "admin"},
    )
    token = invite_res.json()["invitation_token"]

    # First acceptance
    res1 = client.post(
        "/api/v1/admin/invitations/accept",
        json={"token": token, "full_name": "User One", "password": "Password123!"},
    )
    assert res1.status_code == 201

    # Second acceptance should fail
    res2 = client.post(
        "/api/v1/admin/invitations/accept",
        json={"token": token, "full_name": "User Two", "password": "Password123!"},
    )
    assert res2.status_code == 400
    assert "already been accepted" in res2.json()["detail"].lower()


def test_revoke_invitation(super_admin_client: TestClient, client: TestClient):
    invite_res = super_admin_client.post(
        "/api/v1/admin/invitations",
        json={"email": "to_revoke@example.com", "role": "admin"},
    )
    inv_id = invite_res.json()["id"]
    token = invite_res.json()["invitation_token"]

    # Revoke
    revoke_res = super_admin_client.delete(f"/api/v1/admin/invitations/{inv_id}")
    assert revoke_res.status_code == 200

    # Try to accept revoked token
    accept_res = client.post(
        "/api/v1/admin/invitations/accept",
        json={"token": token, "full_name": "Revoked User", "password": "Password123!"},
    )
    assert accept_res.status_code == 400
    assert "revoked" in accept_res.json()["detail"].lower()
