import requests
import json

url = "http://localhost:8000/api/register/"
payload = {
    "role": "student",
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "mobile": "1712345678",
    "department": "Computer Science & Technology",
    "gender": "male",
    "roll": "123456",
    "session": "2023-24",
    "semester": "1st Semester",
    "password": "Password123!"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
