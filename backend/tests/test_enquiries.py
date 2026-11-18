import pytest
from fastapi.testclient import TestClient
from app.api.v1.enquiries import _ip_rate_limits


@pytest.fixture(autouse=True)
def clear_rate_limits():
    _ip_rate_limits.clear()
    yield
    _ip_rate_limits.clear()


def test_create_valid_enquiry(client: TestClient):
    payload = {
        "name": "Ahmed Raza",
        "phone": "+92 300 1234567",
        "email": "ahmed@example.com",
        "message": "Please quote pricing for 50 sheets of MDF board.",
        "locale": "en",
        "channel": "whatsapp",
    }
    response = client.post("/api/v1/enquiries", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["name"] == "Ahmed Raza"
    assert data["status"] == "new"
    assert data["channel"] == "whatsapp"
    assert data["product_id"] is None


def test_create_product_enquiry(client_with_seed: TestClient):
    # Fetch an existing product
    prod_res = client_with_seed.get("/api/v1/products/commercial-mdf-sheet-18mm")
    assert prod_res.status_code == 200
    prod_id = prod_res.json()["id"]

    payload = {
        "name": "Ali Hassan",
        "phone": "0321-9876543",
        "message": "Is this sheet available for same-day pickup in Sargodha?",
        "locale": "ur",
        "channel": "call",
        "product_id": prod_id,
    }
    response = client_with_seed.post("/api/v1/enquiries", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["product_id"] == prod_id
    assert data["channel"] == "call"
    assert data["locale"] == "ur"


def test_create_contact_submission(client: TestClient):
    payload = {
        "name": "Sargodha Builders",
        "phone": "+92 48 3721234",
        "email": "info@sargodhabuilders.com",
        "message": "Inquiry regarding architectural door locks for residential project.",
    }
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "general"
    assert data["status"] == "new"


def test_honeypot_anti_spam(client: TestClient):
    payload = {
        "name": "Spam Bot",
        "phone": "+92 300 0000000",
        "message": "Cheap SEO and marketing services available!",
        "hp_field": "I am an automated spam bot filling hidden fields",
    }
    response = client.post("/api/v1/enquiries", json=payload)
    # Graciously accepted to avoid bot probing, but marked as spam internally
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "spam"


def test_phone_validation_error(client: TestClient):
    payload = {
        "name": "Invalid Customer",
        "phone": "123",  # Less than 7 digits
        "message": "Testing phone validation error",
    }
    response = client.post("/api/v1/enquiries", json=payload)
    assert response.status_code == 422


def test_message_too_short_validation(client: TestClient):
    payload = {
        "name": "Customer",
        "phone": "+92 300 1234567",
        "message": "hi",  # min_length is 5
    }
    response = client.post("/api/v1/enquiries", json=payload)
    assert response.status_code == 422


def test_rate_limiter_enforcement(client: TestClient):
    test_ip = "198.51.100.99"
    headers = {"x-forwarded-for": test_ip}
    payload = {
        "name": "Repeated Submitter",
        "phone": "+92 300 7654321",
        "message": "Checking rate limit enforcement threshold",
    }

    # 5 allowed submissions
    for i in range(5):
        res = client.post("/api/v1/enquiries", json=payload, headers=headers)
        assert res.status_code == 201, f"Submission {i+1} failed with {res.status_code}"

    # 6th submission must be blocked by rate limiter
    blocked_res = client.post("/api/v1/enquiries", json=payload, headers=headers)
    assert blocked_res.status_code == 429
    assert "too many enquiry submissions" in blocked_res.json()["detail"].lower()

    # Different IP should still be allowed
    other_headers = {"x-forwarded-for": "198.51.100.100"}
    allowed_res = client.post("/api/v1/enquiries", json=payload, headers=other_headers)
    assert allowed_res.status_code == 201


def test_rate_limiter_spoofed_header_prevention(client: TestClient):
    """Verify that an attacker cannot bypass rate limiting by rotating fake X-Forwarded-For headers

    when Nginx sets X-Real-IP authoritatively from the TCP connection.
    """
    real_ip = "203.0.113.77"
    payload = {
        "name": "Spoofing Attacker",
        "phone": "+92 300 9988776",
        "message": "Attempting rate limit header evasion",
    }

    # 5 submissions from real_ip with rotating spoofed X-Forwarded-For
    for i in range(5):
        headers = {
            "x-real-ip": real_ip,
            "x-forwarded-for": f"10.0.0.{i+1}, 172.16.0.{i+1}",
        }
        res = client.post("/api/v1/enquiries", json=payload, headers=headers)
        assert res.status_code == 201

    # 6th submission with yet another fake X-Forwarded-For must still be blocked by real_ip
    spoofed_6th = {
        "x-real-ip": real_ip,
        "x-forwarded-for": "192.168.1.99",
    }
    res_blocked = client.post("/api/v1/enquiries", json=payload, headers=spoofed_6th)
    assert res_blocked.status_code == 429
    assert "too many enquiry submissions" in res_blocked.json()["detail"].lower()


def test_public_enquiry_read_prohibited(client: TestClient):
    # Enquiries cannot be read or listed publicly (must be 405 Method Not Allowed)
    response = client.get("/api/v1/enquiries")
    assert response.status_code in [404, 405]
