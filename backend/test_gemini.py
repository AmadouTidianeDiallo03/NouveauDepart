
import requests
import json

key = 'AIzaSyCXeZkrmPkb1LeyuJUMdrEjM6HsWAoFQ_c'
models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro']
versions = ['v1', 'v1beta']

for v in versions:
    for m in models:
        url = f"https://generativelanguage.googleapis.com/{v}/models/{m}:generateContent"
        payload = {"contents": [{"parts": [{"text": "hi"}]}]}
        try:
            resp = requests.post(url, params={"key": key}, json=payload, timeout=5)
            if resp.status_code == 200:
                print(f"SUCCESS: {v} {m}")
        except:
            pass
