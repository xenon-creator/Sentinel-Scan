import httpx
from backend.config import settings

VT_BASE_URL = "https://www.virustotal.com/api/v3"
TIMEOUT = 15


def _standardised_error(source: str, error: str) -> dict:
    return {"source": source, "success": False, "error": error}


async def scan_ip(ip: str) -> dict:
    if not settings.VIRUSTOTAL_API_KEY:
        return _standardised_error("virustotal", "VIRUSTOTAL_API_KEY not configured")

    headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
    url = f"{VT_BASE_URL}/ip_addresses/{ip}"

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url, headers=headers)

        if response.status_code == 401:
            return _standardised_error("virustotal", "Invalid API key (401 Unauthorized)")
        if response.status_code == 404:
            return _standardised_error("virustotal", f"IP not found in VirusTotal database: {ip}")
        if response.status_code == 429:
            return _standardised_error("virustotal", "Rate limit exceeded — try again later")
        if response.status_code != 200:
            return _standardised_error("virustotal", f"Unexpected HTTP {response.status_code}")

        attrs = response.json().get("data", {}).get("attributes", {})
        last_analysis = attrs.get("last_analysis_stats", {})

        return {
            "source": "virustotal",
            "success": True,
            "ip": ip,
            "malicious_votes": last_analysis.get("malicious", 0),
            "suspicious_votes": last_analysis.get("suspicious", 0),
            "harmless_votes": last_analysis.get("harmless", 0),
            "undetected_votes": last_analysis.get("undetected", 0),
            "reputation": attrs.get("reputation", 0),
            "country": attrs.get("country"),
            "asn": attrs.get("asn"),
            "as_owner": attrs.get("as_owner"),
            "last_analysis_date": attrs.get("last_analysis_date"),
            "network": attrs.get("network"),
            "raw": attrs,
        }

    except httpx.TimeoutException:
        return _standardised_error("virustotal", "Request timed out after 15 seconds")
    except Exception as exc:
        return _standardised_error("virustotal", str(exc))


async def scan_domain(domain: str) -> dict:
    if not settings.VIRUSTOTAL_API_KEY:
        return _standardised_error("virustotal", "VIRUSTOTAL_API_KEY not configured")

    headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
    url = f"{VT_BASE_URL}/domains/{domain}"

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url, headers=headers)

        if response.status_code == 401:
            return _standardised_error("virustotal", "Invalid API key (401 Unauthorized)")
        if response.status_code == 404:
            return _standardised_error("virustotal", f"Domain not found: {domain}")
        if response.status_code == 429:
            return _standardised_error("virustotal", "Rate limit exceeded — try again later")
        if response.status_code != 200:
            return _standardised_error("virustotal", f"Unexpected HTTP {response.status_code}")

        attrs = response.json().get("data", {}).get("attributes", {})
        last_analysis = attrs.get("last_analysis_stats", {})

        return {
            "source": "virustotal",
            "success": True,
            "domain": domain,
            "malicious_votes": last_analysis.get("malicious", 0),
            "suspicious_votes": last_analysis.get("suspicious", 0),
            "harmless_votes": last_analysis.get("harmless", 0),
            "reputation": attrs.get("reputation", 0),
            "registrar": attrs.get("registrar"),
            "creation_date": attrs.get("creation_date"),
            "raw": attrs,
        }

    except httpx.TimeoutException:
        return _standardised_error("virustotal", "Request timed out after 15 seconds")
    except Exception as exc:
        return _standardised_error("virustotal", str(exc))
