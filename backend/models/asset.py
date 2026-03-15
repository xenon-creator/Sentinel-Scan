from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class AssetType(str, Enum):
    SERVER = 'server'
    WORKSTATION = 'workstation'
    NETWORK_DEVICE = 'network_device'
    WEB_APPLICATION = 'web_application'
    CONTAINER = 'container'
    CLOUD_RESOURCE = 'cloud_resource'
    OTHER = 'other'

class AssetCriticality(str, Enum):
    CRITICAL = 'critical'
    HIGH = 'high'
    MEDIUM = 'medium'
    LOW = 'low'

class AssetRequest(BaseModel):
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    asset_type: AssetType
    criticality: AssetCriticality = AssetCriticality.MEDIUM
    tags: List[str] = []
    metadata: dict = {}

class AssetResponse(BaseModel):
    asset_id: str
    hostname: Optional[str]
    ip_address: Optional[str]
    asset_type: AssetType
    criticality: AssetCriticality
    tags: List[str]
    vulnerability_count: int = 0
    last_scanned: Optional[datetime] = None
    risk_score: Optional[float] = None
    created_at: datetime

class AssetDocument(BaseModel):
    asset_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    asset_type: str
    criticality: str
    tags: List[str] = []
    metadata: dict = {}
    vulnerability_count: int = 0
    last_scanned: Optional[datetime] = None
    risk_score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {'example': {'asset_id': 'asset-789', 'hostname': 'web-server-01', 'ip_address': '192.168.1.10', 'asset_type': 'server', 'criticality': 'high', 'tags': ['production', 'web']}}