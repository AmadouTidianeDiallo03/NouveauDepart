import os

import requests
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GEMINI_API_KEY", "")
url = "https://generativelanguage.googleapis.com/v1beta/models"

if not key:
    raise SystemExit("GEMINI_API_KEY is missing in .env")

try:
    resp = requests.get(url, headers={"x-goog-api-key": key}, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    with open("models_list.txt", "w", encoding="utf-8") as f:
        for model in data.get("models", []):
            name = model.get("name")
            methods = model.get("supportedGenerationMethods", [])
            f.write(f"{name}: {methods}\n")
    print("Wrote results to models_list.txt")
except requests.RequestException as exc:
    print(f"Error: {exc}")
