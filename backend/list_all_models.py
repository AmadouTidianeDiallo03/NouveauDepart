
import requests
import json

key = 'AIzaSyCXeZkrmPkb1LeyuJUMdrEjM6HsWAoFQ_c'
url = "https://generativelanguage.googleapis.com/v1beta/models"

try:
    resp = requests.get(url, params={"key": key}, timeout=10)
    data = resp.json()
    with open("models_list.txt", "w", encoding="utf-8") as f:
        for m in data.get('models', []):
            name = m.get('name')
            methods = m.get('supportedGenerationMethods', [])
            f.write(f"{name}: {methods}\n")
    print("Wrote results to models_list.txt")
except Exception as e:
    print(f"Error: {str(e)}")
