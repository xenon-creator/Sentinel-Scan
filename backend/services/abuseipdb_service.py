import httpx
from backend.config import settings

ABUSEIPDB_URL = "https://api.abuseipdb.com/api/v2/check"
TIMEOUT = 10


def _standardised_error(source: str, error: str) -> dict:
    return {"source": source, "success": False, "error": error}


async def check_ip(ip: str) -> dict:
    if not settings.ABUSEIPDB_API_KEY:
        return _standardised_error("abuseipdb", "ABUSEIPDB_API_KEY not configured")

    headers = {
        "Key": settings.ABUSEIPDB_API_KEY,
        "Accept": "application/json",
    }
    params = {
        "ipAddress": ip,
        "maxAgeInDays": "90",
        "verbose": "",
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(ABUSEIPDB_URL, headers=headers, params=params)

        if response.status_code == 401:
            return _standardised_error("abuseipdb", "Invalid API key (401 Unauthorized)")
        if response.status_code == 422:
            return _standardised_error("abuseipdb", f"Invalid or non-public IP address: {ip}")
        if response.status_code == 429:
            return _standardised_error("abuseipdb", "Rate limit exceeded — try again later")
        if response.status_code != 200:
            return _standardised_error("abuseipdb", f"Unexpected HTTP {response.status_code}")

        data = response.json().get("data", {})
        return {
            "source": "abuseipdb",
            "success": True,
            "ip": data.get("ipAddress", ip),
            "abuse_confidence_score": data.get("abuseConfidenceScore", 0),
            "country_code": data.get("countryCode"),
            "isp": data.get("isp"),
            "domain": data.get("domain"),
            "is_tor": data.get("isTor", False),
            "total_reports": data.get("totalReports", 0),
            "last_reported_at": data.get("lastReportedAt"),
            "usage_type": data.get("usageType"),
            "raw": data,
        }

    except httpx.TimeoutException:
        return _standardised_error("abuseipdb", "Request timed out after 10 seconds")
    except Exception as exc:
        return _standardised_error("abuseipdb", str(exc))
