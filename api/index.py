import sys
import os

# Add the project root to the path so we can import from backend/
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app as backend_app


async def app(scope, receive, send):
    # vercel.json rewrites /api/* to this function but keeps the original path, while the
    # FastAPI routes are /predict, /players/... — strip the /api prefix so both forms resolve.
    if scope["type"] in ("http", "websocket"):
        path = scope.get("path", "")
        if path == "/api" or path.startswith("/api/"):
            scope = dict(scope, path=path[4:] or "/", raw_path=(path[4:] or "/").encode())
    await backend_app(scope, receive, send)
