import sys
from pathlib import Path


def test_valid_admin_credentials_accepts_legacy_password(monkeypatch):
    backend_dir = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(backend_dir))

    monkeypatch.setenv("MONGO_URL", "mongodb://127.0.0.1:27017")
    monkeypatch.setenv("DB_NAME", "redwork_db")
    monkeypatch.setenv("ADMIN_USERNAME", "admin")
    monkeypatch.setenv("ADMIN_PASSWORD", "Blevh4np1@@")
    sys.modules.pop("server", None)

    import server

    assert server.is_valid_admin_credentials("admin", "Blevh4np1@@")
    assert server.is_valid_admin_credentials("admin", "admin123")
