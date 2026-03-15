import uuid
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class FindingStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"
    ACCEPTED_RISK = "accepted_risk"


class FindingResponse(BaseModel):
    finding_id: str
    scan_id: str
    title: str
    description: str
    severity: Severity
    cvss_score: Optional[float] = None
    cvss_vector: Optional[str] = None
    cve_id: Optional[str] = None
    cwe_id: Optional[str] = None
    affected_asset: str
    affected_component: Optional[str] = None
    port: Optional[int] = None
    protocol: Optional[str] = None
    exploit_available: bool = False
    epss_score: Optional[float] = None
    risk_score: Optional[float] = None
    remediation: Optional[str] = None
    references: List[str] = []
    status: FindingStatus = FindingStatus.OPEN
    discovered_at: datetime
    updated_at: Optional[datetime] = None


class FindingDocument(BaseModel):
    finding_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scan_id: str
    scanner_name: str
    title: str
    description: str
    severity: str
    cvss_score: Optional[float] = None
    cvss_vector: Optional[str] = None
    cve_id: Optional[str] = None
    cwe_id: Optional[str] = None
    affected_asset: str
    affected_component: Optional[str] = None
    port: Optional[int] = None
    protocol: Optional[str] = None
    service: Optional[str] = None
    exploit_available: bool = False
    epss_score: Optional[float] = None
    risk_score: Optional[float] = None
    remediation: Optional[str] = None
    references: List[str] = []
    raw_output: Optional[str] = None
    metadata: Dict = {}
    status: str = FindingStatus.OPEN.value
    discovered_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    notes: List[str] = []

    class Config:
        json_schema_extra = {
            "example": {
                "finding_id": "find-123",
                "scan_id": "scan-456",
                "title": "SQL Injection Vulnerability",
                "severity": "critical",
                "cvss_score": 9.8,
                "cve_id": "CVE-2024-1234",
                "affected_asset": "app.example.com",
                "status": "open",
            }
        }


class FindingUpdateRequest(BaseModel):
    status: Optional[FindingStatus] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
