from datetime import datetime
from typing import Dict, List, Optional

from backend.core.plugin_manager import plugin_manager
from backend.db.mongodb import MongoDB
from backend.models.finding import FindingDocument
from backend.models.scan import ScanStatus


class ScanOrchestrator:

    def __init__(self):
        self.plugin_manager = plugin_manager

    async def execute_scan(
        self,
        scan_id: str,
        target: str,
        scan_types: List[str],
        options: Optional[Dict] = None,
    ) -> Dict:
        db = MongoDB.get_database()
        await db.scans.update_one(
            {"scan_id": scan_id},
            {
                "$set": {
                    "status": ScanStatus.RUNNING.value,
                    "started_at": datetime.utcnow(),
                }
            },
        )
        all_findings = []
        scan_errors = []
        try:
            for scan_type in scan_types:
                plugin_names = self.plugin_manager.get_plugins_for_scan_type(scan_type)
                for plugin_name in plugin_names:
                    try:
                        result = await self.plugin_manager.execute_scan(
                            plugin_name=plugin_name, target=target, options=options
                        )
                        if result.status == "success":
                            for finding_data in result.findings:
                                finding_doc = FindingDocument(
                                    scan_id=scan_id,
                                    scanner_name=plugin_name,
                                    **finding_data
                                )
                                await db.findings.insert_one(finding_doc.model_dump())
                                all_findings.append(finding_doc)
                        else:
                            scan_errors.append(
                                {"plugin": plugin_name, "error": result.error_message}
                            )
                    except Exception as e:
                        scan_errors.append({"plugin": plugin_name, "error": str(e)})
            severity_breakdown = self._calculate_severity_breakdown(all_findings)
            await db.scans.update_one(
                {"scan_id": scan_id},
                {
                    "$set": {
                        "status": ScanStatus.COMPLETED.value,
                        "completed_at": datetime.utcnow(),
                        "findings_count": len(all_findings),
                        "severity_breakdown": severity_breakdown,
                        "progress": 100,
                        "errors": scan_errors,
                    }
                },
            )
            return {
                "scan_id": scan_id,
                "status": "completed",
                "findings_count": len(all_findings),
                "severity_breakdown": severity_breakdown,
                "errors": scan_errors,
            }
        except Exception as e:
            await db.scans.update_one(
                {"scan_id": scan_id},
                {
                    "$set": {
                        "status": ScanStatus.FAILED.value,
                        "completed_at": datetime.utcnow(),
                        "error_message": str(e),
                    }
                },
            )
            return {"scan_id": scan_id, "status": "failed", "error": str(e)}

    def _calculate_severity_breakdown(
        self, findings: List[FindingDocument]
    ) -> Dict[str, int]:
        breakdown = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        for finding in findings:
            severity = finding.severity.lower()
            if severity in breakdown:
                breakdown[severity] += 1
        return breakdown


scan_orchestrator = ScanOrchestrator()
