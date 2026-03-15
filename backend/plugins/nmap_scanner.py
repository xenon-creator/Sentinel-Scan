import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional

import nmap

from backend.plugins.base import ScannerPlugin, ScanResult


class NmapScanner(ScannerPlugin):
    name = "nmap"
    version = "1.0.0"
    description = "Network port scanner and service detector using Nmap"
    supported_targets = ["ip", "domain", "cidr"]

    def __init__(self, config: Optional[Dict] = None):
        super().__init__(config)
        self.nm = None

    async def initialize(self) -> bool:
        try:
            self.nm = nmap.PortScanner()
            self.initialized = True
            return True
        except Exception as e:
            print(f"❌ Failed to initialize Nmap: {e}")
            return False

    async def scan(self, target: str, options: Optional[Dict] = None) -> ScanResult:
        if not self.initialized:
            await self.initialize()
        options = options or {}
        port_range = options.get("port_range", "1-1000")
        scan_speed = options.get("scan_speed", "normal")
        timing_map = {"fast": "-T4", "normal": "-T3", "thorough": "-T2"}
        timing = timing_map.get(scan_speed, "-T3")
        nmap_args = f"{timing} -sV"
        start_time = datetime.utcnow()
        try:
            await asyncio.to_thread(
                self.nm.scan, hosts=target, ports=port_range, arguments=nmap_args
            )
            findings = self.parse_output(self.nm)
            scan_duration = (datetime.utcnow() - start_time).total_seconds()
            return ScanResult(
                scanner_name=self.name,
                target=target,
                status="success",
                findings=findings,
                raw_output=str(self.nm.csv()),
                scan_duration=scan_duration,
                metadata={
                    "nmap_version": self.nm.nmap_version(),
                    "command_line": self.nm.command_line(),
                    "hosts_scanned": len(self.nm.all_hosts()),
                },
            )
        except Exception as e:
            scan_duration = (datetime.utcnow() - start_time).total_seconds()
            return ScanResult(
                scanner_name=self.name,
                target=target,
                status="failed",
                findings=[],
                error_message=str(e),
                scan_duration=scan_duration,
            )

    def parse_output(self, nm_result) -> List[Dict[str, Any]]:
        findings = []
        for host in nm_result.all_hosts():
            host_info = nm_result[host]
            os_info = None
            if "osmatch" in host_info and host_info["osmatch"]:
                os_info = host_info["osmatch"][0]["name"]
            for proto in host_info.all_protocols():
                ports = host_info[proto].keys()
                for port in ports:
                    port_info = host_info[proto][port]
                    if port_info["state"] == "open":
                        finding = {
                            "title": f"Open Port: {port}/{proto}",
                            "description": f"Port {port}/{proto} is open on {host}",
                            "severity": self._determine_severity(port, port_info),
                            "affected_asset": host,
                            "port": port,
                            "protocol": proto,
                            "service": port_info.get("name", "unknown"),
                            "affected_component": f"{port_info.get('name', 'unknown')} {port_info.get('version', '')}".strip(),
                            "metadata": {
                                "state": port_info["state"],
                                "reason": port_info.get("reason", ""),
                                "product": port_info.get("product", ""),
                                "version": port_info.get("version", ""),
                                "extrainfo": port_info.get("extrainfo", ""),
                                "os": os_info,
                            },
                        }
                        findings.append(finding)
        return findings

    def _determine_severity(self, port: int, port_info: Dict) -> str:
        service = port_info.get("name", "").lower()
        critical_services = ["telnet", "ftp", "rsh", "rlogin"]
        critical_ports = [23, 21, 514, 513]
        if service in critical_services or port in critical_ports:
            return "high"
        high_risk_services = ["mysql", "postgresql", "mongodb", "redis", "smb"]
        high_risk_ports = [3306, 5432, 27017, 6379, 445, 139]
        if service in high_risk_services or port in high_risk_ports:
            return "medium"
        common_services = ["http", "https", "ssh", "smtp", "dns"]
        if service in common_services:
            return "low"
        return "info"

    def validate_target(self, target: str) -> bool:
        if not super().validate_target(target):
            return False
        return True
