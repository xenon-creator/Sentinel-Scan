import httpx

OSV_API_URL = "https://api.osv.dev/v1/query"
OSV_VULN_URL = "https://api.osv.dev/v1/vulns/{vuln_id}"
TIMEOUT = 15


def _standardised_error(source: str, error: str) -> dict:
    return {"source": source, "success": False, "error": error}


async def query_osv(package: str, ecosystem: str = "PyPI", version: str = None) -> dict:
    payload: dict = {"package": {"name": package, "ecosystem": ecosystem}}
    if version:
        payload["version"] = version

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(OSV_API_URL, json=payload)

        if response.status_code == 400:
            return _standardised_error("osv", f"Bad request — check package name or ecosystem: {response.text}")
        if response.status_code != 200:
            return _standardised_error("osv", f"Unexpected HTTP {response.status_code}")

        body = response.json()
        vulns = body.get("vulns", [])

        summary_list = []
        for v in vulns[:10]:
            aliases = v.get("aliases", [])
            cve_aliases = [a for a in aliases if a.startswith("CVE-")]
            summary_list.append({
                "id": v.get("id"),
                "aliases": aliases,
                "cve": cve_aliases[0] if cve_aliases else None,
                "summary": v.get("summary", ""),
                "published": v.get("published"),
                "modified": v.get("modified"),
                "severity": v.get("severity", []),
            })

        return {
            "source": "osv",
            "success": True,
            "package": package,
            "ecosystem": ecosystem,
            "version": version,
            "vuln_count": len(vulns),
            "vulns": summary_list,
        }

    except httpx.TimeoutException:
        return _standardised_error("osv", "Request timed out after 15 seconds")
    except Exception as exc:
        return _standardised_error("osv", str(exc))


async def get_osv_vuln(vuln_id: str) -> dict:
    url = OSV_VULN_URL.format(vuln_id=vuln_id)
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url)

        if response.status_code == 404:
            return _standardised_error("osv", f"Vulnerability not found: {vuln_id}")
        if response.status_code != 200:
            return _standardised_error("osv", f"Unexpected HTTP {response.status_code}")

        body = response.json()
        return {
            "source": "osv",
            "success": True,
            "id": body.get("id"),
            "summary": body.get("summary"),
            "details": body.get("details"),
            "published": body.get("published"),
            "modified": body.get("modified"),
            "aliases": body.get("aliases", []),
            "affected": body.get("affected", []),
            "severity": body.get("severity", []),
            "references": [r.get("url") for r in body.get("references", [])],
            "raw": body,
        }

    except httpx.TimeoutException:
        return _standardised_error("osv", "Request timed out after 15 seconds")
    except Exception as exc:
        return _standardised_error("osv", str(exc))
