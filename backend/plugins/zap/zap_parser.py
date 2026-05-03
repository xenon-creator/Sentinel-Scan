"""
ZAP Parser — Transforms raw OWASP ZAP alerts into Sentinel-Scan findings.

Handles risk-level normalization, field mapping, and report generation
in both JSON and structured-dict formats.
"""

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from backend.core.logger import get_logger

logger = get_logger("zap.parser")

# Map ZAP risk levels to Sentinel-Scan severity values
ZAP_RISK_MAP = {
    "High": "high",
    "Medium": "medium",
    "Low": "low",
    "Informational": "info",
    "3": "high",
    "2": "medium",
    "1": "low",
    "0": "info",
}

# Map ZAP confidence levels for metadata
ZAP_CONFIDENCE_MAP = {
    "High": "high",
    "Medium": "medium",
    "Low": "low",
    "User Confirmed": "confirmed",
    "False Positive": "false_positive",
    "3": "high",
    "2": "medium",
    "1": "low",
    "4": "confirmed",
    "0": "false_positive",
}


class ZapParser:
    """
    Parses raw ZAP alert data into Sentinel-Scan-compatible finding dicts,
    and generates standalone JSON/HTML reports.
    """

    def __init__(self, target: str):
        self.target = target

    def normalize_risk(self, risk: str) -> str:
        """Convert a ZAP risk string/integer to a Sentinel-Scan severity."""
        return ZAP_RISK_MAP.get(str(risk), "info")

    def normalize_confidence(self, confidence: str) -> str:
        """Convert a ZAP confidence string/integer to a readable label."""
        return ZAP_CONFIDENCE_MAP.get(str(confidence), "unknown")

    def parse_alerts(self, alerts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Convert a list of raw ZAP alert dictionaries into Sentinel-Scan
        finding dictionaries compatible with ``FindingDocument``.

        Args:
            alerts: Raw alert list from ``zap.core.alerts()``.

        Returns:
            List of finding dicts ready for database insertion.
        """
        findings = []
        seen = set()  # De-duplicate by (alert name, url)

        for alert in alerts:
            key = (alert.get("alert", ""), alert.get("url", ""))
            if key in seen:
                continue
            seen.add(key)

            cwe_id = alert.get("cweid", "")
            if cwe_id and cwe_id != "-1" and cwe_id != "0":
                cwe_id = f"CWE-{cwe_id}"
            else:
                cwe_id = None

            # Build reference list from the reference field (newline-separated)
            raw_refs = alert.get("reference", "")
            references = [
                r.strip() for r in raw_refs.split("\n") if r.strip()
            ] if raw_refs else []

            finding = {
                "title": alert.get("alert", "Unknown Vulnerability"),
                "description": alert.get("description", "No description available."),
                "severity": self.normalize_risk(alert.get("risk", "Informational")),
                "affected_asset": self.target,
                "affected_component": alert.get("url", self.target),
                "remediation": alert.get("solution", "No solution provided."),
                "cwe_id": cwe_id,
                "references": references,
                "metadata": {
                    "scanner": "zap",
                    "zap_alert_ref": alert.get("alertRef", ""),
                    "zap_plugin_id": alert.get("pluginId", ""),
                    "confidence": self.normalize_confidence(
                        alert.get("confidence", "")
                    ),
                    "evidence": alert.get("evidence", ""),
                    "method": alert.get("method", ""),
                    "param": alert.get("param", ""),
                    "attack": alert.get("attack", ""),
                    "other_info": alert.get("other", ""),
                    "tags": alert.get("tags", {}),
                },
            }
            findings.append(finding)

        logger.info(
            f"Parsed {len(findings)} unique findings from {len(alerts)} raw alerts"
        )
        return findings

    def build_severity_summary(
        self, findings: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """
        Build a severity breakdown from parsed findings.

        Returns:
            Dict mapping severity levels to counts.
        """
        summary = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        for finding in findings:
            severity = finding.get("severity", "info").lower()
            if severity in summary:
                summary[severity] += 1
        return summary

    def build_json_report(
        self,
        findings: List[Dict[str, Any]],
        scan_duration: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Build the standalone JSON report structure as specified.

        Args:
            findings: Parsed finding dicts.
            scan_duration: Total scan time in seconds.

        Returns:
            Complete report dictionary.
        """
        severity_summary = self.build_severity_summary(findings)

        # Also build vulnerability list in the simpler report format
        vulnerabilities = []
        for f in findings:
            vulnerabilities.append({
                "name": f["title"],
                "risk": f["severity"],
                "url": f.get("affected_component", self.target),
                "description": f["description"],
                "solution": f.get("remediation", ""),
                "cwe": f.get("cwe_id", ""),
                "confidence": f.get("metadata", {}).get("confidence", ""),
            })

        report = {
            "target": self.target,
            "scan_type": "zap",
            "scan_date": datetime.now(timezone.utc).isoformat(),
            "scan_duration_seconds": scan_duration,
            "total_vulnerabilities": len(findings),
            "severity_summary": severity_summary,
            "vulnerabilities": vulnerabilities,
        }
        return report

    def save_json_report(
        self,
        report: Dict[str, Any],
        output_dir: str,
        filename: Optional[str] = None,
    ) -> str:
        """
        Save the JSON report to disk.

        Args:
            report: Report dictionary.
            output_dir: Directory to save the report in.
            filename: Optional filename (default: zap_report_<timestamp>.json).

        Returns:
            Absolute path to the saved file.
        """
        os.makedirs(output_dir, exist_ok=True)

        if not filename:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"zap_report_{timestamp}.json"

        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        logger.info(f"JSON report saved to {filepath}")
        return os.path.abspath(filepath)
