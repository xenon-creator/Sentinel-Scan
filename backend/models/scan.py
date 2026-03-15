import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ScanStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    ENRICHING = "enriching"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScanType(str, Enum):
    NETWORK = "network"
    VULNERABILITY = "vulnerability"
    WEB = "web"
    CONTAINER = "container"
    SECRETS = "secrets"
    IAC = "iac"
    CLOUD = "cloud"


class ScanOptions(BaseModel):
    port_range: Optional[str] = "1-1000"
    scan_speed: Optional[str] = "normal"
    authenticated: Optional[bool] = False
    credentials: Optional[dict] = None
    custom_args: Optional[dict] = None


class ScanRequest(BaseModel):
    target: str = Field(..., description="Target IP, domain, or CIDR range")
    scan_types: List[ScanType] = Field(..., description="Types of scans to perform")
    options: Optional[ScanOptions] = Field(default_factory=ScanOptions)
    webhook_url: Optional[str] = None
    tags: Optional[List[str]] = []


class SeverityBreakdown(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    info: int = 0


class ScanResponse(BaseModel):
    scan_id: str
    target: str
    scan_types: List[ScanType]
    status: ScanStatus
    progress: int = 0
    findings_count: int = 0
    risk_score: Optional[float] = None
    severity_breakdown: Optional[SeverityBreakdown] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_duration: Optional[str] = None
    error_message: Optional[str] = None
    errors: Optional[List[dict]] = None
    tags: List[str] = []


class ScanDocument(BaseModel):
    scan_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    target: str
    scan_types: List[str]
    options: dict = {}
    status: str = ScanStatus.QUEUED.value
    progress: int = 0
    findings_count: int = 0
    risk_score: Optional[float] = None
    severity_breakdown: dict = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0,
    }
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    errors: Optional[List[dict]] = None
    webhook_url: Optional[str] = None
    tags: List[str] = []

    class Config:
        json_schema_extra = {
            "example": {
                "scan_id": "550e8400-e29b-41d4-a716-446655440000",
                "target": "scanme.nmap.org",
                "scan_types": ["network", "vulnerability"],
                "status": "completed",
                "findings_count": 42,
                "risk_score": 7.5,
            }
        }
