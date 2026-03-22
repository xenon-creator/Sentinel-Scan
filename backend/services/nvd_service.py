import httpx
from backend.config import settings

NVD_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"
TIMEOUT = 20


def _standardised_error(source: str, error: str) -> dict:
    return {"source": source, "success": False, "error": error}


_HTTP_ERRORS = {
    403: "Invalid or missing NVD API key (403 Forbidden)",
    429: "NVD rate limit exceeded — slow down requests",
    503: "NVD service temporarily unavailable (503)",
}


def _check_response(response, cve_id: str):
    if response.status_code in _HTTP_ERRORS:
        return _standardised_error("nvd", _HTTP_ERRORS[response.status_code])
    if response.status_code == 404:
        return _standardised_error("nvd", f"CVE not found: {cve_id}")
    if response.status_code != 200:
        return _standardised_error("nvd", f"Unexpected HTTP {response.status_code}")
    return None


def _extract_cvss(metrics: dict) -> tuple:
    for version_key in ("cvssMetricV31", "cvssMetricV30", "cvssMetricV2"):
        entries = metrics.get(version_key, [])
        if entries:
            cvss_data = entries[0].get("cvssData", {})
            return (
                cvss_data.get("baseScore"),
                cvss_data.get("vectorString"),
                cvss_data.get("baseSeverity") or entries[0].get("baseSeverity"),
            )
    return None, None, None


async def lookup_cve(cve_id: str) -> dict:
    params: dict = {"cveId": cve_id}
    headers: dict = {}

    if settings.NVD_API_KEY:
        headers["apiKey"] = settings.NVD_API_KEY

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(NVD_BASE_URL, headers=headers, params=params)

        err = _check_response(response, cve_id)
        if err:
            return err

        body = response.json()
        vulns = body.get("vulnerabilities", [])
        if not vulns:
            return _standardised_error("nvd", f"No data found for {cve_id}")

        cve = vulns[0].get("cve", {})
        descriptions = cve.get("descriptions", [])
        english_desc = next(
            (d["value"] for d in descriptions if d.get("lang") == "en"),
            "No description available",
        )

        metrics = cve.get("metrics", {})
        cvss_score, cvss_vector, severity = _extract_cvss(metrics)

        references = [r.get("url") for r in cve.get("references", []) if r.get("url")]

        return {
            "source": "nvd",
            "success": True,
            "cve_id": cve_id,
            "description": english_desc,
            "cvss_score": cvss_score,
            "cvss_vector": cvss_vector,
            "severity": severity,
            "published": cve.get("published"),
            "last_modified": cve.get("lastModified"),
            "references": references[:10],
            "raw": cve,
        }

    except httpx.TimeoutException:
        return _standardised_error("nvd", "Request timed out after 20 seconds")
    except Exception as exc:
        return _standardised_error("nvd", str(exc))


async def search_cves_by_keyword(keyword: str, limit: int = 5) -> dict:
    params = {"keywordSearch": keyword, "resultsPerPage": limit}
    headers = {}
    if settings.NVD_API_KEY:
        headers["apiKey"] = settings.NVD_API_KEY

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(NVD_BASE_URL, headers=headers, params=params)

        if response.status_code != 200:
            return _standardised_error("nvd", f"HTTP {response.status_code}")

        body = response.json()
        vulns = body.get("vulnerabilities", [])
        results = []
        for v in vulns:
            cve = v.get("cve", {})
            metrics = cve.get("metrics", {})
            score, vector, sev = _extract_cvss(metrics)
            desc = next(
                (d["value"] for d in cve.get("descriptions", []) if d.get("lang") == "en"),
                "",
            )
            results.append({
                "cve_id": cve.get("id"),
                "description": desc[:200],
                "cvss_score": score,
                "severity": sev,
                "published": cve.get("published"),
            })

        return {
            "source": "nvd",
            "success": True,
            "keyword": keyword,
            "total_results": body.get("totalResults", 0),
            "results": results,
        }

    except httpx.TimeoutException:
        return _standardised_error("nvd", "Request timed out after 20 seconds")
    except Exception as exc:
        return _standardised_error("nvd", str(exc))
