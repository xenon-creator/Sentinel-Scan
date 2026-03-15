from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.scan import ScanRequest, ScanResponse, ScanDocument, ScanStatus
from backend.db.mongodb import get_db
from backend.core.orchestrator import scan_orchestrator
from datetime import datetime
router = APIRouter(prefix='/scans', tags=['scans'])

@router.post('', response_model=ScanResponse, status_code=201)
async def create_scan(scan_request: ScanRequest, background_tasks: BackgroundTasks, db: AsyncIOMotorDatabase=Depends(get_db)):
    scan_doc = ScanDocument(target=scan_request.target, scan_types=[st.value for st in scan_request.scan_types], options=scan_request.options.model_dump() if scan_request.options else {}, webhook_url=scan_request.webhook_url, tags=scan_request.tags)
    await db.scans.insert_one(scan_doc.model_dump())
    background_tasks.add_task(scan_orchestrator.execute_scan, scan_id=scan_doc.scan_id, target=scan_doc.target, scan_types=scan_doc.scan_types, options=scan_doc.options)
    return ScanResponse(scan_id=scan_doc.scan_id, target=scan_doc.target, scan_types=scan_request.scan_types, status=ScanStatus.QUEUED, created_at=scan_doc.created_at, estimated_duration='5-15 minutes', tags=scan_doc.tags)

@router.get('/{scan_id}', response_model=ScanResponse)
async def get_scan(scan_id: str, db: AsyncIOMotorDatabase=Depends(get_db)):
    scan = await db.scans.find_one({'scan_id': scan_id})
    if not scan:
        raise HTTPException(status_code=404, detail='Scan not found')
    return ScanResponse(scan_id=scan['scan_id'], target=scan['target'], scan_types=[st for st in scan['scan_types']], status=ScanStatus(scan['status']), progress=scan.get('progress', 0), findings_count=scan.get('findings_count', 0), risk_score=scan.get('risk_score'), severity_breakdown=scan.get('severity_breakdown'), created_at=scan['created_at'], started_at=scan.get('started_at'), completed_at=scan.get('completed_at'), error_message=scan.get('error_message'), errors=scan.get('errors'), tags=scan.get('tags', []))

@router.get('', response_model=List[ScanResponse])
async def list_scans(status: Optional[str]=None, limit: int=50, offset: int=0, db: AsyncIOMotorDatabase=Depends(get_db)):
    query = {}
    if status:
        query['status'] = status
    cursor = db.scans.find(query).sort('created_at', -1).skip(offset).limit(limit)
    scans = await cursor.to_list(length=limit)
    return [ScanResponse(scan_id=scan['scan_id'], target=scan['target'], scan_types=[st for st in scan['scan_types']], status=ScanStatus(scan['status']), progress=scan.get('progress', 0), findings_count=scan.get('findings_count', 0), risk_score=scan.get('risk_score'), severity_breakdown=scan.get('severity_breakdown'), created_at=scan['created_at'], started_at=scan.get('started_at'), completed_at=scan.get('completed_at'), errors=scan.get('errors'), tags=scan.get('tags', [])) for scan in scans]

@router.delete('/{scan_id}')
async def delete_scan(scan_id: str, db: AsyncIOMotorDatabase=Depends(get_db)):
    scan = await db.scans.find_one({'scan_id': scan_id})
    if not scan:
        raise HTTPException(status_code=404, detail='Scan not found')
    await db.scans.delete_one({'scan_id': scan_id})
    await db.findings.delete_many({'scan_id': scan_id})
    return {'message': 'Scan deleted successfully', 'scan_id': scan_id}