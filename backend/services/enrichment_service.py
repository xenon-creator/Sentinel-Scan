import asyncio
import re
from typing import Optional

from backend.services.abuseipdb_service import check_ip
from backend.services.virustotal_service import scan_ip, scan_domain
from backend.services.nvd_service import lookup_cve
from backend.services.osv_service import query_osv

_IP_RE = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")
_CVE_RE = re.compile(r"^CVE-\d{4}-\d+$", re.IGNORECASE)

PRIVATE_RANGES = [
    re.compile(r"^10\."),
    re.compile(r"^172\.(1[6-9]|2\d|3[01])\."),
    re.compile(r"^192\.168\."),
    re.compile(r"^127\."),
    re.compile(r"^::1$"),
]


def _is_private_ip(ip: str) -> bool:
    return any(p.match(ip) for p in PRIVATE_RANGES)


def _is_ip(asset: str) -> bool:
    return bool(_IP_RE.match(asset))


def _is_domain(asset: str) -> bool:
    return "." in asset and not _is_ip(asset)


async def enrich_finding(finding: dict) -> dict:
    asset: str = finding.get("affected_asset", "")
    cve_id: Optional[str] = finding.get("cve_id")
    title: str = finding.get("title", "")

    tasks = {}
    enrichment: dict = {"sources_queried": []}

    if _is_ip(asset) and not _is_private_ip(asset):
        tasks["abuseipdb"] = check_ip(asset)
        tasks["virustotal_ip"] = scan_ip(asset)
        enrichment["sources_queried"] += ["abuseipdb", "virustotal"]
    elif _is_domain(asset):
        tasks["virustotal_domain"] = scan_domain(asset)
        enrichment["sources_queried"] += ["virustotal"]

    if cve_id and _CVE_RE.match(cve_id):
        tasks["nvd"] = lookup_cve(cve_id)
        enrichment["sources_queried"].append("nvd")

    if not tasks:
        enrichment["note"] = "No public asset or CVE to enrich (private IP or no identifier found)"
        return enrichment

    results = await asyncio.gather(*tasks.values(), return_exceptions=True)
    resolved = {}
    for key, result in zip(tasks.keys(), results):
        if isinstance(result, Exception):
            resolved[key] = {"source": key, "success": False, "error": str(result)}
        else:
            resolved[key] = result

    if "abuseipdb" in resolved:
        enrichment["abuseipdb"] = resolved["abuseipdb"]

    vt_result = resolved.get("virustotal_ip") or resolved.get("virustotal_domain")
    if vt_result:
        enrichment["virustotal"] = vt_result

    if "nvd" in resolved:
        enrichment["nvd"] = resolved["nvd"]

    enrichment["asset"] = asset
    enrichment["cve_id"] = cve_id

    return enrichment


async def enrich_ip_direct(ip: str) -> dict:
    abuseipdb_result, vt_result = await asyncio.gather(
        check_ip(ip), scan_ip(ip)
    )
    return {
        "ip": ip,
        "sources_queried": ["abuseipdb", "virustotal"],
        "abuseipdb": abuseipdb_result,
        "virustotal": vt_result,
    }


async def enrich_cve_direct(cve_id: str) -> dict:
    nvd_result = await lookup_cve(cve_id)
    return {
        "cve_id": cve_id,
        "sources_queried": ["nvd"],
        "nvd": nvd_result,
    }
