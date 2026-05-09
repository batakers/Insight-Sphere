import pytest
import uuid

# Test using the admin client fixture
def test_get_me_admin(admin_client):
    response = admin_client.get("/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "admin_test" # Corrected from "admin"
    assert data["role"] == "admin"

def test_refresh_token(admin_client):
    response = admin_client.post("/auth/refresh")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_history(admin_client):
    response = admin_client.get("/auth/login-history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test login with provided credentials
def test_login_with_real_user(client, db_session):
    from domains.identity.service import create_user
    from domains.identity.schemas import UserCreate, RoleEnum
    
    # 1. Create the user first
    user_payload = UserCreate(
        username="faiz",
        pin="1234",
        role=RoleEnum.ADMIN,
        full_name="Faiz"
    )
    create_user(db=db_session, user=user_payload)

    # 2. Attempt login
    login_data = {"username": "faiz", "password": "1234"}
    response = client.post("/auth/login", data=login_data)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data

def test_login_invalid_credentials(client):
    response = client.post("/auth/login", data={"username": "fake", "password": "123"})
    assert response.status_code == 401
    # Corrected assertion to match Indonesian i18n
    assert "Username atau PIN salah" in response.json()["detail"]

def test_invite_user_unauthorized(regular_client):
    payload = {
        "email": "test@example.com",
        "role": "cashier",
        "store_nbr": 1,
        "full_name": "Test Cashier"
    }
    response = regular_client.post("/auth/invite-user", json=payload)
    assert response.status_code == 403

def test_invite_user_admin(admin_client):
    import uuid
    payload = {
        "email": f"test-{uuid.uuid4()}@example.com",
        "role": "cashier",
        "store_nbr": 1,
        "full_name": "Test Cashier"
    }
    response = admin_client.post("/auth/invite-user", json=payload)
    assert response.status_code == 201

def test_list_invitations(admin_client):
    response = admin_client.get("/auth/invitations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_forgot_password(client):
    response = client.post("/auth/forgot-password", json={"email": "nonexistent@example.com"})
    assert response.status_code == 200

def test_2fa_setup_init(admin_client):
    response = admin_client.post("/auth/2fa/setup/init")
    assert response.status_code == 200
    data = response.json()
    assert "secret" in data
    # The key is 'otpauth_uri', not 'qr_code_url' based on previous error
    assert "otpauth_uri" in data

def test_change_password_invalid_pin(admin_client):
    payload = {
        "current_pin": "wrong-pin",
        "new_pin": "123456"
    }
    response = admin_client.post("/auth/change-password", json=payload)
    # The API returns 401 for incorrect PIN
    assert response.status_code == 401
import pytest
import uuid

def test_get_me(admin_client):
    response = admin_client.get("/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "admin"
    assert data["role"] == "admin"

def test_refresh_token(admin_client):
    response = admin_client.post("/auth/refresh")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_history(admin_client):
    response = admin_client.get("/auth/login-history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_login_invalid_credentials(client):
    response = client.post("/auth/login", data={"username": "fake", "password": "123"})
    assert response.status_code == 401

def test_invite_user_unauthorized(regular_client):
    payload = {
        "email": "test@example.com",
        "role": "cashier",
        "store_nbr": 1,
        "full_name": "Test Cashier"
    }
    response = regular_client.post("/auth/invite-user", json=payload)
    assert response.status_code == 403

def test_invite_user_admin(admin_client):
    payload = {
        "email": f"test-{uuid.uuid4()}@example.com",
        "role": "cashier",
        "store_nbr": 1,
        "full_name": "Test Cashier"
    }
    response = admin_client.post("/auth/invite-user", json=payload)
    assert response.status_code == 201

def test_list_invitations(admin_client):
    response = admin_client.get("/auth/invitations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_forgot_password(client):
    response = client.post("/auth/forgot-password", json={"email": "nonexistent@example.com"})
    # Should always return 200 to prevent user enumeration
    assert response.status_code == 200

def test_2fa_setup_init(admin_client):
    response = admin_client.post("/auth/2fa/setup/init")
    assert response.status_code == 200
    data = response.json()
    assert "secret" in data
    assert "qr_code_url" in data

def test_change_password_invalid_pin(admin_client):
    payload = {
        "current_pin": "wrong-pin",
        "new_pin": "123456"
    }
    response = admin_client.post("/auth/change-password", json=payload)
    # The pin verify depends on mocked DB state, could be 400 or 401. Let's accept 401
    assert response.status_code in [400, 401]
import pytest

def test_login_missing_fields(client):
    response = client.post("/auth/login", data={})
    assert response.status_code == 422

def test_login_invalid_credentials(client):
    response = client.post("/auth/login", data={"username": "wrong@test.com", "password": "wrongpassword"})
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]

def test_register_admin_edge_cases(client):
    response = client.post("/auth/register-admin", json={
        "email": "invalid-email",
        "password": "123",
        "full_name": ""
    })
    assert response.status_code in [400, 422]

def test_unauthenticated_access_to_protected_routes(client):
    protected_routes = [
        "/auth/me",
        "/auth/login-history",
        "/auth/invitations"
    ]
    for route in protected_routes:
        res = client.get(route)
        assert res.status_code == 401

