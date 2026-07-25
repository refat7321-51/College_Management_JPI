import urllib.request
import json

url = "http://localhost:8000/api/register/"
payload = {
    "role": "student",
    "first_name": "Test",
    "last_name": "User",
    "email": "test_unique_python@example.com",
    "mobile": "1712345678",
    "department": "Computer Science",
    "gender": "male",
    "roll": "123456",
    "session": "2023-24",
    "semester": "1st Semester",
    "password": "Password123!"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data)
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as f:
        print(f"Status: {f.getcode()}")
        print(f"Body: {f.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
