import os
from pathlib import Path


GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
ENVIRONMENT = os.environ.get("ENVIRONMENT", os.environ.get("RAILWAY_ENVIRONMENT", "unknown"))


def gemini_is_configured():
    return bool(GEMINI_API_KEY)


def knowledge_directory():
    return Path(__file__).resolve().parent / "knowledge"


def knowledge_diagnostics():
    path = knowledge_directory()
    exists = path.exists()
    files = []
    if exists:
        files = sorted(item.name for item in path.iterdir() if item.is_file())
    return {
        "path": str(path),
        "exists": exists,
        "files": files,
    }


def print_startup_diagnostics():
    diagnostics = knowledge_diagnostics()
    print("GEMINI_API_KEY EXISTS:", gemini_is_configured())
    print("GEMINI_MODEL:", GEMINI_MODEL)
    print("ENV:", ENVIRONMENT)
    print("Knowledge path exists:", diagnostics["exists"])
    print("Knowledge files:", diagnostics["files"] if diagnostics["exists"] else "missing")
