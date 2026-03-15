from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ScanResult:
    scanner_name: str
    target: str
    status: str
    findings: List[Dict[str, Any]]
    raw_output: Optional[str] = None
    error_message: Optional[str] = None
    scan_duration: Optional[float] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class ScannerPlugin(ABC):
    name: str = 'base_scanner'
    version: str = '0.1.0'
    description: str = 'Base scanner plugin'
    supported_targets: List[str] = []

    def __init__(self, config: Optional[Dict]=None):
        self.config = config or {}
        self.initialized = False

    @abstractmethod
    async def initialize(self) -> bool:
        pass

    @abstractmethod
    async def scan(self, target: str, options: Optional[Dict]=None) -> ScanResult:
        pass

    @abstractmethod
    def parse_output(self, raw_output: str) -> List[Dict[str, Any]]:
        pass

    def validate_target(self, target: str) -> bool:
        if not target or not target.strip():
            return False
        return True

    async def cleanup(self):
        pass

    def get_info(self) -> Dict[str, Any]:
        return {'name': self.name, 'version': self.version, 'description': self.description, 'supported_targets': self.supported_targets, 'initialized': self.initialized}