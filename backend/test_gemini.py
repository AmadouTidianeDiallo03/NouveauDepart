import os

import requests
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GEMINI_API_KEY", "")
models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
versions = ["v1", "v1beta"]

if not key:
    raise SystemExit("GEMINI_API_KEY is missing in .env")

for version in versions:
    for model in models:
        url = f"https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent"
        payload = {"contents": [{"parts": [{"text": "hi"}]}]}
        try:
            resp = requests.post(url, headers={"x-goog-api-key": key}, json=payload, timeout=8)
            if resp.status_code == 200:
                print(f"SUCCESS: {version} {model}")
            else:
                print(f"FAILED: {version} {model} ({resp.status_code})")
        except requests.RequestException as exc:
            print(f"ERROR: {version} {model} ({exc})")
