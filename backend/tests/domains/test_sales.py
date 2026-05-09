import pytest

def test_fetch_transactions_public(client):
    response = client.get("/transactions/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_transaction_and_summary(admin_client):
    # Create a product
    prod_res = admin_client.post("/inventory/products", json={
        "sku": "TXN-SKU-2", "name": "Transact Item 2", "family": "G", "category": "C",
        "base_price": 50000.0, "cost_price": 40000.0
    })
    assert prod_res.status_code == 201
    product_id = prod_res.json()["id"]

    # Get a valid branch_id
    stores_res = admin_client.get("/stores/")
    assert stores_res.status_code == 200
    branch_id = stores_res.json()[0]["id"]

    payload = {
        "branch_id": branch_id,
        "date": "2026-04-19",
        "time": "14:30:00",
        "payment_method": "CASH",
        "items": [
            {
                "product_id": product_id,
                "quantity": 2,
                "unit_price_at_time": 50000.0
            }
        ]
    }
    
    response = admin_client.post("/transactions/", json=payload)
    assert response.status_code in [200, 201], response.text
    
    # Test summary endpoint
    summary_res = admin_client.get("/transactions/summary/today")
    assert summary_res.status_code == 200
    data = summary_res.json()
    assert "total_revenue" in data

def test_sync_offline_transactions(admin_client):
    # Get valid product and branch
    import uuid
    prod_res = admin_client.post("/inventory/products", json={
        "sku": "OFF-TXN-SKU-2", "name": "Offline Item 2", "family": "G", "category": "C",
        "base_price": 10000, "cost_price": 5000
    })
    assert prod_res.status_code == 201
    product_id = prod_res.json()["id"]
    stores_res = admin_client.get("/stores/")
    assert stores_res.status_code == 200
    branch_id = stores_res.json()[0]["id"]
    client_txn_id = uuid.uuid4()
    payload = {
        "transactions": [
            {
                "branch_id": branch_id,
                "date": "2026-04-19",
                "time": "15:00:00",
                "payment_method": "QRIS",
                "client_txn_id": str(client_txn_id),
                "items": [
                    {
                        "product_id": product_id,
                        "quantity": 2,
                        "unit_price_at_time": 10000.0
                    }
                ]
            }
        ]
    }
    response = admin_client.post("/transactions/batch", json=payload)
    assert response.status_code == 207, response.text # 207 Multi-Status is expected
    data = response.json()
    assert data["synced"] >= 0
    assert data["failed"] >= 0

def test_create_transaction_validation_errors(admin_client):
    payload = {
        "branch_id": "invalid-uuid",
        "date": "invalid-date",
        "time": "99:99:99",
        "payment_method": "",
        "items": []
    }
    response = admin_client.post("/transactions/", json=payload)
    assert response.status_code == 422
