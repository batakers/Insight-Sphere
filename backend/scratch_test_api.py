import requests
import json

payload = {
    "branch_id": "3a25ed1a-7203-4581-9f28-410f918d579f",
    "date": "2026-04-16",
    "time": "14:30:00",
    "payment_method": "CASH",
    "items": [
        {
            "product_id": "123e4567-e89b-12d3-a456-426614174000",
            "quantity": 2,
            "unit_price_at_time": 25.50
        }
    ]
}

print("Menguji POST /transactions/ dengan payload default:")
response = requests.post("http://127.0.0.1:8000/transactions/", json=payload)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

print("\nMenguji GET /summary/today:")
response2 = requests.get("http://127.0.0.1:8000/transactions/summary/today")
print(f"Status Code: {response2.status_code}")
print(f"Response: {response2.text}")
