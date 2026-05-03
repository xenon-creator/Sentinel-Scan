"""
Report Generator — Produces JSON and HTML reports from scan results.
"""

import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape
from backend.core.logger import get_logger

logger = get_logger("report_generator")

TEMPLATE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates"
)


class ReportGenerator:
    """Generates scan reports in JSON and HTML formats."""

    def __init__(self, output_dir: str = "./reports"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.jinja_env = Environment(
            loader=FileSystemLoader(TEMPLATE_DIR),
            autoescape=select_autoescape(["html", "xml"]),
        )

    def build_severity_summary(self, findings: List[Dict[str, Any]]) -> Dict[str, int]:
        summary = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        for f in findings:
            sev = f.get("severity", "info").lower()
            if sev in summary:
                summary[sev] += 1
        return summary

    def generate_json_report(
        self, scan_id: str, target: str, scan_type: str,
        findings: List[Dict], scan_duration: Optional[float] = None,
        metadata: Optional[Dict] = None,
    ) -> str:
        severity_summary = self.build_severity_summary(findings)
        report = {
            "report_id": f"report_{scan_id}",
            "scan_id": scan_id,
            "target": target,
            "scan_type": scan_type,
            "scan_date": datetime.utcnow().isoformat(),
            "scan_duration_seconds": scan_duration,
            "total_vulnerabilities": len(findings),
            "severity_summary": severity_summary,
            "vulnerabilities": findings,
            "metadata": metadata or {},
        }
        filename = f"{scan_type}_report_{scan_id}.json"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"JSON report saved: {filepath}")
        return os.path.abspath(filepath)

    def generate_html_report(
        self, scan_id: str, target: str, scan_type: str,
        findings: List[Dict], scan_duration: Optional[float] = None,
        metadata: Optional[Dict] = None,
    ) -> str:
        severity_summary = self.build_severity_summary(findings)
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
        sorted_findings = sorted(
            findings, key=lambda f: severity_order.get(f.get("severity", "info").lower(), 5)
        )
        template = self.jinja_env.get_template("scan_report.html")
        html_content = template.render(
            report_id=f"report_{scan_id}", scan_id=scan_id, target=target,
            scan_type=scan_type.upper(),
            scan_date=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            scan_duration=f"{scan_duration:.1f}s" if scan_duration else "N/A",
            total_vulnerabilities=len(findings),
            severity_summary=severity_summary, findings=sorted_findings,
            metadata=metadata or {},
            generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        )
        filename = f"{scan_type}_report_{scan_id}.html"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)
        logger.info(f"HTML report saved: {filepath}")
        return os.path.abspath(filepath)
