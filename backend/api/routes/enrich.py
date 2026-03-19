from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.db.mongodb import get_db
from backend.services.enrichment_service import enrich_finding, enrich_ip_direct, enrich_cve_direct

router = APIRouter(prefix="/enrich", tags=["enrichment"])


@router.get("/ip/{ip}")
async def enrich_ip(ip: str):
    return await enrich_ip_direct(ip)


@router.get("/cve/{cve_id}")
async def enrich_cve(cve_id: str):
    return await enrich_cve_direct(cve_id)


@router.get("/{finding_id}")
async def enrich_finding_by_id(
    finding_id: str,
    refresh: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    finding = await db.findings.find_one({"finding_id": finding_id})
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    cached = finding.get("enrichment")
    if cached and not refresh:
        return cached

    enrichment = await enrich_finding(finding)
    enrichment["enriched_at"] = datetime.utcnow().isoformat()

    await db.findings.update_one(
        {"finding_id": finding_id},
        {"$set": {"enrichment": enrichment}},
    )

    return enrichment


@router.get("/{finding_id}/status")
async def get_enrichment_status(
    finding_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    finding = await db.findings.find_one(
        {"finding_id": finding_id},
        {"enrichment": 1, "finding_id": 1},
    )
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    enriched = bool(finding.get("enrichment"))
    return {
        "finding_id": finding_id,
        "enriched": enriched,
        "enriched_at": finding.get("enrichment", {}).get("enriched_at") if enriched else None,
    }
