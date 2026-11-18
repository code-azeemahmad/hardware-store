import pytest
from starlette.testclient import TestClient


def test_admin_enquiries_unauthorized(client: TestClient):
    res = client.get("/api/v1/admin/enquiries")
    assert res.status_code == 401


def test_editor_forbidden_from_enquiries(editor_client: TestClient):
    res = editor_client.get("/api/v1/admin/enquiries")
    assert res.status_code == 403


def test_admin_enquiry_lifecycle_and_filtering(
    super_admin_client: TestClient, client: TestClient
):
    # 1. Create enquiries via public endpoint
    res1 = client.post(
        "/api/v1/enquiries",
        json={
            "type": "general",
            "name": "Customer One",
            "phone": "+923001234567",
            "message": "Enquiring about cabinet hardware prices in Sargodha",
            "locale": "en",
        },
    )
    assert res1.status_code == 201
    enquiry_id = res1.json()["id"]

    res2 = client.post(
        "/api/v1/enquiries",
        json={
            "type": "general",
            "name": "Wholesale Buyer",
            "phone": "+923007654321",
            "message": "Bulk plywood order enquiry",
            "locale": "ur",
            "channel": "whatsapp",
        },
    )
    assert res2.status_code == 201
    enquiry_id_2 = res2.json()["id"]

    # 2. Super admin lists enquiries
    list_res = super_admin_client.get("/api/v1/admin/enquiries")
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert len(items) >= 2
    ids = [item["id"] for item in items]
    assert enquiry_id in ids
    assert enquiry_id_2 in ids

    # 3. Filter by channel
    channel_res = super_admin_client.get("/api/v1/admin/enquiries?channel=whatsapp")
    assert channel_res.status_code == 200
    whatsapp_items = channel_res.json()["items"]
    assert any(item["id"] == enquiry_id_2 for item in whatsapp_items)
    assert not any(item["id"] == enquiry_id for item in whatsapp_items)

    # 4. Update status
    patch_res = super_admin_client.patch(
        f"/api/v1/admin/enquiries/{enquiry_id}/status",
        json={"status": "in_progress"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "in_progress"

    # 5. Filter by status
    in_prog_res = super_admin_client.get("/api/v1/admin/enquiries?status=in_progress")
    assert in_prog_res.status_code == 200
    assert any(item["id"] == enquiry_id for item in in_prog_res.json()["items"])

    # 6. Delete enquiry
    del_res = super_admin_client.delete(f"/api/v1/admin/enquiries/{enquiry_id}")
    assert del_res.status_code == 200

    # 7. Verify deletion
    list_after = super_admin_client.get("/api/v1/admin/enquiries")
    ids_after = [item["id"] for item in list_after.json()["items"]]
    assert enquiry_id not in ids_after
