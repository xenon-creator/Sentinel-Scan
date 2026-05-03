"""
ZAP API Routes — Dedicated endpoints for OWASP ZAP web scanning.

Provides scan initiation, status polling, and report download endpoints.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field

from backend.core.plugin_manager import plugin_manager
from backend.db.mongodb import get_db
from backend.models.scan import ScanDocument, ScanStatus
from backend.core.orchestrator import scan_orchestrator
from backend.services.report_generator import ReportGenerator

router = APIRouter(prefix="/zap", tags=["zap"])


# ── Request / Response Models ──────────────────────────────────────────

class ZapScanRequest(BaseModel):
    """Request body for starting a ZAP scan."""
    target: str = Field(..., description="Target URL to scan (http:// or https://)")
    intensity: str = Field(
        default="full",
        description="Scan intensity: 'quick' (spider+passive) or 'full' (spider+passive+active)",
    )
    spider_timeout: Optional[int] = Field(
        default=None, description="Spider timeout in seconds"
    )
    active_scan_timeout: Optional[int] = Field(
        default=None, description="Active scan timeout in seconds"
    )


class ZapScanResponse(BaseModel):
    """Response for a ZAP scan creation."""
    scan_id: str
    target: str
    intensity: str
    status: str
    message: str


class ZapStatusResponse(BaseModel):
    """Response for ZAP daemon status check."""
    connected: bool
    version: Optional[str] = None
    proxy_url: str
    message: str


# ── Endpoints ──────────────────────────────────────────────────────────

@router.get("/status", response_model=ZapStatusResponse)
async def check_zap_status():
    """Check if the ZAP daemon is reachable."""
    zap_plugin = plugin_manager.get_plugin("zap")
    if not zap_plugin:
        return ZapStatusResponse(
            connected=False, proxy_url="N/A",
            message="ZAP plugin is not registered",
        )

    if not zap_plugin.initialized:
        success = await zap_plugin.initialize()
        if not success:
            return ZapStatusResponse(
                connected=False,
                proxy_url=f"http://{zap_plugin.proxy_host}:{zap_plugin.proxy_port}",
                message="ZAP daemon is not reachable. Ensure ZAP is running.",
            )

    try:
        import asyncio
        version = await asyncio.to_thread(zap_plugin.client.get_version)
        return ZapStatusResponse(
            connected=True, version=version,
            proxy_url=zap_plugin.client.proxy_url,
            message="ZAP daemon is connected and ready",
        )
    except Exception as e:
        return ZapStatusResponse(
            connected=False,
            proxy_url=f"http://{zap_plugin.proxy_host}:{zap_plugin.proxy_port}",
            message=f"ZAP connection error: {e}",
        )


@router.post("/scan", response_model=ZapScanResponse, status_code=201)
async def start_zap_scan(
    request: ZapScanRequest,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Start a new ZAP web vulnerability scan."""
    # Validate target scheme
    if not request.target.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=400,
            detail="Target must start with http:// or https://",
        )

    # Create scan document
    scan_doc = ScanDocument(
        target=request.target,
        scan_types=["web"],
        options={
            "scan_intensity": request.intensity,
            "spider_timeout": request.spider_timeout,
            "active_scan_timeout": request.active_scan_timeout,
        },
    )
    await db.scans.insert_one(scan_doc.model_dump())

    # Run scan in background
    background_tasks.add_task(
        scan_orchestrator.execute_scan,
        scan_id=scan_doc.scan_id,
        target=scan_doc.target,
        scan_types=["web"],
        options=scan_doc.options,
    )

    return ZapScanResponse(
        scan_id=scan_doc.scan_id,
        target=request.target,
        intensity=request.intensity,
        status="queued",
        message=f"ZAP {request.intensity} scan queued for {request.target}",
    )


@router.get("/scan/{scan_id}/status")
async def get_zap_scan_status(
    scan_id: str, db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get the status of a ZAP scan."""
    scan = await db.scans.find_one({"scan_id": scan_id})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "scan_id": scan_id,
        "target": scan["target"],
        "status": scan["status"],
        "progress": scan.get("progress", 0),
        "findings_count": scan.get("findings_count", 0),
        "severity_breakdown": scan.get("severity_breakdown"),
        "started_at": scan.get("started_at"),
        "completed_at": scan.get("completed_at"),
        "errors": scan.get("errors"),
    }


@router.get("/scan/{scan_id}/report")
async def get_zap_report_json(
    scan_id: str, db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Generate and return the JSON report for a completed ZAP scan."""
    scan = await db.scans.find_one({"scan_id": scan_id})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if scan["status"] != ScanStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail=f"Scan is not completed (current status: {scan['status']})",
        )

    # Fetch findings from DB
    findings_cursor = db.findings.find({"scan_id": scan_id})
    findings = await findings_cursor.to_list(length=10000)

    # Strip MongoDB _id field
    for f in findings:
        f.pop("_id", None)

    generator = ReportGenerator(output_dir="./reports")
    duration = None
    if scan.get("started_at") and scan.get("completed_at"):
        duration = (scan["completed_at"] - scan["started_at"]).total_seconds()

    report_path = generator.generate_json_report(
        scan_id=scan_id, target=scan["target"], scan_type="zap",
        findings=findings, scan_duration=duration,
    )
    return FileResponse(
        report_path, media_type="application/json",
        filename=f"zap_report_{scan_id}.json",
    )


@router.get("/scan/{scan_id}/report/html")
async def get_zap_report_html(
    scan_id: str, db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Generate and return the HTML report for a completed ZAP scan."""
    scan = await db.scans.find_one({"scan_id": scan_id})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if scan["status"] != ScanStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail=f"Scan is not completed (current status: {scan['status']})",
        )

    findings_cursor = db.findings.find({"scan_id": scan_id})
    findings = await findings_cursor.to_list(length=10000)
    for f in findings:
        f.pop("_id", None)

    generator = ReportGenerator(output_dir="./reports")
    duration = None
    if scan.get("started_at") and scan.get("completed_at"):
        duration = (scan["completed_at"] - scan["started_at"]).total_seconds()

    report_path = generator.generate_html_report(
        scan_id=scan_id, target=scan["target"], scan_type="zap",
        findings=findings, scan_duration=duration,
    )
    return FileResponse(
        report_path, media_type="text/html",
        filename=f"zap_report_{scan_id}.html",
    )
