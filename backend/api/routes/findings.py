from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.finding import FindingResponse, FindingUpdateRequest, FindingStatus, Severity
from backend.db.mongodb import get_db
from datetime import datetime
router = APIRouter(prefix='/findings', tags=['findings'])

@router.get('', response_model=List[FindingResponse])
async def list_findings(scan_id: Optional[str]=None, severity: Optional[Severity]=None, status: Optional[FindingStatus]=None, limit: int=Query(50, le=500), offset: int=0, db: AsyncIOMotorDatabase=Depends(get_db)):
    query = {}
    if scan_id:
        query['scan_id'] = scan_id
    if severity:
        query['severity'] = severity.value
    if status:
        query['status'] = status.value
    cursor = db.findings.find(query).sort('discovered_at', -1).skip(offset).limit(limit)
    findings = await cursor.to_list(length=limit)
    return [FindingResponse(finding_id=f['finding_id'], scan_id=f['scan_id'], title=f['title'], description=f['description'], severity=Severity(f['severity']), cvss_score=f.get('cvss_score'), cvss_vector=f.get('cvss_vector'), cve_id=f.get('cve_id'), cwe_id=f.get('cwe_id'), affected_asset=f['affected_asset'], affected_component=f.get('affected_component'), port=f.get('port'), protocol=f.get('protocol'), exploit_available=f.get('exploit_available', False), epss_score=f.get('epss_score'), risk_score=f.get('risk_score'), remediation=f.get('remediation'), references=f.get('references', []), status=FindingStatus(f.get('status', 'open')), discovered_at=f['discovered_at'], updated_at=f.get('updated_at')) for f in findings]

@router.get('/{finding_id}', response_model=FindingResponse)
async def get_finding(finding_id: str, db: AsyncIOMotorDatabase=Depends(get_db)):
    finding = await db.findings.find_one({'finding_id': finding_id})
    if not finding:
        raise HTTPException(status_code=404, detail='Finding not found')
    return FindingResponse(finding_id=finding['finding_id'], scan_id=finding['scan_id'], title=finding['title'], description=finding['description'], severity=Severity(finding['severity']), cvss_score=finding.get('cvss_score'), cvss_vector=finding.get('cvss_vector'), cve_id=finding.get('cve_id'), cwe_id=finding.get('cwe_id'), affected_asset=finding['affected_asset'], affected_component=finding.get('affected_component'), port=finding.get('port'), protocol=finding.get('protocol'), exploit_available=finding.get('exploit_available', False), epss_score=finding.get('epss_score'), risk_score=finding.get('risk_score'), remediation=finding.get('remediation'), references=finding.get('references', []), status=FindingStatus(finding.get('status', 'open')), discovered_at=finding['discovered_at'], updated_at=finding.get('updated_at'))

@router.patch('/{finding_id}', response_model=FindingResponse)
async def update_finding(finding_id: str, update_request: FindingUpdateRequest, db: AsyncIOMotorDatabase=Depends(get_db)):
    finding = await db.findings.find_one({'finding_id': finding_id})
    if not finding:
        raise HTTPException(status_code=404, detail='Finding not found')
    update_doc = {'updated_at': datetime.utcnow()}
    if update_request.status:
        update_doc['status'] = update_request.status.value
    if update_request.assigned_to:
        update_doc['assigned_to'] = update_request.assigned_to
    if update_request.notes:
        await db.findings.update_one({'finding_id': finding_id}, {'$push': {'notes': update_request.notes}})
    await db.findings.update_one({'finding_id': finding_id}, {'$set': update_doc})
    updated_finding = await db.findings.find_one({'finding_id': finding_id})
    return FindingResponse(finding_id=updated_finding['finding_id'], scan_id=updated_finding['scan_id'], title=updated_finding['title'], description=updated_finding['description'], severity=Severity(updated_finding['severity']), cvss_score=updated_finding.get('cvss_score'), cve_id=updated_finding.get('cve_id'), affected_asset=updated_finding['affected_asset'], status=FindingStatus(updated_finding.get('status', 'open')), discovered_at=updated_finding['discovered_at'], updated_at=updated_finding.get('updated_at'))