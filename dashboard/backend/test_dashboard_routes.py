"""
Tests for the dashboard backend API routes.
Run from the project root:
  backend\\venv\\Scripts\\python -m pytest dashboard/backend/test_dashboard_routes.py -v
"""
from unittest.mock import AsyncMock, MagicMock
import pytest
from fastapi.testclient import TestClient

# Patch MongoDB connect so the server startup doesn't try to reach a real DB
from unittest.mock import patch, AsyncMock as AM

with patch("dashboard.backend.database.MongoDB.connect", new_callable=AM), \
     patch("dashboard.backend.database.MongoDB.disconnect", new_callable=AM):
    from dashboard.backend.main import app
    from dashboard.backend.database import get_db


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_collection(count=0, agg_data=None, find_one_data=None):
    col = AsyncMock()
    col.count_documents = AsyncMock(return_value=count)
    cursor = AsyncMock()
    cursor.to_list = AsyncMock(return_value=agg_data or [])
    col.aggregate = MagicMock(return_value=cursor)
    col.find_one = AsyncMock(return_value=find_one_data)
    return col


def _make_db(findings_count=0, scans_count=0, agg_data=None, find_one=None):
    db = MagicMock()
    db.findings = _make_collection(count=findings_count, agg_data=agg_data, find_one_data=find_one)
    db.scans = _make_collection(count=scans_count)
    return db


def override_db(db):
    """Return an async generator to swap out the get_db dependency."""
    async def _dep():
        return db
    app.dependency_overrides[get_db] = _dep


def clear_overrides():
    app.dependency_overrides = {}


client = TestClient(app, raise_server_exceptions=True)


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"


# ---------------------------------------------------------------------------
# /api/v1/dashboard/stats
# ---------------------------------------------------------------------------

def test_get_stats():
    override_db(_make_db(findings_count=100, scans_count=25))
    try:
        response = client.get("/api/v1/dashboard/stats")
        assert response.status_code == 200, response.text
        data = response.json()
        assert set(data.keys()) >= {"total_scans", "total_indicators", "malicious", "suspicious", "safe"}
        assert data["total_scans"] == 25
    finally:
        clear_overrides()


# ---------------------------------------------------------------------------
# /api/v1/dashboard/threat-distribution
# ---------------------------------------------------------------------------

def test_threat_distribution():
    override_db(_make_db(findings_count=10))
    try:
        response = client.get("/api/v1/dashboard/threat-distribution")
        assert response.status_code == 200, response.text
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        names = {item["name"] for item in data}
        assert names == {"Malicious", "Suspicious", "Safe"}
    finally:
        clear_overrides()


# ---------------------------------------------------------------------------
# /api/v1/dashboard/api-status
# ---------------------------------------------------------------------------

def test_api_status():
    response = client.get("/api/v1/dashboard/api-status")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    ids = {item["id"] for item in data}
    assert {"abuseipdb", "virustotal", "nvd", "osv"} <= ids


# ---------------------------------------------------------------------------
# /api/v1/dashboard/recent-scans — empty
# ---------------------------------------------------------------------------

def test_recent_scans_empty():
    override_db(_make_db(agg_data=[]))
    try:
        response = client.get("/api/v1/dashboard/recent-scans")
        assert response.status_code == 200, response.text
        assert response.json() == []
    finally:
        clear_overrides()


# ---------------------------------------------------------------------------
# /api/v1/dashboard/recent-scans — with data
# ---------------------------------------------------------------------------

def test_recent_scans_with_data():
    fake_finding = {
        "finding_id": "fnd_12345678",
        "scan_id": "scn_87654321",
        "severity": "critical",
        "risk_score": 9.5,
        "affected_asset": "185.15.24.1",
        "title": "Malicious IP Detected",
        "discovered_at": "2026-03-01T10:00:00",
    }
    override_db(_make_db(agg_data=[fake_finding]))
    try:
        response = client.get("/api/v1/dashboard/recent-scans?limit=5")
        assert response.status_code == 200, response.text
        rows = response.json()
        assert len(rows) == 1
        assert rows[0]["classification"] == "Malicious"
        assert rows[0]["id"] == "fnd_12345678"
        assert rows[0]["type"] == "ip"
    finally:
        clear_overrides()


# ---------------------------------------------------------------------------
# /api/v1/dashboard/indicator/{id} — 404
# ---------------------------------------------------------------------------

def test_indicator_not_found():
    override_db(_make_db(find_one=None))
    try:
        response = client.get("/api/v1/dashboard/indicator/nonexistent-id")
        assert response.status_code == 404
    finally:
        clear_overrides()


# ---------------------------------------------------------------------------
# /api/v1/dashboard/top-threats — empty
# ---------------------------------------------------------------------------

def test_top_threats_empty():
    override_db(_make_db(agg_data=[]))
    try:
        response = client.get("/api/v1/dashboard/top-threats")
        assert response.status_code == 200, response.text
        assert response.json() == []
    finally:
        clear_overrides()
